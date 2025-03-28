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
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { FieldMapping, DocViewFilterFn } from '../../doc_views/doc_views_types';
import { DocViewTableRowBtnFilterAdd } from './table_row_btn_filter_add';
import { DocViewTableRowBtnFilterRemove } from './table_row_btn_filter_remove';
import { DocViewTableRowBtnToggleColumn } from './table_row_btn_toggle_column';
import { DocViewTableRowBtnCollapse } from './table_row_btn_collapse';
import { DocViewTableRowBtnFilterExists } from './table_row_btn_filter_exists';
import { DocViewTableRowIconNoMapping } from './table_row_icon_no_mapping';
import { DocViewTableRowIconUnderscore } from './table_row_icon_underscore';
import { FieldName } from '../field_name/field_name';

export interface Props {
  field: string;
  fieldMapping?: FieldMapping;
  fieldType: string;
  displayNoMappingWarning: boolean;
  displayUnderscoreWarning: boolean;
  isCollapsible: boolean;
  isColumnActive: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFilter?: DocViewFilterFn;
  onToggleColumn?: () => void;
  value: string | ReactNode;
  valueRaw: unknown;
  filterIconRender?: (children: any, params: { field: any, values: any, operation: any }) => any;
}

export function DocViewTableRow({
  field,
  fieldMapping,
  fieldType,
  displayNoMappingWarning,
  displayUnderscoreWarning,
  isCollapsible,
  isCollapsed,
  isColumnActive,
  onFilter,
  onToggleCollapse,
  onToggleColumn,
  value,
  valueRaw,
  filterIconRender,
}: Props) {
  const valueClassName = classNames({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    kbnDocViewer__value: true,
    'truncate-by-height': isCollapsible && isCollapsed,
  });

  const renderFilterIcon = (children: any, operation: any) => {
    if (!filterIconRender || (!fieldMapping || !fieldMapping.filterable)) return children;
    return filterIconRender(children, { field: fieldMapping, values: valueRaw, operation})
  }

  return (
    <tr key={field} data-test-subj={`tableDocViewRow-${field}`}>
      
        <td className="kbnDocViewer__buttons">
          {typeof onFilter === 'function' && (
            <>
              {
                renderFilterIcon((
                  <DocViewTableRowBtnFilterAdd
                    disabled={!fieldMapping || !fieldMapping.filterable}
                    onClick={() => onFilter(fieldMapping, valueRaw, '+')}
                  />
                ), '+')
              }
              {
                renderFilterIcon((
                  <DocViewTableRowBtnFilterRemove
                    disabled={!fieldMapping || !fieldMapping.filterable}
                    onClick={() => onFilter(fieldMapping, valueRaw, '-')}
                  />
                ), '-')
              }
              <DocViewTableRowBtnFilterExists
                disabled={!fieldMapping || !fieldMapping.filterable}
                onClick={() => onFilter('_exists_', field, '+')}
                scripted={fieldMapping && fieldMapping.scripted}
              />
            </>
          )}
          {typeof onToggleColumn === 'function' && (
            <DocViewTableRowBtnToggleColumn active={isColumnActive} onClick={onToggleColumn} />
          )}
      </td>
      <td className="kbnDocViewer__field">
        <FieldName
          fieldName={field}
          fieldType={fieldType}
          fieldIconProps={{ fill: 'none', color: 'gray' }}
          scripted={Boolean(fieldMapping?.scripted)}
          useShortDots={true}
        />
      </td>
      <td>
        {isCollapsible && (
          <DocViewTableRowBtnCollapse onClick={onToggleCollapse} isCollapsed={isCollapsed} />
        )}
        {displayUnderscoreWarning && <DocViewTableRowIconUnderscore />}
        {/* {displayNoMappingWarning && <DocViewTableRowIconNoMapping />} */}
        <div
          className={valueClassName}
          data-test-subj={`tableDocViewRow-${field}-value`}
          /*
           * Justification for dangerouslySetInnerHTML:
           * We just use values encoded by our field formatters
           */
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: value as string }}
        />
      </td>
    </tr>
  );
}
