## API Report File for "kibana"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { APICaller as APICaller_2 } from "kibana/server";
import Boom from "boom";
import { BulkIndexDocumentsParams } from "elasticsearch";
import { CallCluster as CallCluster_2 } from "src/legacy/core_plugins/elasticsearch";
import { CatAliasesParams } from "elasticsearch";
import { CatAllocationParams } from "elasticsearch";
import { CatCommonParams } from "elasticsearch";
import { CatFielddataParams } from "elasticsearch";
import { CatHealthParams } from "elasticsearch";
import { CatHelpParams } from "elasticsearch";
import { CatIndicesParams } from "elasticsearch";
import { CatRecoveryParams } from "elasticsearch";
import { CatSegmentsParams } from "elasticsearch";
import { CatShardsParams } from "elasticsearch";
import { CatSnapshotsParams } from "elasticsearch";
import { CatTasksParams } from "elasticsearch";
import { CatThreadPoolParams } from "elasticsearch";
import { ClearScrollParams } from "elasticsearch";
import { Client } from "elasticsearch";
import { ClusterAllocationExplainParams } from "elasticsearch";
import { ClusterGetSettingsParams } from "elasticsearch";
import { ClusterHealthParams } from "elasticsearch";
import { ClusterPendingTasksParams } from "elasticsearch";
import { ClusterPutSettingsParams } from "elasticsearch";
import { ClusterRerouteParams } from "elasticsearch";
import { ClusterStateParams } from "elasticsearch";
import { ClusterStatsParams } from "elasticsearch";
import { ConfigOptions } from "elasticsearch";
import { CountParams } from "elasticsearch";
import { CreateDocumentParams } from "elasticsearch";
import { DeleteDocumentByQueryParams } from "elasticsearch";
import { DeleteDocumentParams } from "elasticsearch";
import { DeleteScriptParams } from "elasticsearch";
import { DeleteTemplateParams } from "elasticsearch";
import { DetailedPeerCertificate } from "tls";
import { Duration } from "moment";
import { ExistsParams } from "elasticsearch";
import { ExplainParams } from "elasticsearch";
import { FieldStatsParams } from "elasticsearch";
import { GenericParams } from "elasticsearch";
import { GetParams } from "elasticsearch";
import { GetResponse } from "elasticsearch";
import { GetScriptParams } from "elasticsearch";
import { GetSourceParams } from "elasticsearch";
import { GetTemplateParams } from "elasticsearch";
import { IContextProvider as IContextProvider_2 } from "kibana/server";
import { IncomingHttpHeaders } from "http";
import { IndexDocumentParams } from "elasticsearch";
import { IndicesAnalyzeParams } from "elasticsearch";
import { IndicesClearCacheParams } from "elasticsearch";
import { IndicesCloseParams } from "elasticsearch";
import { IndicesCreateParams } from "elasticsearch";
import { IndicesDeleteAliasParams } from "elasticsearch";
import { IndicesDeleteParams } from "elasticsearch";
import { IndicesDeleteTemplateParams } from "elasticsearch";
import { IndicesExistsAliasParams } from "elasticsearch";
import { IndicesExistsParams } from "elasticsearch";
import { IndicesExistsTemplateParams } from "elasticsearch";
import { IndicesExistsTypeParams } from "elasticsearch";
import { IndicesFlushParams } from "elasticsearch";
import { IndicesFlushSyncedParams } from "elasticsearch";
import { IndicesForcemergeParams } from "elasticsearch";
import { IndicesGetAliasParams } from "elasticsearch";
import { IndicesGetFieldMappingParams } from "elasticsearch";
import { IndicesGetMappingParams } from "elasticsearch";
import { IndicesGetParams } from "elasticsearch";
import { IndicesGetSettingsParams } from "elasticsearch";
import { IndicesGetTemplateParams } from "elasticsearch";
import { IndicesGetUpgradeParams } from "elasticsearch";
import { IndicesOpenParams } from "elasticsearch";
import { IndicesPutAliasParams } from "elasticsearch";
import { IndicesPutMappingParams } from "elasticsearch";
import { IndicesPutSettingsParams } from "elasticsearch";
import { IndicesPutTemplateParams } from "elasticsearch";
import { IndicesRecoveryParams } from "elasticsearch";
import { IndicesRefreshParams } from "elasticsearch";
import { IndicesRolloverParams } from "elasticsearch";
import { IndicesSegmentsParams } from "elasticsearch";
import { IndicesShardStoresParams } from "elasticsearch";
import { IndicesShrinkParams } from "elasticsearch";
import { IndicesStatsParams } from "elasticsearch";
import { IndicesUpdateAliasesParams } from "elasticsearch";
import { IndicesUpgradeParams } from "elasticsearch";
import { IndicesValidateQueryParams } from "elasticsearch";
import { InfoParams } from "elasticsearch";
import { IngestDeletePipelineParams } from "elasticsearch";
import { IngestGetPipelineParams } from "elasticsearch";
import { IngestPutPipelineParams } from "elasticsearch";
import { IngestSimulateParams } from "elasticsearch";
import { KibanaConfigType as KibanaConfigType_2 } from "src/core/server/kibana_config";
import { Logger as Logger_2 } from "src/core/server/logging";
import { Logger as Logger_3 } from "kibana/server";
import { MGetParams } from "elasticsearch";
import { MGetResponse } from "elasticsearch";
import moment from "moment";
import { MSearchParams } from "elasticsearch";
import { MSearchResponse } from "elasticsearch";
import { MSearchTemplateParams } from "elasticsearch";
import { MTermVectorsParams } from "elasticsearch";
import { NodesHotThreadsParams } from "elasticsearch";
import { NodesInfoParams } from "elasticsearch";
import { NodesStatsParams } from "elasticsearch";
import { ObjectType } from "@kbn/config-schema";
import { Observable } from "rxjs";
import { PeerCertificate } from "tls";
import { PingParams } from "elasticsearch";
import { PutScriptParams } from "elasticsearch";
import { PutTemplateParams } from "elasticsearch";
import { RecursiveReadonly } from "kibana/public";
import { ReindexParams } from "elasticsearch";
import { ReindexRethrottleParams } from "elasticsearch";
import { RenderSearchTemplateParams } from "elasticsearch";
import { Request } from "hapi";
import { ResponseObject } from "hapi";
import { ResponseToolkit } from "hapi";
import { SchemaTypeError } from "@kbn/config-schema";
import { ScrollParams } from "elasticsearch";
import { SearchParams } from "elasticsearch";
import { SearchResponse } from "elasticsearch";
import { SearchShardsParams } from "elasticsearch";
import { SearchTemplateParams } from "elasticsearch";
import { ShallowPromise } from "@kbn/utility-types";
import { SnapshotCreateParams } from "elasticsearch";
import { SnapshotCreateRepositoryParams } from "elasticsearch";
import { SnapshotDeleteParams } from "elasticsearch";
import { SnapshotDeleteRepositoryParams } from "elasticsearch";
import { SnapshotGetParams } from "elasticsearch";
import { SnapshotGetRepositoryParams } from "elasticsearch";
import { SnapshotRestoreParams } from "elasticsearch";
import { SnapshotStatusParams } from "elasticsearch";
import { SnapshotVerifyRepositoryParams } from "elasticsearch";
import { Stream } from "stream";
import { SuggestParams } from "elasticsearch";
import { TasksCancelParams } from "elasticsearch";
import { TasksGetParams } from "elasticsearch";
import { TasksListParams } from "elasticsearch";
import { TermvectorsParams } from "elasticsearch";
import { Type } from "@kbn/config-schema";
import { TypeOf } from "@kbn/config-schema";
import { UpdateDocumentByQueryParams } from "elasticsearch";
import { UpdateDocumentParams } from "elasticsearch";
import { Url } from "url";

