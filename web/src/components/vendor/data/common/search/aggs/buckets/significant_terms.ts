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

import { BucketAggType } from './bucket_agg_type';
import { createFilterTerms } from './create_filter/terms';
import { isStringType, migrateIncludeExcludeFormat } from './migrate_include_exclude_format';
import { BUCKET_TYPES } from './bucket_agg_types';
import { KBN_FIELD_TYPES } from '../../../../common';
import { BaseAggParams } from '../types';

const significantTermsTitle = 'Significant Terms';

export interface AggParamsSignificantTerms extends BaseAggParams {
  field: string;
  size?: number;
  exclude?: string;
  include?: string;
}

export const getSignificantTermsBucketAgg = () =>
  new BucketAggType({
    name: BUCKET_TYPES.SIGNIFICANT_TERMS,
    title: significantTermsTitle,
    makeLabel(aggConfig) {
      return `Top ${aggConfig.params.size} unusual terms in ${aggConfig.getFieldDisplayName()}`;
    },
    createFilter: createFilterTerms,
    params: [
      {
        name: 'field',
        type: 'field',
        scriptable: false,
        filterFieldTypes: KBN_FIELD_TYPES.STRING,
      },
      {
        name: 'size',
        default: '',
      },
      {
        name: 'exclude',
        displayName: 'Exclude',
        type: 'string',
        advanced: true,
        shouldShow: isStringType,
        ...migrateIncludeExcludeFormat,
      },
      {
        name: 'include',
        displayName: 'Include',
        type: 'string',
        advanced: true,
        shouldShow: isStringType,
        ...migrateIncludeExcludeFormat,
      },
    ],
  });
