/* Copyright © INFINI Ltd. All rights reserved.
 * web: https://infinilabs.com
 * mail: hello#infini.ltd */

package alerting

import (
	"fmt"
	"regexp"
)

type Metric struct {
	PeriodInterval string `json:"period_interval"`
	MaxPeriods int `json:"max_periods"`
	Items []MetricItem `json:"items"`
	Formula string `json:"formula,omitempty"`
	Expression string `json:"expression" elastic_mapping:"expression:{type:keyword,copy_to:search_text}"` //告警表达式，自动生成 eg: avg(cpu) > 80
	Title string `json:"title"` //text template
	Message string `json:"message"` // text template
}
func (m *Metric) GenerateExpression() (string, error){
	if len(m.Items) == 1 {
		return fmt.Sprintf("%s(%s)", m.Items[0].Statistic, m.Items[0].Field), nil
	}
	if m.Formula == "" {
		return "", fmt.Errorf("formula should not be empty since there are %d metrics", len(m.Items))
	}
	var (
		expressionBytes = []byte(m.Formula)
		metricExpression string
	)
	for _, item := range m.Items {
		metricExpression = fmt.Sprintf("%s(%s)", item.Statistic, item.Field)
		reg, err := regexp.Compile(item.Name+`([^\w]|$)`)
		if err != nil {
			return "", err
		}
		expressionBytes = reg.ReplaceAll(expressionBytes, []byte(metricExpression+"$1"))
	}

	return string(expressionBytes), nil
}

type MetricItem struct {
	Name string `json:"name"`
	Field string `json:"field"`
	Statistic string `json:"statistic"`
	Group []string `json:"group"` //bucket group
	Limit int `json:"limit"`
}

type QueryResult struct {
	Query string `json:"query"`
	Raw string `json:"raw"`
	MetricData []MetricData `json:"metric_data"`
}

type MetricData struct {
	GroupValues []string `json:"group_values"`
	Data map[string][]TimeMetricData `json:"data"`
}

type TimeMetricData []interface{}