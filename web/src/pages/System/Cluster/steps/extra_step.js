import {
  Form,
  Input,
  Switch,
  Icon,
  InputNumber,
  Divider,
  Descriptions,
} from "antd";
import { HealthStatusView } from "@/components/infini/health_status_view";
import { formatMessage } from "umi/locale";
import TagEditor from "@/components/infini/TagEditor";
import MonitorConfigsForm from "../MonitorConfigsForm";
import MetadataConfigsForm from "../MetadataConfigsForm";
import "../Form.scss";

@Form.create()
export class ExtraStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = { monitored: true };
  }
  componentDidMount() {
    this.setState({
      monitored: this.props?.initialValue?.monitored ?? true,
    });
  }
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
      <>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.manage.table.column.endpoint",
            })}
          >
            {initialValue?.host}
          </Descriptions.Item>
          <Descriptions.Item label="TLS">
            {initialValue?.isTLS ? (
              <Icon type="lock" style={{ color: "#52c41a" }} />
            ) : null}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.manage.table.column.version",
            })}
          >
            {initialValue?.version}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.regist.step.connect.label.auth",
            })}
          >
            {initialValue?.username ? <Icon type="user" /> : null}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.manage.table.column.health",
            })}
          >
            <HealthStatusView status={initialValue?.status} />
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.manage.table.column.node_count",
            })}
          >
            {initialValue?.number_of_nodes}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.regist.step.connect.label.data_nodes",
            })}
          >
            {initialValue?.number_of_data_nodes}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: "cluster.regist.step.connect.label.shards",
            })}
          >
            {initialValue?.active_shards}
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Form
          {...formItemLayout}
          style={{ marginTop: 15 }}
          form={this.props.formRef}
          className="compactForm"
        >
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.name",
            })}
          >
            {getFieldDecorator("name", {
              initialValue: initialValue?.cluster_name || "",
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: "cluster.regist.form.verify.required.cluster_name",
                  }),
                },
              ],
            })(<Input autoComplete="off" placeholder="Cluster name" />)}
          </Form.Item>
          {/* <Form.Item label="Elasticsearch 版本">
            {getFieldDecorator('version', {
              initialValue: initialValue?.version || '',
            })(<Input readOnly={true} />)}
          </Form.Item> */}
          {/* <Form.Item label="排序权重">
            {getFieldDecorator('order', {
              initialValue: 0,
            })(<InputNumber />)}
          </Form.Item> */}
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.description",
            })}
          >
            {getFieldDecorator("description", {
              initialValue: "",
            })(<Input.TextArea placeholder="Cluster description" />)}
          </Form.Item>
          {/* <Form.Item label="是否启用">
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Switch
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
            />)}
          </Form.Item> */}
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.discovery.enabled",
            })}
          >
            {getFieldDecorator("discovery.enabled", {
              valuePropName: "checked",
              initialValue: true,
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="close" />}
              />
            )}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.monitored",
            })}
          >
            {getFieldDecorator("monitored", {
              valuePropName: "checked",
              initialValue: true,
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="close" />}
                onChange={(checked) => {
                  this.setState({
                    monitored: checked,
                  });
                }}
              />
            )}
          </Form.Item>
          <MonitorConfigsForm
            form={this.props.form}
            editValue={initialValue}
            visible={this.state.monitored}
          />
          <MetadataConfigsForm
            form={this.props.form}
            editValue={initialValue}
          />

          <Form.Item label="Tags">
            {getFieldDecorator("tags", {
              initialValue: initialValue?.tags || ["default"],
              rules: [],
            })(<TagEditor />)}
          </Form.Item>
          {/* <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.project",
            })}
          >
            {getFieldDecorator("project", {
              required: true,
              message: "Project is required!",
            })(<Input placeholder="project" />)}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.owner",
            })}
          >
            {getFieldDecorator("owner", {
              required: true,
              message: "owner is required!",
            })(<Input placeholder="owner" />)}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.area",
            })}
          >
            {getFieldDecorator("area", {})(<Input placeholder="area" />)}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: "cluster.manage.table.column.location",
            })}
          >
            {getFieldDecorator(
              "location",
              {}
            )(<Input placeholder="location" />)}
          </Form.Item> */}
        </Form>
      </>
    );
  }
}