// Warning: (ae-missing-release-tag) "castEsToKbnFieldTypeName" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export const castEsToKbnFieldTypeName: (esType: string) => KBN_FIELD_TYPES;

// @public (undocumented)
export enum ES_FIELD_TYPES {
  // (undocumented)
  ATTACHMENT = "attachment",
  // (undocumented)
  BOOLEAN = "boolean",
  // (undocumented)
  BYTE = "byte",
  // (undocumented)
  DATE = "date",
  // (undocumented)
  DATE_NANOS = "date_nanos",
  // (undocumented)
  DOUBLE = "double",
  // (undocumented)
  FLOAT = "float",
  // (undocumented)
  GEO_POINT = "geo_point",
  // (undocumented)
  GEO_SHAPE = "geo_shape",
  // (undocumented)
  HALF_FLOAT = "half_float",
  // (undocumented)
  _ID = "_id",
  // (undocumented)
  _INDEX = "_index",
  // (undocumented)
  INTEGER = "integer",
  // (undocumented)
  IP = "ip",
  // (undocumented)
  KEYWORD = "keyword",
  // (undocumented)
  LONG = "long",
  // (undocumented)
  MURMUR3 = "murmur3",
  // (undocumented)
  NESTED = "nested",
  // (undocumented)
  OBJECT = "object",
  // (undocumented)
  SCALED_FLOAT = "scaled_float",
  // (undocumented)
  SHORT = "short",
  // (undocumented)
  _SOURCE = "_source",
  // (undocumented)
  STRING = "string",
  // (undocumented)
  TEXT = "text",
  // (undocumented)
  TOKEN_COUNT = "token_count",
  // (undocumented)
  _TYPE = "_type",
}

