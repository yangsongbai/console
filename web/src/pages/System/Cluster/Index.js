import  React from 'react';
import {Button, Card, Col, Divider, Form, Input, Row, Table, Switch, Icon, Popconfirm, message} from "antd";
import Link from "umi/link";
import {connect} from "dva";

@Form.create()
@connect(({clusterConfig}) =>({
  clusterConfig
}))
class Index extends  React.Component {
  columns = [{
    title: '集群名称',
    dataIndex: 'name',
    key: 'name',
  },{
    title: '集群访问URL',
    dataIndex: 'endpoint',
    key: 'endpoint',
  },{
    title: '是否需要身份验证',
    dataIndex: 'basic_auth',
    key: 'username',
    render: (val) => {
      //console.log(val)
      return (val && typeof val.username !=='undefined' && val.username !== '')? '是': '否';
    }
  },{
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },{
    title: '是否启用',
    dataIndex: 'enabled',
    key: 'enabled',
    render: (val) =>{
      return val === true ? '是': '否';
    }
  },{
    title: 'Operation',
    render: (text, record) => (
      <div>
        <Link to='/system/cluster/edit' onClick={()=>{this.handleEditClick(record)}}>Edit</Link>
        <span><Divider type="vertical" />
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDeleteClick(record)}><a key="delete">Delete</a>
         </Popconfirm>
          </span>
      </div>
    ),
  }]

  fetchData = (params)=>{
    const {dispatch} = this.props;
    dispatch({
      type: 'clusterConfig/fetchClusterList',
      payload: params,
    })
  }
  componentDidMount() {
    if(typeof this.props.clusterConfig.data === 'undefined') {
      this.fetchData({})
    }
  }

  handleSearchClick = ()=>{
    const {form} = this.props;
    this.fetchData({
      name: form.getFieldValue('name'),
    })
  }

  handleDeleteClick = (record)=>{
    const {dispatch} = this.props;
    return dispatch({
      type:'clusterConfig/deleteCluster',
      payload: {
        id: record.id
      }
    }).then((result)=>{
      if(result){
        message.success("删除成功");
      }
    });
  }

  saveData = (payload)=>{
    const {dispatch} = this.props;
    return dispatch({
      type:'clusterConfig/saveData',
      payload: {
        ...payload
      }
    });
  }
  handleNewClick = () => {
    this.saveData({
      editMode: 'NEW',
      editValue: {basic_auth: {}},
    })
  }
  handleEditClick = (record)=>{
    this.saveData({
      editMode : 'UPDATE',
      editValue: record,
    })
  }

  handleEnabledChange = (enabled) => {
    const {form} = this.props;
    this.fetchData({
      name: form.getFieldValue('name'),
      enabled: enabled,
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: {marginBottom: 0}
    };
    const {data} = this.props.clusterConfig;
    return (
      <Card>
        <Form>
          <Row gutter={{md:16, sm:8}}>
            <Col md={8} sm={10}>
              <Form.Item {...formItemLayout} label="集群名称">
                {getFieldDecorator('name')(<Input placeholder="please input cluster name" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={8}>
              <div style={{paddingTop:4}}>
                <Button type="primary" icon="search" onClick={this.handleSearchClick}>
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
        <Divider style={{marginBottom:0}} />
        <Card
          bodyStyle={{padding:0}}
          extra={<div>
            <span style={{marginRight:24}}><Switch
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
              onChange={this.handleEnabledChange}
              defaultChecked
            />是否启用</span>
           <Link to='/system/cluster/edit' onClick={this.handleNewClick}> <Button type="primary" icon="plus">New</Button></Link>
          </div>}
          bordered={false}>
          <Table
            bordered
            columns={this.columns}
            dataSource={data}
            rowKey='id'
          />
        </Card>
      </Card>
    );
  }

}

export default  Index;