package cluster_comparison

import (
	"fmt"
	"time"

	log "github.com/cihub/seelog"
	"infini.sh/console/model"
	migration_model "infini.sh/console/plugin/migration/model"
	migration_util "infini.sh/console/plugin/migration/util"

	"infini.sh/framework/core/elastic"
	"infini.sh/framework/core/orm"
	"infini.sh/framework/core/task"
	"infini.sh/framework/core/util"
)

type processor struct {
	Elasticsearch string
	IndexName     string
	scheduler     migration_model.Scheduler
}

func NewProcessor(elasticsearch, indexName string, scheduler migration_model.Scheduler) migration_model.Processor {
	return &processor{
		Elasticsearch: elasticsearch,
		IndexName:     indexName,
		scheduler:     scheduler,
	}
}

func (p *processor) Process(t *task.Task) (err error) {
	switch t.Status {
	case task.StatusReady:
		// split & schedule index_comparison tasks
		err = p.handleReadyMajorTask(t)
	case task.StatusRunning:
		// check index_comparison tasks status
		err = p.handleRunningMajorTask(t)
	case task.StatusPendingStop:
		// mark index_comparison as pending_stop
		err = p.handlePendingStopMajorTask(t)
	}
	return err
}

func (p *processor) handleReadyMajorTask(taskItem *task.Task) error {
	if ok, _ := util.ExtractBool(taskItem.Metadata.Labels["is_split"]); !ok {
		return p.splitMajorTask(taskItem)
	}
	// update status of subtask to ready
	err := migration_util.UpdateStoppedChildTasksToReady(taskItem, "index_comparison")
	if err != nil {
		log.Errorf("failed to update sub task status, err: %v", err)
		return nil
	}
	taskItem.RetryTimes++
	if taskItem.StartTimeInMillis == 0 {
		taskItem.StartTimeInMillis = time.Now().UnixMilli()
	}
	taskItem.Status = task.StatusRunning
	p.saveTaskAndWriteLog(taskItem, &task.TaskResult{
		Success: true,
	}, fmt.Sprintf("cluster comparison task [%s] started", taskItem.ID))
	p.sendMajorTaskNotification(taskItem)
	return nil
}

