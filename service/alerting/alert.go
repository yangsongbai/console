package alerting

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	httprouter "infini.sh/framework/core/api/router"
	"infini.sh/framework/core/elastic"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func getQueryParam(req *http.Request, key string, or ...string) string {
	query := req.URL.Query()
	val :=  query.Get(key)
	if val == "" && len(or)>0 {
		return or[0]
	}
	return val
}

func GetAlerts (w http.ResponseWriter, req *http.Request, ps httprouter.Params){
	id := ps.ByName("id")
	conf := elastic.GetConfig(id)
	if conf == nil {
		writeError(w, errors.New("cluster not found"))
		return
	}

	var (
		from = getQueryParam(req, "from", "0")
		size = getQueryParam(req, "size", "20")
		search = getQueryParam(req, "search", "")
		sortDirection = getQueryParam(req, "sortDirection", "desc")
		sortField = getQueryParam(req, "sortField", "start_time")
		severityLevel = getQueryParam(req, "severityLevel", "ALL")
		alertState = getQueryParam(req, "alertState", "ALL")
		monitorIds = req.URL.Query()["monitorIds"]
		params = map[string]string{
			"startIndex": from,
			"size": size,
			"severityLevel": severityLevel,
			"alertState": alertState,
			"searchString": search,
		}
	)

	switch sortField {
	case "monitor_name", "trigger_name":
		params["sortString"] = fmt.Sprintf(`%s.keyword`, sortField)
		params["sortOrder"] = sortDirection
	case "start_time":
		params["sortString"] = sortField
		params["sortOrder"] = sortDirection
	case "end_time":
		params["sortString"] = sortField
		params["sortOrder"] = sortDirection
		params["missing"] = "_first"
		if sortDirection == "asc" {
			params["missing"] = "_last"
		}
	case "acknowledged_time":
		params["sortString"] = sortField
		params["sortOrder"] = sortDirection
		params["missing"] = "_last"
	}
	if len(monitorIds) > 0{
		params["monitorId"] = monitorIds[0]
	}

	if clearSearch := strings.TrimSpace(search); clearSearch != ""{
		searches := strings.Split(clearSearch, " ")
		clearSearch = strings.Join(searches, "* *")
		params["searchString"] = fmt.Sprintf("*%s*", clearSearch)
	}
	reqUrl := fmt.Sprintf("%s/%s/_alerting/monitors/alerts", conf.Endpoint, API_PREFIX )

	res, err := doRequest(reqUrl, http.MethodGet, params, nil)
	if err != nil {
		writeError(w, err)
		return
	}
	var alertRes = IfaceMap{}
	err = decodeJSON(res.Body, &alertRes)
	defer res.Body.Close()
	if err != nil {
		writeError(w, err)
		return
	}
	alerts := []IfaceMap{}
	rawAlerts := queryValue(alertRes, "alerts", nil)
	if ds, ok := rawAlerts.([]interface{}); ok {
		for _, alert := range ds {
			if alertItem, ok := alert.(map[string]interface{}); ok {
				alertItem["version"] = queryValue(alertItem, "alert_version", "")
				if  queryValue(alertItem, "id", nil) == nil {
					alertItem["id"] = queryValue(alertItem, "alert_id", nil)
				}
				alerts = append(alerts, alertItem)
			}
		}
	}
	writeJSON(w, IfaceMap{
		"ok": true,
		"alerts": alerts,
		"totalAlerts": queryValue(alertRes, "totalAlerts", 0),
	}, http.StatusOK)

}
func writeError(w http.ResponseWriter, err error) {
	writeJSON(w, map[string]interface{}{
		"ok": false,
		"resp": err.Error(),
	}, http.StatusOK)
}

type IfaceMap map[string]interface{}

func decodeJSON(reader io.Reader, obj interface{}) error{
	dec := json.NewDecoder(reader)
	err :=  dec.Decode(obj)
	if err != nil {
		return err
	}

	if m, ok := obj.(*IfaceMap); ok {
		if errStr := queryValue(*m,"error", nil); errStr != nil {
			if str, ok := errStr.(string); ok {
				errors.New(str)
			}
			buf, _ := json.Marshal(errStr)
			return errors.New(string(buf))
		}
	}
	return nil
}

func writeJSON(w http.ResponseWriter, data interface{}, statusCode int){
	w.WriteHeader(statusCode)
	w.Header().Set("content-type", "application/json")
	buf, _ := json.Marshal(data)
	w.Write(buf)
}

var alertClient = http.Client{
	Transport: &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	},
}

func doRequest(requestUrl string, method string, params map[string]string, body interface{}) (*http.Response, error){
	var req *http.Request
	if params != nil && len(params) > 0 {
		var queryValues  = url.Values{}
		for k, v := range params {
			queryValues.Set(k, v)
		}
		requestUrl += "?"+ queryValues.Encode()
	}
	var reader io.Reader
	if body != nil {
		switch body.(type) {
		case string:
			reader = bytes.NewBufferString(body.(string))
		case io.Reader:
			reader = body.(io.Reader)
		default:
			rw := &bytes.Buffer{}
			enc := json.NewEncoder(rw)
			err := enc.Encode(body)
			if err != nil {
				return nil, err
			}
			reader = rw
		}
	}
	req, _ = http.NewRequest(method, requestUrl, reader)
	req.Header.Set("content-type", "application/json")
	req.Header.Set("User-Agent", "Kibana")
	return alertClient.Do(req)
}

func queryValue(obj map[string]interface{}, key string, defaultValue interface{}) interface{} {
	if key == "" {
		return obj
	}
	idx := strings.Index(key, ".")
	if idx == -1 {
		if v, ok := obj[key]; ok {
			return v
		}
		return defaultValue
	}
	ckey := key[0:idx]

	if v, ok := obj[ckey]; ok {
		if vmap, ok := v.(map[string]interface{}); ok {
			return queryValue(vmap, key[idx+1:], defaultValue)
		}
	}
	return defaultValue
}

func assignTo(dst IfaceMap, src IfaceMap){
	if dst == nil || src == nil {
		return
	}
	for k, v := range src {
		dst[k] = v
	}
}