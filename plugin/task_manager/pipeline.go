/* Copyright © INFINI Ltd. All rights reserved.
 * Web: https://infinilabs.com
 * Email: hello#infini.ltd */

package task_manager

import (
	"errors"
	"fmt"
	"time"

	log "github.com/cihub/seelog"

	"infini.sh/console/plugin/task_manager/cluster_comparison"
	"infini.sh/console/plugin/task_manager/cluster_migration"
	"infini.sh/console/plugin/task_manager/index_comparison"
	"infini.sh/console/plugin/task_manager/index_migration"
	migration_model "infini.sh/console/plugin/task_manager/model"
	"infini.sh/console/plugin/task_manager/pipeline_task"
	"infini.sh/console/plugin/task_manager/scheduler"
	migration_util "infini.sh/console/plugin/task_manager/util"

	"infini.sh/framework/core/config"
	"infini.sh/framework/core/elastic"
	"infini.sh/framework/core/env"
	"infini.sh/framework/core/global"
	"infini.sh/framework/core/pipeline"
	"infini.sh/framework/core/task"
	"infini.sh/framework/core/util"
	"infini.sh/framework/modules/elastic/common"
)

type DispatcherProcessor struct {
	id     string
	config *DispatcherConfig

	scheduler                      migration_model.Scheduler
	pipelineTaskProcessor          migration_model.Processor
	clusterMigrationTaskProcessor  migration_model.Processor
	indexMigrationTaskProcessor    migration_model.Processor
	clusterComparisonTaskProcessor migration_model.Processor
	indexComparisonTaskProcessor   migration_model.Processor
}

type DispatcherConfig struct {
	Elasticsearch          string `config:"elasticsearch,omitempty"`
	IndexName              string `config:"index_name"`
	LogIndexName           string `config:"log_index_name"`
	MaxTasksPerInstance    int    `config:"max_tasks_per_instance"`
	CheckInstanceAvailable bool   `config:"check_instance_available"`
	TaskBatchSize          int    `config:"task_batch_size"`
}

func init() {
	pipeline.RegisterProcessorPlugin("migration_dispatcher", newMigrationDispatcherProcessor)
}

func newMigrationDispatcherProcessor(c *config.Config) (pipeline.Processor, error) {

	cfg := DispatcherConfig{}
	if err := c.Unpack(&cfg); err != nil {
		log.Errorf("failed to unpack config, err: %v", err)
		return nil, fmt.Errorf("failed to unpack the configuration of migration dispatcher processor: %s", err)
	}
	if cfg.IndexName == "" || cfg.LogIndexName == "" {
		ormConfig := common.ORMConfig{}
		ok, err := env.ParseConfig("elastic.orm", &ormConfig)
		if ok && err == nil {
			if cfg.IndexName == "" {
				cfg.IndexName = fmt.Sprintf("%stask", ormConfig.IndexPrefix)
			}
			if cfg.LogIndexName == "" {
				cfg.LogIndexName = fmt.Sprintf("%slogs", ormConfig.IndexPrefix)
			}
		} else {
			err = fmt.Errorf("parse config elastic.orm error: %w", err)
			log.Errorf("failed to parse elastic.orm, err: %v", err)
			return nil, err
		}
	}
	global.Register("cluster_migration_config", &cfg)
	if cfg.MaxTasksPerInstance <= 0 {
		cfg.MaxTasksPerInstance = 10
	}
	if cfg.TaskBatchSize <= 0 {
		cfg.TaskBatchSize = 50
	}

	//query and then init dispatcher state
	processor := DispatcherProcessor{
		id:     util.GetUUID(),
		config: &cfg,
	}
	var err error
	processor.scheduler, err = scheduler.NewScheduler(cfg.Elasticsearch, cfg.IndexName, cfg.CheckInstanceAvailable, cfg.MaxTasksPerInstance)
	if err != nil {
		return nil, err
	}
	processor.pipelineTaskProcessor = pipeline_task.NewProcessor(cfg.Elasticsearch, cfg.IndexName, cfg.LogIndexName, processor.scheduler)
	processor.indexMigrationTaskProcessor = index_migration.NewProcessor(cfg.Elasticsearch, cfg.IndexName, processor.scheduler)
	processor.clusterMigrationTaskProcessor = cluster_migration.NewProcessor(cfg.Elasticsearch, cfg.IndexName, processor.scheduler)
	processor.indexComparisonTaskProcessor = index_comparison.NewProcessor(cfg.Elasticsearch, cfg.IndexName, processor.scheduler)
	processor.clusterComparisonTaskProcessor = cluster_comparison.NewProcessor(cfg.Elasticsearch, cfg.IndexName, processor.scheduler)

	return &processor, nil
}

func (p *DispatcherProcessor) Name() string {
	return "migration_dispatcher"
}

