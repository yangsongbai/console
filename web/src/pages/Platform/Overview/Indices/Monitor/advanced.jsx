import { useState } from "react";
import StatisticBar from "./statistic_bar";
import IndexMetric from "../../components/index_metric";

export default (props) => {

  const { indexName } = props

  const [param, setParam] = useState({
    show_top: false,
    index_name: indexName,
  });
  return (
    <IndexMetric
      {...props}
      param={param}
      setParam={setParam}
      metrics={[
        [
            "operations",
            [
                "indexing_rate",
                "indexing_bytes",
                "query_times",
                "fetch_times",
                "scroll_times",
                "refresh_times",
                "flush_times",
                "merge_times"
            ]
        ],
        [
            "latency",
            [
                "indexing_latency",
                "query_latency",
                "fetch_latency",
                "scroll_latency",
                "refresh_latency",
                "flush_latency",
                "merge_latency"
            ]
        ],
        [
            "storage",
            [
                "index_storage",
                "segment_count"
            ]
        ],
        [
            "document",
            [
                "doc_count",
                "docs_deleted",
                "doc_percent"
            ]
        ],
        [
            "memory",
            [
                "segment_doc_values_memory",
                "segment_fields_memory",
                "segment_memory",
                "segment_terms_memory",
                "segment_index_writer_memory",
                "segment_term_vectors_memory",
                "segment_norms_memory",
                "segment_points_memory",
                "segment_version_map",
                "segment_fixed_bit_set",
            ]
        ],
        [
            "cache",
            [
                "query_cache",
                "request_cache",
                "fielddata_cache",
                "query_cache_count",
                "query_cache_hit",
                "request_cache_hit",
                "query_cache_miss",
                "request_cache_miss"
            ]
        ]
      ]}
    />
  );
}