func (p *processor) splitMajorTask(taskItem *task.Task) error {
	clusterComparisonTask := migration_model.ClusterComparisonTaskConfig{}
	err := migration_util.GetTaskConfig(taskItem, &clusterComparisonTask)
	if err != nil {
		log.Errorf("failed to get task config, err: %v", err)
		return err
	}
	esSourceClient := elastic.GetClient(clusterComparisonTask.Cluster.Source.Id)
	esTargetClient := elastic.GetClient(clusterComparisonTask.Cluster.Target.Id)

	err = migration_util.DeleteChildTasks(taskItem.ID)
	if err != nil {
		log.Warnf("failed to clear child tasks, err: %v", err)
		return nil
	}

	for _, index := range clusterComparisonTask.Indices {
		sourceDump := migration_model.IndexComparisonDumpConfig{
			ClusterId:     clusterComparisonTask.Cluster.Source.Id,
			Indices:       index.Source.Name,
			DocCount:      index.Source.Docs,
			SliceSize:     clusterComparisonTask.Settings.Dump.SliceSize,
			BatchSize:     clusterComparisonTask.Settings.Dump.Docs,
			PartitionSize: clusterComparisonTask.Settings.Dump.PartitionSize,
			ScrollTime:    clusterComparisonTask.Settings.Dump.Timeout,
		}

		// TODO: dump_hash can only handle 1G file
		if sourceDump.PartitionSize <= 0 {
			sourceDump.PartitionSize = 1
		}

		if v, ok := index.RawFilter.(string); ok {
			sourceDump.QueryString = v
		} else {
			var must []interface{}
			if index.RawFilter != nil {
				must = append(must, index.RawFilter)
			}
			if len(must) > 0 {
				sourceDump.QueryDSL = util.MapStr{
					"bool": util.MapStr{
						"must": must,
					},
				}
			}
		}

		targetDump := sourceDump
		targetDump.ClusterId = clusterComparisonTask.Cluster.Target.Id
		targetDump.Indices = index.Target.Name
		targetDump.DocCount = index.Target.Docs

		if index.Partition == nil {
			indexComparisonTask := task.Task{
				ParentId:    []string{taskItem.ID},
				Cancellable: true,
				Runnable:    false,
				Status:      task.StatusReady,
				Metadata: task.Metadata{
					Type: "index_comparison",
					Labels: util.MapStr{
						"business_id":       "index_comparison",
						"source_cluster_id": clusterComparisonTask.Cluster.Source.Id,
						"target_cluster_id": clusterComparisonTask.Cluster.Target.Id,
						"partition_count":   1,
						"index_name":        index.Source.Name,
						"unique_index_name": index.Source.GetUniqueIndexName(),
					},
				},
				ConfigString: util.MustToJSON(migration_model.IndexComparisonTaskConfig{
					Source:    sourceDump,
					Target:    targetDump,
					Execution: clusterComparisonTask.Settings.Execution,
				}),
			}
			indexComparisonTask.ID = util.GetUUID()

			err = orm.Create(nil, &indexComparisonTask)
			if err != nil {
				return fmt.Errorf("store index comparison task error: %w", err)
			}
			continue
		}

		sourcePartitionQ := &elastic.PartitionQuery{
			IndexName: sourceDump.Indices,
			FieldName: index.Partition.FieldName,
			FieldType: index.Partition.FieldType,
			Step:      index.Partition.Step,
		}
		if sourceDump.QueryDSL != nil {
			sourcePartitionQ.Filter = sourceDump.QueryDSL
		}
		sourcePartitions, err := elastic.GetPartitions(sourcePartitionQ, esSourceClient)
		if err != nil {
			return err
		}

		targetPartitionQ := &elastic.PartitionQuery{
			IndexName: targetDump.Indices,
			FieldName: index.Partition.FieldName,
			FieldType: index.Partition.FieldType,
			Step:      index.Partition.Step,
		}
		if targetDump.QueryDSL != nil {
			targetPartitionQ.Filter = targetDump.QueryDSL
		}
		targetPartitions, err := elastic.GetPartitions(targetPartitionQ, esTargetClient)
		if err != nil {
			return err
		}

		partitions := elastic.MergePartitions(sourcePartitions, targetPartitions, index.Partition.FieldName, index.Partition.FieldType, targetPartitionQ.Filter)

		if len(partitions) == 0 {
			return fmt.Errorf("empty partitions")
		}

		var (
			partitionID int
		)
		for _, partition := range partitions {
			partitionID++
			partitionSourceDump := sourceDump
			partitionSourceDump.Start = partition.Start
			partitionSourceDump.End = partition.End
			partitionSourceDump.DocCount = partition.Docs
			partitionSourceDump.Step = index.Partition.Step
			partitionSourceDump.PartitionId = partitionID
			partitionSourceDump.QueryDSL = partition.Filter
			partitionSourceDump.QueryString = ""

			partitionTargetDump := partitionSourceDump
			partitionTargetDump.ClusterId = clusterComparisonTask.Cluster.Target.Id
			partitionTargetDump.Indices = index.Target.Name

			partitionComparisonTask := task.Task{
				ParentId:    []string{taskItem.ID},
				Cancellable: false,
				Runnable:    true,
				Status:      task.StatusReady,
				Metadata: task.Metadata{
					Type: "index_comparison",
					Labels: util.MapStr{
						"business_id":       "index_comparison",
						"source_cluster_id": clusterComparisonTask.Cluster.Source.Id,
						"target_cluster_id": clusterComparisonTask.Cluster.Target.Id,
						"index_name":        index.Source.Name,
						"unique_index_name": index.Source.GetUniqueIndexName(),
					},
				},
				ConfigString: util.MustToJSON(migration_model.IndexComparisonTaskConfig{
					Source:    partitionSourceDump,
					Target:    partitionTargetDump,
					Execution: clusterComparisonTask.Settings.Execution,
				}),
			}
			partitionComparisonTask.ID = util.GetUUID()
			err = orm.Create(nil, &partitionComparisonTask)
			if err != nil {
				return fmt.Errorf("store index comparison task (partition) error: %w", err)
			}
		}
	}

	taskItem.Metadata.Labels["is_split"] = true
	p.saveTaskAndWriteLog(taskItem, &task.TaskResult{
		Success: true,
	}, fmt.Sprintf("major task [%s] splitted", taskItem.ID))
	return nil
}

func (p *processor) handleRunningMajorTask(taskItem *task.Task) error {
	taskStatus, err := p.getMajorTaskState(taskItem)
	if err != nil {
		return err
	}
	if !(taskStatus == task.StatusComplete || taskStatus == task.StatusError) {
		return nil
	}

	var errMsg string

	if taskStatus == task.StatusError {
		errMsg = "index comparison(s) failed"
	}

	if errMsg == "" {
		taskItem.Status = task.StatusComplete
	} else {
		taskItem.Status = task.StatusError
	}
	tn := time.Now()
	taskItem.CompletedTime = &tn
	p.sendMajorTaskNotification(taskItem)
	p.saveTaskAndWriteLog(taskItem, &task.TaskResult{
		Success: errMsg == "",
		Error:   errMsg,
	}, fmt.Sprintf("cluster comparison task [%s] finished with status [%s]", taskItem.ID, taskItem.Status))
	return nil
}

