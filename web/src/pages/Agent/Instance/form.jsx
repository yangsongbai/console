import {
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Card,
  Button,
  Row,
  Col,
  Icon,
} from "antd";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { useCallback, useMemo, useState } from "react";
import "@/assets/headercontent.scss";
import useFetch from "@/lib/hooks/use_fetch";
import request from "@/utils/request";
import { formatMessage } from "umi/locale";
import TagEditor from "@/components/infini/TagEditor";
import { isTLS, removeHttpSchema } from "@/utils/utils";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 5,
    },
  },
};
const InstanceForm = React.forwardRef((props) => {
  const { getFieldDecorator } = props.form;
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      props.form.validateFields((err, values) => {
        if (err) {
          return false;
        }
        if (typeof props.onSaveClick == "function") {
          props.onSaveClick(values);
        }
      });
    },
    [props.form]
  );
  const editValue = props.value || {};

  const [needAuth, setNeedAuth] = useState(!!editValue.basic_auth?.username);

  const [isPageTLS, setIsPageTLS] = useState(isTLS(props.initialValue?.endpoint))
  const handleEndpointChange = (event) => {
    const val = event.target.value;
    setIsPageTLS(isTLS(val))
  };
  const isTLSChange = (val) => {
    setIsPageTLS(val)
  };

  return (
    <PageHeaderWrapper>
      <Card
        extra={
          <div>
            <Button type="primary" onClick={() => props.history.go(-1)}>
              {formatMessage({ id: "form.button.goback" })}
            </Button>
          </div>
        }
      >
        <Form {...formItemLayout}>
          <Form.Item
            label={formatMessage({
              id: "gateway.instance.field.name.label",
            })}
          >
            {getFieldDecorator("name", {
              initialValue: editValue.name,
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: "gateway.instance.field.name.form.required",
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Endpoint">
            {getFieldDecorator("endpoint", {
              initialValue: removeHttpSchema(editValue?.endpoint),
              normalize: (value) => {
                return removeHttpSchema(value || "").trim()
              },
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: "gateway.instance.field.endpoint.form.required",
                  }),
                },
                {
                  type: "string",
                  pattern: /^[\w\.\-_~%]+(\:\d+)?$/, //(https?:\/\/)?
                  message: formatMessage({
                    id: "cluster.regist.form.verify.valid.endpoint",
                  }),
                },
              ],
            })(<Input onChange={handleEndpointChange} />)}
          </Form.Item>
          <Form.Item label="TLS">
            {getFieldDecorator("isTLS", {
              initialValue: isTLS(editValue?.endpoint),
            })(
              <Switch
                defaultChecked={isTLS(editValue?.endpoint)}
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="close" />}
                checked={isPageTLS}
                onChange={isTLSChange}
              />
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: "cluster.regist.step.connect.label.auth",
            })}
          >
            <Switch
              checked={needAuth}
              onChange={setNeedAuth}
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
            />
          </Form.Item>
          {needAuth === true ? (
            <div>
              <Form.Item
                label={formatMessage({
                  id: "cluster.regist.step.connect.label.username",
                })}
              >
                {getFieldDecorator("basic_auth.username", {
                  initialValue: editValue?.basic_auth?.username,
                  rules: [],
                })(<Input autoComplete="off" />)}
              </Form.Item>
              <Form.Item
                label={formatMessage({
                  id: "cluster.regist.step.connect.label.password",
                })}
                hasFeedback
              >
                {getFieldDecorator("basic_auth.password", {
                  initialValue: editValue?.basic_auth?.password,
                  rules: [],
                })(<Input.Password />)}
              </Form.Item>
            </div>
          ) : (
            ""
          )}
          <Form.Item
            label={formatMessage({
              id: "gateway.instance.field.tags.label",
            })}
          >
            {getFieldDecorator("tags", {
              initialValue: editValue.tags,
              rules: [],
            })(<TagEditor />)}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.description",
            })}
          >
            {getFieldDecorator("description", {
              initialValue: editValue.description,
            })(
              <Input.TextArea
                placeholder={formatMessage({
                  id: "gateway.instance.field.description.placeholder",
                })}
              />
            )}
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
});

export default InstanceForm;