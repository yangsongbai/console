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

import React, { useEffect, useRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { MountPoint } from '../types';

const defaultWrapperClass = 'kbnMountWrapper';

/**
 * MountWrapper is a react component to mount a {@link MountPoint} inside a react tree.
 */
export const MountWrapper: React.FunctionComponent<{ mount: MountPoint; className?: string }> = ({
  mount,
  className = defaultWrapperClass,
}) => {
  const element = useRef(null);
  useEffect(() => mount(element.current!), [mount]);
  return <div className={className} ref={element} />;
};

/**
 * Mount converter for react node.
 *
 * @param node to get a mount for
 */
export const mountReactNode = (node: React.ReactNode): MountPoint => (element: HTMLElement) => {
  render(<>{node}</>, element);
  return () => unmountComponentAtNode(element);
};
