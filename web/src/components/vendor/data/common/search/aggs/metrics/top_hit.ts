/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';
import { IMetricAggConfig, MetricAggType } from './metric_agg_type';
import { METRIC_TYPES } from './metric_agg_types';
import { KBN_FIELD_TYPES } from '../../../../common';
import { BaseAggParams } from '../types';

export interface AggParamsTopHit extends BaseAggParams {
  field: string;
  aggregate: 'min' | 'max' | 'sum' | 'average' | 'concat';
  sortField?: string;
  size?: number;
  sortOrder?: 'desc' | 'asc';
}

const isNumericFieldSelected = (agg: IMetricAggConfig) => {
  const field = agg.getParam('field');

  return field && field.type && field.type === KBN_FIELD_TYPES.NUMBER;
};

export const getTopHitMetricAgg = () => {
  return new MetricAggType({
    name: METRIC_TYPES.TOP_HITS,
    title: 'Top Hit',
    makeLabel(aggConfig) {
      const lastPrefixLabel =  'Last';
      const firstPrefixLabel = 'First';

      let prefix =
        aggConfig.getParam('sortOrder').value === 'desc' ? lastPrefixLabel : firstPrefixLabel;

      const size = aggConfig.getParam('size');

      if (size !== 1) {
        prefix += ` ${size}`;
      }

      const field = aggConfig.getParam('field');

      return `${prefix} ${field ? field.displayName : ''}`;
    },
    params: [
      {
        name: 'field',
        type: 'field',
        onlyAggregatable: false,
        filterFieldTypes: Object.values(KBN_FIELD_TYPES).filter(
          (type) => type !== KBN_FIELD_TYPES.HISTOGRAM
        ),
        write(agg, output) {
          const field = agg.getParam('field');
          output.params = {};

          if (field.scripted) {
            output.params.script_fields = {
              [field.name]: {
                script: {
                  source: field.script,
                  lang: field.lang,
                },
              },
            };
          } else {
            if (field.readFromDocValues) {
              output.params.docvalue_fields = [
                {
                  field: field.name,
                  // always format date fields as date_time to avoid
                  // displaying unformatted dates like epoch_millis
                  // or other not-accepted momentjs formats
                  ...(field.type === KBN_FIELD_TYPES.DATE && { format: 'date_time' }),
                },
              ];
            }
            output.params._source = field.name === '_source' ? true : field.name;
          }
        },
      },
      {
        name: 'aggregate',
        type: 'optioned',
        options: [
          {
            text: 'Min',
            isCompatible: isNumericFieldSelected,
            disabled: true,
            value: 'min',
          },
          {
            text: 'Max',
            isCompatible: isNumericFieldSelected,
            disabled: true,
            value: 'max',
          },
          {
            text: 'Sum',
            isCompatible: isNumericFieldSelected,
            disabled: true,
            value: 'sum',
          },
          {
            text: 'Average',
            isCompatible: isNumericFieldSelected,
            disabled: true,
            value: 'average',
          },
          {
            text: 'Concatenate',
            isCompatible(aggConfig: IMetricAggConfig) {
              return _.get(aggConfig.params, 'field.filterFieldTypes', '*') === '*';
            },
            disabled: true,
            value: 'concat',
          },
        ],
        write: _.noop,
      },
      {
        name: 'size',
        default: 1,
      },
      {
        name: 'sortField',
        type: 'field',
        filterFieldTypes: [
          KBN_FIELD_TYPES.NUMBER,
          KBN_FIELD_TYPES.DATE,
          KBN_FIELD_TYPES.IP,
          KBN_FIELD_TYPES.STRING,
        ],
        default(agg: IMetricAggConfig) {
          return agg.getIndexPattern().timeFieldName;
        },
        write: _.noop, // prevent default write, it is handled below
      },
      {
        name: 'sortOrder',
        type: 'optioned',
        default: 'desc',
        options: [
          {
            text: 'Descending',
            value: 'desc',
          },
          {
            text: 'Ascending',
            value: 'asc',
          },
        ],
        write(agg, output) {
          const sortField = agg.params.sortField;
          const sortOrder = agg.params.sortOrder;

          if (sortField.scripted) {
            output.params.sort = [
              {
                _script: {
                  script: {
                    source: sortField.script,
                    lang: sortField.lang,
                  },
                  type: sortField.type,
                  order: sortOrder.value,
                },
              },
            ];
          } else {
            output.params.sort = [
              {
                [sortField.name]: {
                  order: sortOrder.value,
                },
              },
            ];
          }
        },
      },
    ],
    getValue(agg, bucket) {
      const hits: any[] = _.get(bucket, `${agg.id}.hits.hits`);
      if (!hits || !hits.length) {
        return null;
      }
      const path = agg.getParam('field').name;

      let values = _.flatten(
        hits.map((hit) =>
          path === '_source' ? hit._source : agg.getIndexPattern().flattenHit(hit, true)[path]
        )
      );

      if (values.length === 1) {
        values = values[0];
      }

      if (Array.isArray(values)) {
        if (!_.compact(values).length) {
          return null;
        }

        const aggregate = agg.getParam('aggregate');

        switch (aggregate.value) {
          case 'max':
            return _.max(values);
          case 'min':
            return _.min(values);
          case 'sum':
            return _.sum(values);
          case 'average':
            return _.sum(values) / values.length;
        }
      }
      return values;
    },
  });
};
