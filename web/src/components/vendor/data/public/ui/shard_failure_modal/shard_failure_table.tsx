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
import React, { useState, ReactElement } from 'react';
// @ts-ignore
import { EuiInMemoryTable, EuiButtonIcon } from '@elastic/eui';
// @ts-ignore
import { RIGHT_ALIGNMENT } from '@elastic/eui/lib/services';
import { ShardFailureDescription } from './shard_failure_description';
import { ShardFailure } from './shard_failure_types';
import { getFailureSummaryText } from './shard_failure_description_header';

export interface ListItem extends ShardFailure {
  id: string;
}

export function ShardFailureTable({ failures }: { failures: ShardFailure[] }) {
  const itemList = failures.map((failure, idx) => ({ ...{ id: String(idx) }, ...failure }));
  const initalMap = {} as Record<string, ReactElement>;

  const [expandMap, setExpandMap] = useState(initalMap);

  const columns = [
    {
      align: RIGHT_ALIGNMENT,
      width: '40px',
      isExpander: true,
      render: (item: ListItem) => {
        const failureSummeryText = getFailureSummaryText(item);
        const collapseLabel = `Collapse ${failureSummeryText}`;

        const expandLabel = `Expand ${failureSummeryText}`;

        return (
          <EuiButtonIcon
            onClick={() => {
              // toggle displaying the expanded view of the given list item
              const map = Object.assign({}, expandMap);
              if (map[item.id]) {
                delete map[item.id];
              } else {
                map[item.id] = <ShardFailureDescription {...item} />;
              }
              setExpandMap(map);
            }}
            aria-label={expandMap[item.id] ? collapseLabel : expandLabel}
            iconType={expandMap[item.id] ? 'arrowUp' : 'arrowDown'}
          />
        );
      },
    },
    {
      field: 'shard',
      name: 'Shard',
      sortable: true,
      truncateText: true,
      width: '80px',
    },
    {
      field: 'index',
      name: 'Index',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'node',
      name: 'Node',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'reason.type',
      name: 'Reason',
      truncateText: true,
    },
  ];

  return (
    <EuiInMemoryTable
      itemId="id"
      items={itemList}
      columns={columns}
      pagination={true}
      sorting={{
        sort: {
          field: 'index',
          direction: 'desc',
        },
      }}
      itemIdToExpandedRowMap={expandMap}
    />
  );
}