// Warning: (ae-missing-release-tag) "esFilters" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const esFilters: {
  buildQueryFilter: (
    query: any,
    index: string,
    alias: string
  ) => import("../common").QueryStringFilter;
  buildCustomFilter: typeof buildCustomFilter;
  buildEmptyFilter: (
    isPinned: boolean,
    index?: string | undefined
  ) => import("../common").Filter;
  buildExistsFilter: (
    field: import("../common").IFieldType,
    indexPattern: import("../common").IIndexPattern
  ) => import("../common").ExistsFilter;
  buildFilter: typeof buildFilter;
  buildPhraseFilter: (
    field: import("../common").IFieldType,
    value: any,
    indexPattern: import("../common").IIndexPattern
  ) => import("../common").PhraseFilter;
  buildPhrasesFilter: (
    field: import("../common").IFieldType,
    params: any[],
    indexPattern: import("../common").IIndexPattern
  ) => import("../common").PhrasesFilter;
  buildRangeFilter: (
    field: import("../common").IFieldType,
    params: import("../common").RangeFilterParams,
    indexPattern: import("../common").IIndexPattern,
    formattedValue?: string | undefined
  ) => import("../common").RangeFilter;
  isFilterDisabled: (filter: import("../common").Filter) => boolean;
};

// Warning: (ae-missing-release-tag) "esKuery" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const esKuery: {
  nodeTypes: import("../common/es_query/kuery/node_types").NodeTypes;
  fromKueryExpression: (
    expression: any,
    parseOptions?: Partial<import("../common").KueryParseOptions>
  ) => import("../common").KueryNode;
  toElasticsearchQuery: (
    node: import("../common").KueryNode,
    indexPattern?: import("../common").IIndexPattern | undefined,
    config?: Record<string, any> | undefined,
    context?: Record<string, any> | undefined
  ) => import("../../utils/common").JsonObject;
};

// Warning: (ae-missing-release-tag) "esQuery" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const esQuery: {
  getEsQueryConfig: typeof getEsQueryConfig;
  buildEsQuery: typeof buildEsQuery;
};

// Warning: (ae-missing-release-tag) "EsQueryConfig" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface EsQueryConfig {
  // (undocumented)
  allowLeadingWildcards: boolean;
  // (undocumented)
  dateFormatTZ?: string;
  // (undocumented)
  ignoreFilterIfFieldNotInIndex: boolean;
  // (undocumented)
  queryStringOptions: Record<string, any>;
}

// Warning: (ae-missing-release-tag) "FieldFormatConfig" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface FieldFormatConfig {
  // (undocumented)
  es?: boolean;
  // Warning: (ae-forgotten-export) The symbol "FieldFormatId" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  id: FieldFormatId;
  // (undocumented)
  params: Record<string, any>;
}

