import { Line } from "@ant-design/charts";
import { getXYOptions } from "..";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRUSH_NAME, getHighlightAnnotations, registerRangeBrush } from "../G2Interaction";
import ContextMenu, { TYPE_DATA_DRILLING, TYPE_HIGHLIGHT_MARK, TYPE_RANGE_FILTER } from "../../../components/ContextMenu";
import Mark from "@/components/Icons/Mark";
import SelectAndZoom from "@/components/Icons/SelectAndZoom";
import Fork from "@/components/Icons/Fork";
import { formatMessage } from "umi/locale";
import moment from "moment";

export default (props) => {

    const { record, result, options, isGroup, isLock, onReady, bucketSize, isTimeSeries, highlightRange, currentQueries = {}, handleContextMenu } = props;

    const { id, drilling = {}, legend } = record;

    const brushMenuRef = useRef(null)

    const [refresh, setRefresh] = useState((new Date()).valueOf())

    useEffect(() => {
      if (id) {
        registerRangeBrush(id, {
          onStart: () => {
            brushMenuRef.current.close()
          },
          onEnd: (params, position) => {
            brushMenuRef.current.open({
              ...currentQueries,
              range: {
                ...(currentQueries.range || {}),
                ...(params.range || {})
              }
            }, position)
          }
        })
      }
    }, [id])

    const config = {
      ...getXYOptions(result, record, { isGroup, bucketSize, isTimeSeries, legend }),
      ...options,
      point: {
        size: 2,
        shape: '',
        style: {
          fill: 'white',
        },
      },
      interactions: [
        { 
          type: `${BRUSH_NAME}-${id}`, 
          enable: !isLock && result.data.length > 0 
        },
      ],
      annotations: getHighlightAnnotations(highlightRange, result.data)
    }

    return (
      <div key={refresh} style={{ width: '100%', height: '100%'}}>
        <Line {...config} onReady={(plot) => {
          onReady(plot)
        }}/>
        <ContextMenu ref={brushMenuRef} menu={[
              {
                type: TYPE_HIGHLIGHT_MARK,
                name: formatMessage({id: "dashboard.widget.sub.menu.highlight.mark"}),
                icon: <Mark />,
                onClick: (params) => handleContextMenu(params, TYPE_HIGHLIGHT_MARK)
              },
              {
                type: TYPE_RANGE_FILTER,
                name: 'Range Filter',
                name: formatMessage({id: "dashboard.widget.sub.menu.range.filter"}),
                icon: <SelectAndZoom />,
                onClick: (params) => handleContextMenu(params, TYPE_RANGE_FILTER)
              },
              {
                type: TYPE_DATA_DRILLING,
                name: formatMessage({id: "dashboard.widget.sub.menu.data.drilling"}),
                icon: <Fork />,
                onClick: (params) => {
                  const { range = {} } = params;
                  if (range.from && range.to) {
                    const urlParams = {
                      from: moment(range.from).toISOString(),
                      to: moment(range.to).toISOString(),
                    }
                    handleContextMenu(urlParams, TYPE_DATA_DRILLING)
                  }
                },
                disabled: !drilling.url
              },
          ]} onClose={() => {
            setRefresh(new Date().valueOf())
          }}/>
      </div>
    )
  }