func (p *DispatcherProcessor) Process(ctx *pipeline.Context) error {
	// handle repeating tasks
	p.handleRepeatingTasks(ctx, "cluster_comparison")
	p.handleRepeatingTasks(ctx, "cluster_migration")

	// handle pipeline task
	p.handleTasks(ctx, "pipeline", []string{task.StatusReady, task.StatusRunning, task.StatusPendingStop}, p.pipelineTaskProcessor.Process)

	// handle comparison tasks
	p.handleTasks(ctx, "cluster_comparison", []string{task.StatusPendingStop}, p.clusterComparisonTaskProcessor.Process)
	p.handleTasks(ctx, "index_comparison", []string{task.StatusPendingStop}, p.indexComparisonTaskProcessor.Process)
	p.handleTasks(ctx, "index_comparison", []string{task.StatusRunning}, p.indexComparisonTaskProcessor.Process)
	p.handleTasks(ctx, "index_comparison", []string{task.StatusReady}, p.indexComparisonTaskProcessor.Process)
	p.handleTasks(ctx, "cluster_comparison", []string{task.StatusRunning}, p.clusterComparisonTaskProcessor.Process)
	p.handleTasks(ctx, "cluster_comparison", []string{task.StatusReady}, p.clusterComparisonTaskProcessor.Process)

	// handle migration tasks
	p.handleTasks(ctx, "cluster_migration", []string{task.StatusPendingStop}, p.clusterMigrationTaskProcessor.Process)
	p.handleTasks(ctx, "index_migration", []string{task.StatusPendingStop}, p.indexMigrationTaskProcessor.Process)
	p.handleTasks(ctx, "index_migration", []string{task.StatusRunning}, p.indexMigrationTaskProcessor.Process)
	p.handleTasks(ctx, "index_migration", []string{task.StatusReady}, p.indexMigrationTaskProcessor.Process)
	p.handleTasks(ctx, "cluster_migration", []string{task.StatusRunning}, p.clusterMigrationTaskProcessor.Process)
	p.handleTasks(ctx, "cluster_migration", []string{task.StatusReady}, p.clusterMigrationTaskProcessor.Process)
	return nil
}

func (p *DispatcherProcessor) handleTasks(ctx *pipeline.Context, taskType string, taskStatus []string, taskHandler func(taskItem *task.Task) error) {
	tasks, err := p.getMigrationTasks(taskType, taskStatus, p.config.TaskBatchSize)
	if err != nil {
		log.Errorf("failed to get [%s] with status %s, err: %v", taskType, taskStatus, err)
		return
	}
	if len(tasks) == 0 {
		return
	}
	log.Debugf("handling [%s] with status [%s], count: %d", taskType, taskStatus, len(tasks))
	// refresh index after each batch
	defer func() {
		p.refreshTask()
	}()
	for i := range tasks {
		if ctx.IsCanceled() {
			return
		}
		taskItem := &tasks[i]
		err := p.handleTask(taskItem, taskHandler)
		if err != nil {
			log.Errorf("failed to handle task [%s]: [%v]", taskItem.ID, err)

			taskItem.Status = task.StatusError
			tn := time.Now()
			taskItem.CompletedTime = &tn
			p.saveTaskAndWriteLog(taskItem, &task.TaskResult{
				Success: false,
				Error:   err.Error(),
			}, fmt.Sprintf("failed to handle task [%s]", taskItem.ID))
		}
	}
	return
}

func (p *DispatcherProcessor) handleTask(taskItem *task.Task, taskHandler func(taskItem *task.Task) error) error {
	if taskItem.Metadata.Labels == nil {
		log.Errorf("got migration task [%s] with empty labels, skip handling", taskItem.ID)
		return errors.New("missing labels")
	}
	return taskHandler(taskItem)
}

func (p *DispatcherProcessor) getMigrationTasks(taskType string, taskStatus []string, size int) ([]task.Task, error) {
	queryDsl := util.MapStr{
		"size": size,
		"sort": []util.MapStr{
			{
				"created": util.MapStr{
					"order": "asc",
				},
			},
		},
		"query": util.MapStr{
			"bool": util.MapStr{
				"must": []util.MapStr{
					{
						"terms": util.MapStr{
							"status": taskStatus,
						},
					},
					{
						"term": util.MapStr{
							"metadata.type": util.MapStr{
								"value": taskType,
							},
						},
					},
				},
			},
		},
	}
	return migration_util.GetTasks(queryDsl)
}

func (p *DispatcherProcessor) saveTaskAndWriteLog(taskItem *task.Task, taskResult *task.TaskResult, message string) {
	esClient := elastic.GetClient(p.config.Elasticsearch)
	_, err := esClient.Index(p.config.IndexName, "", taskItem.ID, taskItem, "")
	if err != nil {
		log.Errorf("failed to update task, err: %v", err)
	}
	if message != "" {
		migration_util.WriteLog(taskItem, taskResult, message)
	}
}

func (p *DispatcherProcessor) refreshTask() {
	esClient := elastic.GetClient(p.config.Elasticsearch)
	err := esClient.Refresh(p.config.IndexName)
	if err != nil {
		log.Errorf("failed to refresh state, err: %v", err)
	}
}