// Warning: (ae-missing-release-tag) "fieldFormats" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const fieldFormats: {
  FieldFormatsRegistry: typeof FieldFormatsRegistry;
  FieldFormat: typeof FieldFormat;
  serializeFieldFormat: (
    agg: import("../../../legacy/core_plugins/data/public/search").AggConfig
  ) => import("../../expressions/common").SerializedFieldFormat<object>;
  BoolFormat: typeof BoolFormat;
  BytesFormat: typeof BytesFormat;
  ColorFormat: typeof ColorFormat;
  DateNanosFormat: typeof DateNanosFormat;
  DurationFormat: typeof DurationFormat;
  IpFormat: typeof IpFormat;
  NumberFormat: typeof NumberFormat;
  PercentFormat: typeof PercentFormat;
  RelativeDateFormat: typeof RelativeDateFormat;
  SourceFormat: typeof SourceFormat;
  StaticLookupFormat: typeof StaticLookupFormat;
  UrlFormat: typeof UrlFormat;
  StringFormat: typeof StringFormat;
  TruncateFormat: typeof TruncateFormat;
};

// Warning: (ae-missing-release-tag) "FieldFormatsGetConfigFn" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type FieldFormatsGetConfigFn = <T = any>(
  key: string,
  defaultOverride?: T
) => T;

// Warning: (ae-missing-release-tag) "Filter" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface Filter {
  // Warning: (ae-forgotten-export) The symbol "FilterState" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  $state?: FilterState;
  // Warning: (ae-forgotten-export) The symbol "FilterMeta" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  meta: FilterMeta;
  // (undocumented)
  query?: any;
}

// Warning: (ae-missing-release-tag) "IFieldFormatsRegistry" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type IFieldFormatsRegistry = PublicMethodsOf<FieldFormatsRegistry>;

// Warning: (ae-missing-release-tag) "IFieldSubType" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IFieldSubType {
  // (undocumented)
  multi?: {
    parent: string;
  };
  // (undocumented)
  nested?: {
    path: string;
  };
}

// Warning: (ae-missing-release-tag) "IFieldType" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IFieldType {
  // (undocumented)
  aggregatable?: boolean;
  // (undocumented)
  count?: number;
  // (undocumented)
  displayName?: string;
  // (undocumented)
  esTypes?: string[];
  // (undocumented)
  filterable?: boolean;
  // (undocumented)
  format?: any;
  // (undocumented)
  lang?: string;
  // (undocumented)
  name: string;
  // (undocumented)
  readFromDocValues?: boolean;
  // (undocumented)
  script?: string;
  // (undocumented)
  scripted?: boolean;
  // (undocumented)
  searchable?: boolean;
  // (undocumented)
  sortable?: boolean;
  // (undocumented)
  subType?: IFieldSubType;
  // (undocumented)
  type: string;
  // (undocumented)
  visualizable?: boolean;
}

// Warning: (ae-missing-release-tag) "IIndexPattern" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IIndexPattern {
  // (undocumented)
  [key: string]: any;
  // (undocumented)
  fieldFormatMap?: Record<
    string,
    {
      id: string;
      params: unknown;
    }
  >;
  // (undocumented)
  fields: IFieldType[];
  // (undocumented)
  id?: string;
  // (undocumented)
  timeFieldName?: string;
  // (undocumented)
  title: string;
  // (undocumented)
  type?: string;
}

// Warning: (ae-missing-release-tag) "IndexPatternAttributes" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public @deprecated
export interface IndexPatternAttributes {
  // (undocumented)
  fields: string;
  // (undocumented)
  timeFieldName?: string;
  // (undocumented)
  title: string;
  // (undocumented)
  type: string;
  // (undocumented)
  typeMeta: string;
}

// Warning: (ae-missing-release-tag) "FieldDescriptor" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IndexPatternFieldDescriptor {
  // (undocumented)
  aggregatable: boolean;
  // (undocumented)
  esTypes: string[];
  // (undocumented)
  name: string;
  // (undocumented)
  readFromDocValues: boolean;
  // (undocumented)
  searchable: boolean;
  // Warning: (ae-forgotten-export) The symbol "FieldSubType" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  subType?: FieldSubType;
  // (undocumented)
  type: string;
}