func (p *processor) getMajorTaskState(majorTask *task.Task) (string, error) {
	query := util.MapStr{
		"size": 0,
		"aggs": util.MapStr{
			"count": util.MapStr{
				"terms": util.MapStr{
					"field": "*",
				},
			},
			"grp": util.MapStr{
				"terms": util.MapStr{
					"field": "status",
				},
			},
		},
		"query": util.MapStr{
			"bool": util.MapStr{
				"must": []util.MapStr{
					{
						"term": util.MapStr{
							"parent_id": util.MapStr{
								"value": majorTask.ID,
							},
						},
					},
					{
						"term": util.MapStr{
							"metadata.type": util.MapStr{
								"value": "index_comparison",
							},
						},
					},
				},
			},
		},
	}
	esClient := elastic.GetClient(p.Elasticsearch)
	res, err := esClient.SearchWithRawQueryDSL(p.IndexName, util.MustToJSONBytes(query))
	if err != nil {
		log.Errorf("search es failed, err: %v", err)
		return "", nil
	}
	var (
		hasError bool
	)
	for _, bk := range res.Aggregations["grp"].Buckets {
		statusKey, _ := util.ExtractString(bk["key"])
		if migration_util.IsRunningState(statusKey) {
			return task.StatusRunning, nil
		}
		if statusKey == task.StatusError {
			hasError = true
		}
	}
	if hasError {
		return task.StatusError, nil
	}
	return task.StatusComplete, nil
}

func (p *processor) handlePendingStopMajorTask(taskItem *task.Task) error {
	err := migration_util.UpdatePendingChildTasksToPendingStop(taskItem, "index_comparison")
	if err != nil {
		log.Errorf("failed to update sub task status, err: %v", err)
		return nil
	}

	tasks, err := migration_util.GetPendingChildTasks(p.Elasticsearch, p.IndexName, taskItem.ID, "index_comparison")
	if err != nil {
		log.Errorf("failed to get sub tasks, err: %v", err)
		return nil
	}

	// all subtask stopped or error or complete
	if len(tasks) == 0 {
		taskItem.Status = task.StatusStopped
		p.sendMajorTaskNotification(taskItem)
		p.saveTaskAndWriteLog(taskItem, nil, fmt.Sprintf("cluster comparison task [%s] stopped", taskItem.ID))
		// NOTE: we don't know how many running index_comparison's stopped, so do a refresh from ES
		p.scheduler.RefreshInstanceJobsFromES()
	}
	return nil
}

func (p *processor) saveTaskAndWriteLog(taskItem *task.Task, taskResult *task.TaskResult, message string) {
	esClient := elastic.GetClient(p.Elasticsearch)
	_, err := esClient.Index(p.IndexName, "", taskItem.ID, taskItem, "")
	if err != nil {
		log.Errorf("failed to update task, err: %v", err)
	}
	if message != "" {
		migration_util.WriteLog(taskItem, taskResult, message)
	}
}

func (p *processor) sendMajorTaskNotification(taskItem *task.Task) {
	config := migration_model.ClusterComparisonTaskConfig{}
	err := migration_util.GetTaskConfig(taskItem, &config)
	if err != nil {
		log.Errorf("failed to parse config info from major task, id: %s, err: %v", taskItem.ID, err)
		return
	}

	creatorID := config.Creator.Id

	var title, body string
	body = fmt.Sprintf("From Cluster: [%s (%s)], To Cluster: [%s (%s)]", config.Cluster.Source.Id, config.Cluster.Source.Name, config.Cluster.Target.Id, config.Cluster.Target.Name)
	link := fmt.Sprintf("/#/data_tools/comparison/%s/detail", taskItem.ID)
	switch taskItem.Status {
	case task.StatusReady:
		log.Debugf("skip sending notification for ready task, id: %s", taskItem.ID)
		return
	case task.StatusStopped:
		title = fmt.Sprintf("Data Comparison Stopped")
	case task.StatusComplete:
		title = fmt.Sprintf("Data Comparison Completed")
	case task.StatusError:
		title = fmt.Sprintf("Data Comparison Failed")
	case task.StatusRunning:
		title = fmt.Sprintf("Data Comparison Started")
	default:
		log.Warnf("skip sending notification for invalid task status, id: %s", taskItem.ID)
		return
	}
	notification := &model.Notification{
		UserId:      util.ToString(creatorID),
		Type:        model.NotificationTypeNotification,
		MessageType: model.MessageTypeComparison,
		Status:      model.NotificationStatusNew,
		Title:       title,
		Body:        body,
		Link:        link,
	}
	err = orm.Create(nil, notification)
	if err != nil {
		log.Errorf("failed to create notification, err: %v", err)
		return
	}
	return
}