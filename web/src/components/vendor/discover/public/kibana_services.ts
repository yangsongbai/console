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

import _ from "lodash";
import { createHashHistory } from "history";
import { ScopedHistory, AppMountParameters } from "kibana/public";
import { UiActionsStart } from "src/plugins/ui_actions/public";
import { DiscoverServices } from "./build_services";
import { createGetterSetter } from "../../utils/common/";
import { search } from "../../data/public";
import { DocViewsRegistry } from "./application/doc_views/doc_views_registry";
import { JsonCodeBlock } from "./application/components/json_code_block/json_code_block";
import { DocViewTable } from "./application/components/table/table";

let angularModule: any = null;
let services: DiscoverServices | null = null;
let uiActions: UiActionsStart;

/**
 * set bootstrapped inner angular module
 */
export function setAngularModule(module: any) {
  angularModule = module;
}

/**
 * get boostrapped inner angular module
 */
export function getAngularModule() {
  return angularModule;
}

export function getServices(): DiscoverServices {
  if (!services) {
    throw new Error("Discover services are not yet available");
  }
  return services;
}

export function setServices(newServices: any) {
  services = newServices;
}

export const setUiActions = (pluginUiActions: UiActionsStart) =>
  (uiActions = pluginUiActions);
export const getUiActions = () => uiActions;

export const [
  getHeaderActionMenuMounter,
  setHeaderActionMenuMounter,
] = createGetterSetter<AppMountParameters["setHeaderActionMenu"]>(
  "headerActionMenuMounter"
);

export const [getUrlTracker, setUrlTracker] = createGetterSetter<{
  setTrackedUrl: (url: string) => void;
  restorePreviousUrl: () => void;
}>("urlTracker");

export const [getDocViewsRegistry, setDocViewsRegistry] = createGetterSetter<
  DocViewsRegistry
>("DocViewsRegistry");

const docViewsRegistry = new DocViewsRegistry();
setDocViewsRegistry(docViewsRegistry);
docViewsRegistry.addDocView({
  title: "Table",
  order: 10,
  component: DocViewTable,
});
docViewsRegistry.addDocView({
  title: "JSON",
  order: 20,
  component: JsonCodeBlock,
});
/**
 * Makes sure discover and context are using one instance of history.
 */
export const getHistory = _.once(() => createHashHistory());

/**
 * Discover currently uses two `history` instances: one from Kibana Platform and
 * another from `history` package. Below function is used every time Discover
 * app is loaded to synchronize both instances.
 *
 * This helper is temporary until https://github.com/elastic/kibana/issues/65161 is resolved.
 */
export const syncHistoryLocations = () => {
  const h = getHistory();
  Object.assign(h.location, createHashHistory().location);
  return h;
};

export const [getScopedHistory, setScopedHistory] = createGetterSetter<
  ScopedHistory
>("scopedHistory");

export const {
  getRequestInspectorStats,
  getResponseInspectorStats,
  tabifyAggResponse,
} = search;
export { unhashUrl } from "../../utils/public";
// export { formatMsg, formatStack, subscribeWithScope } from '../../kibana_legacy/public';

// EXPORT types
export {
  // IndexPatternsContract,
  IIndexPattern,
  IndexPattern,
  indexPatterns,
  IFieldType,
  ISearchSource,
  EsQuerySortValue,
  SortDirection,
} from "../../data/public";