// Warning: (ae-missing-release-tag) "indexPatterns" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const indexPatterns: {
  isFilterable: typeof isFilterable;
  isNestedField: typeof isNestedField;
};

// Warning: (ae-missing-release-tag) "IndexPatternsFetcher" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export class IndexPatternsFetcher {
  constructor(callDataCluster: APICaller_2);
  getFieldsForTimePattern(options: {
    pattern: string;
    metaFields: string[];
    lookBack: number;
    interval: string;
  }): Promise<IndexPatternFieldDescriptor[]>;
  getFieldsForWildcard(options: {
    pattern: string | string[];
    metaFields?: string[];
  }): Promise<IndexPatternFieldDescriptor[]>;
}

// Warning: (ae-missing-release-tag) "IRequestTypesMap" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IRequestTypesMap {
  // Warning: (ae-forgotten-export) The symbol "IKibanaSearchRequest" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  [key: string]: IKibanaSearchRequest;
  // Warning: (ae-forgotten-export) The symbol "ES_SEARCH_STRATEGY" needs to be exported by the entry point index.d.ts
  // Warning: (ae-forgotten-export) The symbol "IEsSearchRequest" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  [ES_SEARCH_STRATEGY]: IEsSearchRequest;
}

// Warning: (ae-missing-release-tag) "IResponseTypesMap" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IResponseTypesMap {
  // Warning: (ae-forgotten-export) The symbol "IKibanaSearchResponse" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  [key: string]: IKibanaSearchResponse;
  // Warning: (ae-forgotten-export) The symbol "IEsSearchResponse" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  [ES_SEARCH_STRATEGY]: IEsSearchResponse;
}

// Warning: (ae-missing-release-tag) "ISearchContext" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface ISearchContext {
  // Warning: (ae-forgotten-export) The symbol "SharedGlobalConfig" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  config$: Observable<SharedGlobalConfig>;
  // Warning: (ae-forgotten-export) The symbol "CoreSetup" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  core: CoreSetup;
}

// Warning: (ae-missing-release-tag) "ISearchSetup" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export interface ISearchSetup {
  // (undocumented)
  __LEGACY: {
    search: <T extends TStrategyTypes = typeof DEFAULT_SEARCH_STRATEGY>(
      caller: APICaller_2,
      request: IRequestTypesMap[T],
      strategyName?: T
    ) => Promise<IResponseTypesMap[T]>;
  };
  // (undocumented)
  registerSearchStrategyContext: <TContextName extends keyof ISearchContext>(
    pluginId: symbol,
    strategyName: TContextName,
    provider: IContextProvider_2<TSearchStrategyProvider<any>, TContextName>
  ) => void;
  // Warning: (ae-forgotten-export) The symbol "TRegisterSearchStrategyProvider" needs to be exported by the entry point index.d.ts
  registerSearchStrategyProvider: TRegisterSearchStrategyProvider;
}

// @public (undocumented)
export enum KBN_FIELD_TYPES {
  // (undocumented)
  ATTACHMENT = "attachment",
  // (undocumented)
  BOOLEAN = "boolean",
  // (undocumented)
  CONFLICT = "conflict",
  // (undocumented)
  DATE = "date",
  // (undocumented)
  GEO_POINT = "geo_point",
  // (undocumented)
  GEO_SHAPE = "geo_shape",
  // (undocumented)
  IP = "ip",
  // (undocumented)
  MURMUR3 = "murmur3",
  // (undocumented)
  NESTED = "nested",
  // (undocumented)
  NUMBER = "number",
  // (undocumented)
  OBJECT = "object",
  // (undocumented)
  _SOURCE = "_source",
  // (undocumented)
  STRING = "string",
  // (undocumented)
  UNKNOWN = "unknown",
}

// Warning: (ae-missing-release-tag) "KueryNode" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface KueryNode {
  // (undocumented)
  [key: string]: any;
  // Warning: (ae-forgotten-export) The symbol "NodeTypes" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  type: keyof NodeTypes;
}

// Warning: (ae-missing-release-tag) "parseInterval" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function parseInterval(interval: string): moment.Duration | null;

