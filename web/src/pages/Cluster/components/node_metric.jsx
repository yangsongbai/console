import * as React from "react";
import {
  Axis,
  Chart,
  CurveType,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from "@elastic/charts";
import useFetch from "@/lib/hooks/use_fetch";
import { ESPrefix } from "@/services/common";
import styles from "../Metrics.less";
import { Spin, Radio, Select, Skeleton, Row, Col } from "antd";
import { formatter, getFormatter, getNumFormatter } from "../format";
import "./node_metric.scss";
import { calculateBounds } from "@/components/kibana/data/common/query/timefilter";
import moment from "moment";
import { formatMessage } from "umi/locale";
import MetricContainer from "./metric_container";
import _ from "lodash";

const gorupOrder = [
  "system",
  "operations",
  "latency",
  "storage",
  "http",
  "memory",
  "cache",
];

export default ({ clusterID, timezone, timeRange, handleTimeChange }) => {
  const [filter, setFilter] = React.useState({
    top: "5",
    node_name: undefined,
  });

  const topChange = React.useCallback(
    (e) => {
      setFilter({
        node_name: undefined,
        top: e.target.value,
      });
    },
    [setFilter]
  );

  const nodeValueChange = React.useCallback(
    (value) => {
      setFilter({
        top: undefined,
        node_name: value,
      });
    },
    [setFilter]
  );
  const queryParams = React.useMemo(() => {
    const bounds = calculateBounds({
      from: timeRange.min,
      to: timeRange.max,
    });
    return {
      ...filter,
      min: bounds.min.valueOf(),
      max: bounds.max.valueOf(),
    };
  }, [filter, timeRange]);
  const { loading, error, value } = useFetch(
    `${ESPrefix}/${clusterID}/node_metrics`,
    {
      queryParams: queryParams,
    },
    [clusterID, queryParams]
  );

  const metrics = React.useMemo(() => {
    return _.groupBy(value?.metrics, "group");
    // return Object.values(value?.metrics || {}).sort(
    //   (a, b) => a.order - b.order
    // );
  }, [value]);

  const chartRefs = React.useRef();
  React.useEffect(() => {
    let refs = [];
    Object.values(metrics).map((m) => {
      m.forEach(() => {
        refs.push(React.createRef());
      });
    });
    chartRefs.current = refs;
  }, [metrics]);

  const { value: nodes } = useFetch(`${ESPrefix}/${clusterID}/nodes`, {}, [
    clusterID,
  ]);
  const nodeNames = React.useMemo(() => {
    return Object.keys(nodes || {}).map((k) => nodes[k].transport_address);
  }, [nodes]);

  const pointerUpdate = (event) => {
    chartRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.dispatchExternalPointerEvent(event);
      }
    });
  };

  const handleChartBrush = ({ x }) => {
    if (!x) {
      return;
    }
    const [from, to] = x;
    if (typeof handleTimeChange == "function") {
      handleTimeChange({
        start: moment(from).toISOString(),
        end: moment(to).toISOString(),
      });
    }
  };

  let refIdx = 0;
  if (Object.keys(metrics).length == 0) {
    return null;
  }
  return (
    <div id="node-metric">
      <div className="px">
        <div className="metric-control">
          <div className="selector">
            <div className="top_radio">
              <Radio.Group onChange={topChange} value={filter.top}>
                <Radio.Button key="5" value="5">
                  Top5
                </Radio.Button>
                <Radio.Button key="10" value="10">
                  Top10
                </Radio.Button>
                <Radio.Button key="15" value="15">
                  Top15
                </Radio.Button>
                <Radio.Button key="20" value="20">
                  Top20
                </Radio.Button>
              </Radio.Group>
            </div>
            <div className="value-selector">
              <Select
                style={{ width: 200 }}
                onChange={nodeValueChange}
                placeholder="Select node"
                value={filter.node_name}
                showSearch={true}
              >
                {nodeNames.map((name) => (
                  <Select.Option key={name}>{name}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
      <div className="px">
        <Skeleton active loading={!value} paragraph={{ rows: 20 }}>
          {//Object.keys(metrics)
          gorupOrder.map((e, i) => {
            return (
              <div key={e} style={{ margin: "8px 0" }}>
                <MetricContainer
                  title={formatMessage({ id: `cluster.metrics.group.${e}` })}
                  collapsed={false}
                >
                  <div className="metric-inner-cnt">
                    {metrics[e].map((metric) => {
                      let axis = metric.axis;
                      let lines = metric.lines;
                      let disableHeaderFormat = false;
                      let headerUnit = "";
                      return (
                        <div key={metrics.key} className="metric-item">
                          <Chart
                            size={[, 200]}
                            className={styles.vizChartItem}
                            ref={chartRefs.current[refIdx++]}
                          >
                            <Settings
                              // theme={theme}
                              pointerUpdateDebounce={0}
                              pointerUpdateTrigger="x"
                              // externalPointerEvents={{
                              //   tooltip: { visible: true },
                              // }}
                              onPointerUpdate={pointerUpdate}
                              showLegend
                              legendPosition={Position.Top}
                              onBrushEnd={handleChartBrush}
                              tooltip={{
                                headerFormatter: disableHeaderFormat
                                  ? undefined
                                  : ({ value }) =>
                                      `${formatter.full_dates(value)}${
                                        headerUnit ? ` ${headerUnit}` : ""
                                      }`,
                              }}
                              debug={false}
                            />
                            <Axis
                              id="{e}-bottom"
                              position={Position.Bottom}
                              showOverlappingTicks
                              labelFormat={timeRange.timeFormatter}
                              tickFormat={timeRange.timeFormatter}
                              ticks={8}
                            />
                            {axis.map((item) => {
                              return (
                                <Axis
                                  key={e + "-" + item.id}
                                  id={e + "-" + item.id}
                                  showGridLines={item.showGridLines}
                                  groupId={item.group}
                                  title={formatMessage({
                                    id:
                                      "cluster.metrics.node.axis." +
                                      metric.key +
                                      ".title",
                                  })}
                                  position={item.position}
                                  ticks={item.ticks}
                                  labelFormat={getFormatter(
                                    item.formatType,
                                    item.labelFormat
                                  )}
                                  tickFormat={getFormatter(
                                    item.formatType,
                                    item.tickFormat
                                  )}
                                />
                              );
                            })}

                            {lines.map((item) => {
                              return (
                                <LineSeries
                                  key={item.metric.label}
                                  id={item.metric.label}
                                  groupId={item.metric.group}
                                  timeZone={timezone}
                                  xScaleType={ScaleType.Time}
                                  yScaleType={ScaleType.Linear}
                                  xAccessor={0}
                                  tickFormat={getFormatter(
                                    item.metric.formatType,
                                    item.metric.tickFormat,
                                    item.metric.units
                                  )}
                                  yAccessors={[1]}
                                  data={item.data}
                                  curve={CurveType.CURVE_MONOTONE_X}
                                />
                              );
                            })}
                          </Chart>
                        </div>
                      );
                    })}
                  </div>
                </MetricContainer>
              </div>
            );
          })}
        </Skeleton>
      </div>
    </div>
  );
};