/* Copyright © INFINI Ltd. All rights reserved.
 * Web: https://infinilabs.com
 * Email: hello#infini.ltd */

package action

import (
	"fmt"
	"infini.sh/console/model/alerting"
	"infini.sh/framework/core/queue"
	"infini.sh/framework/core/util"
)

type EmailAction struct {
	Data *alerting.Email
	Subject string
	Body string
}

const EmailQueueName = "email_messages"

func (act *EmailAction) Execute()([]byte, error){
	queueCfg := queue.GetOrInitConfig(EmailQueueName)
	if act.Data.ServerID == "" {
		return nil, fmt.Errorf("parameter server_id must not be empty")
	}
	emailMsg := util.MapStr{
		"server_id": act.Data.ServerID,
		"email": act.Data.Recipients.To,
		"template": "raw",
		"variables": util.MapStr{
			"subject": act.Subject,
			"body": act.Body,
			"content_type": act.Data.ContentType,
			"cc": act.Data.Recipients.CC,
		},
	}
	emailMsgBytes := util.MustToJSONBytes(emailMsg)
	err := queue.Push(queueCfg, emailMsgBytes)
	return nil, err
}