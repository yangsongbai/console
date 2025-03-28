import { Form, Input, Switch, Icon, Select } from "antd";
import { formatMessage } from "umi/locale";
import CredentialForm from "../CredentialForm";
import "../Form.scss";
import SearchEngines from "../components/SearchEngines";
import Providers from "../components/Providers";
import { isTLS, removeHttpSchema } from "@/utils/utils";

export const MANUAL_VALUE = "manual";

@Form.create()
export class InitialStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      needAuth: props.initialValue?.isAuth !== undefined,
      isManual: props.initialValue?.credential_id === MANUAL_VALUE,
      isPageTLS: isTLS(props.initialValue?.host)
    };
  }
  handleAuthChange = (val) => {
    this.setState({
      needAuth: val,
    });
  };
  handleEndpointChange = (value) => {
    if(!value.length) {
      return
    }
    const val = value[value.length - 1];
    if(val.startsWith("http://") || val.startsWith("https://")){
      this.props.form.setFieldsValue({ isTLS: isTLS(val)})
      this.setState({
        isPageTLS: isTLS(val)
      })
    }
  };
  isPageTLSChange = (val) => {
    this.setState({
      isPageTLS: val,
    });
  };
  validateHostsRule = (rule, value, callback) => {
    let vals = value || [];
    for(let i = 0; i < vals.length; i++) {
      if (!/^[\w\.\-_~%]+(\:\d+)?$/.test(vals[i])) {
        return callback(formatMessage({ id: "cluster.regist.form.verify.valid.endpoint" }));
      }
    }
    // validation passed
    callback();
  };
  render() {
    const {
      form: { getFieldDecorator },
      initialValue,
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <Form
        {...formItemLayout}
        form={this.props.formRef}
        className="compactForm"
      >
        <Form.Item
          label={formatMessage({
            id: "cluster.manage.label.cluster_name",
          })}
        >
          {getFieldDecorator("distribution", {
            initialValue: initialValue?.distribution || "elasticsearch",
          })(<SearchEngines />)}
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: "cluster.manage.label.provider",
          })}
        >
          {getFieldDecorator("location.provider", {
            initialValue: initialValue?.location?.provider || "on-premises",
          })(<Providers />)}
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: "cluster.manage.label.region",
          })}
        >
          {getFieldDecorator("location.region", {
            initialValue: initialValue?.location?.region,
          })(<Input placeholder="beijing | shanghai" />)}
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: "cluster.manage.table.column.endpoint",
          })}
        >
          {getFieldDecorator("hosts", {
            initialValue: initialValue?.hosts || [],
            normalize: (value) => {
              return (value || []).map((v) => removeHttpSchema(v || "").trim());
            },
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                message: formatMessage({
                  id: "cluster.regist.form.verify.required.endpoint",
                }),
              },
              {
                validator: this.validateHostsRule,
              }
            ],
          })(<Select placeholder="127.0.0.1:9200" mode="tags" allowClear={true} onChange={this.handleEndpointChange}/>)}
        </Form.Item>
        <Form.Item label="TLS">
          {getFieldDecorator("isTLS", {
            initialValue: initialValue?.isTLS || false,
          })(
            <Switch
              defaultChecked={isTLS(initialValue?.endpoint)}
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
              checked={this.state.isPageTLS}
              onChange={this.isPageTLSChange}
            />
          )}
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: "cluster.regist.step.connect.label.auth",
          })}
        >
          {getFieldDecorator("isAuth", {
            initialValue: this.state.needAuth,
            valuePropName: "checked",
          })(
            <Switch
              onChange={this.handleAuthChange}
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
            />
          )}
        </Form.Item>
        <CredentialForm
          needAuth={this.state.needAuth}
          form={this.props.form}
          initialValue={initialValue}
          isManual={this.state.isManual}
        />
      </Form>
    );
  }
}