// Warning: (ae-forgotten-export) The symbol "Plugin" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "DataServerPlugin" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export class Plugin implements Plugin_2<PluginSetup, PluginStart> {
  // Warning: (ae-forgotten-export) The symbol "PluginInitializerContext" needs to be exported by the entry point index.d.ts
  constructor(initializerContext: PluginInitializerContext);
  // Warning: (ae-forgotten-export) The symbol "DataPluginSetupDependencies" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  setup(
    core: CoreSetup,
    { usageCollection }: DataPluginSetupDependencies
  ): {
    fieldFormats: {
      register: (
        customFieldFormat: import("../common").IFieldFormatType
      ) => number;
    };
    search: ISearchSetup;
  };
  // Warning: (ae-forgotten-export) The symbol "CoreStart" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  start(
    core: CoreStart
  ): {
    fieldFormats: {
      fieldFormatServiceFactory: (
        uiSettings: import("kibana/server").IUiSettingsClient
      ) => Promise<import("../common").FieldFormatsRegistry>;
    };
  };
  // (undocumented)
  stop(): void;
}

// @public
export function plugin(initializerContext: PluginInitializerContext): Plugin;

// Warning: (ae-missing-release-tag) "DataPluginSetup" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface PluginSetup {
  // Warning: (ae-forgotten-export) The symbol "FieldFormatsSetup" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  fieldFormats: FieldFormatsSetup;
  // (undocumented)
  search: ISearchSetup;
}

// Warning: (ae-missing-release-tag) "DataPluginStart" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface PluginStart {
  // Warning: (ae-forgotten-export) The symbol "FieldFormatsStart" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  fieldFormats: FieldFormatsStart;
}

// Warning: (ae-missing-release-tag) "Query" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface Query {
  // (undocumented)
  language: string;
  // (undocumented)
  query:
    | string
    | {
        [key: string]: any;
      };
}

// Warning: (ae-missing-release-tag) "RefreshInterval" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface RefreshInterval {
  // (undocumented)
  pause: boolean;
  // (undocumented)
  value: number;
}

// Warning: (ae-missing-release-tag) "shouldReadFieldFromDocValues" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function shouldReadFieldFromDocValues(
  aggregatable: boolean,
  esType: string
): boolean;

// Warning: (ae-missing-release-tag) "TimeRange" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface TimeRange {
  // (undocumented)
  from: string;
  // (undocumented)
  to: string;
}

// Warning: (ae-forgotten-export) The symbol "ISearchGeneric" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "ISearchStrategy" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "TSearchStrategyProvider" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export type TSearchStrategyProvider<T extends TStrategyTypes> = (
  context: ISearchContext,
  caller: APICaller_2,
  search: ISearchGeneric
) => ISearchStrategy<T>;

// Warning: (ae-missing-release-tag) "TStrategyTypes" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export type TStrategyTypes = typeof ES_SEARCH_STRATEGY | string;

// Warnings were encountered during analysis:
//
// src/plugins/data/server/index.ts:39:23 - (ae-forgotten-export) The symbol "buildCustomFilter" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:39:23 - (ae-forgotten-export) The symbol "buildFilter" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:69:21 - (ae-forgotten-export) The symbol "getEsQueryConfig" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:69:21 - (ae-forgotten-export) The symbol "buildEsQuery" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "FieldFormatsRegistry" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "FieldFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "BoolFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "BytesFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "ColorFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "DateNanosFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "DurationFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "IpFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "NumberFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "PercentFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "RelativeDateFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "SourceFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "StaticLookupFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "UrlFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "StringFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:100:26 - (ae-forgotten-export) The symbol "TruncateFormat" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:128:27 - (ae-forgotten-export) The symbol "isFilterable" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/index.ts:128:27 - (ae-forgotten-export) The symbol "isNestedField" needs to be exported by the entry point index.d.ts
// src/plugins/data/server/search/i_search_setup.ts:45:5 - (ae-forgotten-export) The symbol "DEFAULT_SEARCH_STRATEGY" needs to be exported by the entry point index.d.ts

// (No @packageDocumentation comment for this package)
```