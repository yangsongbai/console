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

import React from 'react';

import { EuiBasicTable, EuiCode, EuiFlyout, EuiFlyoutBody, EuiText } from '@elastic/eui';

export const UrlTemplateFlyout = ({ isVisible = false, onClose = () => {} }) => {
  return isVisible ? (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutBody>
        <EuiText>
          <h3>
            Url Template
          </h3>
          <p>
            If a field only contains part of a URL then a <strong>
                    Url Template
                  </strong> can be used to format the value as
              a complete URL. The format is a string which uses double curly brace notation <EuiCode>{'{{ }}'}</EuiCode> to inject values.
              The following values can be accessed:
          </p>
          <ul>
            <li>
              <EuiCode>value</EuiCode> &mdash;&nbsp;
              The URI-escaped value
            </li>
            <li>
              <EuiCode>rawValue</EuiCode> &mdash;&nbsp;
              The unescaped value
            </li>
          </ul>
          <h4>
            Examples
          </h4>
          <EuiBasicTable
            items={[
              {
                input: 1234,
                template: 'http://company.net/profiles?user_id={{value}}',
                output: 'http://company.net/profiles?user_id=1234',
              },
              {
                input: 'users/admin',
                template: 'http://company.net/groups?id={{value}}',
                output: 'http://company.net/groups?id=users%2Fadmin',
              },
              {
                input: '/images/favicon.ico',
                template: 'http://www.site.com{{rawValue}}',
                output: 'http://www.site.com/images/favicon.ico',
              },
            ]}
            columns={[
              {
                field: 'input',
                name:  'Input',
                width: '160px',
              },
              {
                field: 'template',
                name: 'Template'
              },
              {
                field: 'output',
                name: 'Output'
              },
            ]}
          />
        </EuiText>
      </EuiFlyoutBody>
    </EuiFlyout>
  ) : null;
};
