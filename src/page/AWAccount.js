import React, { useState, useEffect } from 'react';
import { Layout, Menu, Row, Col, Input, Table, Space, message, Progress, InputNumber   } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
const { Header, Content, Footer } = Layout;
const { Search } = Input;



const AWAccount = () => {

  const [accounts, setAccounts] = useState([]);
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sec, setSec] = useState(10);
  const [timeoutID, setTimeoutID] = useState(null);
  const [txtSearch, setTxtSearch] = useState('');
  const [allWax, setAllWax] = useState(0);
  const [allTlm, setAllTlm] = useState(0);

  const columns = [
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      width: '20%',
      render: cpu => <Progress percent={cpu} strokeColor={cpu > 90 ? 'red' : ''} format={(percent,successPercent) => `${percent}%`} style={{width:'100%'}} />
    },
    {
      title: 'RAM',
      dataIndex: 'ram',
      key: 'ram',
      width: '20%',
      responsive: ['md'],
      render: ram => <Progress percent={ram} strokeColor={ram > 90 ? 'red' : ''} format={(percent,successPercent) => `${percent}%`} style={{width:'100%'}} />
    },
    {
      title: `Staked CPU / Wax`,
      dataIndex: 'staked',
      key: 'staked',
    },
    {
      title: `TLM ${allTlm}`,
      dataIndex: 'tlm',
      key: 'tlm',
    },
    {
      title: `WAX ${allWax}`,
      dataIndex: 'wax',
      key: 'wax',
      responsive: ['md'], 
    },
    {
      title: `Last Mine`,
      dataIndex: 'last',
      key: 'wax',
    },
    {
      title: 'Remove',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <a onClick={() => clearAccount(record)}><DeleteOutlined style={{color:'red'}} /></a>
        </Space>
      ),
    },
  ];

  const clearAccount = (acc) => {
    console.log(acc)
    setAccounts(accounts.filter(f => f !== acc.account));
    setDatas(datas.filter(f => f.account !== acc.account))
  }

  const getAccountInfo = async (accs) => {
    let all = accs.map(acc => {
      let request1 = axios.post('https://api.waxsweden.org/v1/chain/get_account', { "account_name": acc });
      let request2 = axios.post('https://api.waxsweden.org/v1/chain/get_table_rows', { "json": true, "code": "alien.worlds", "scope": acc, "table": "accounts", "table_key": "", "lower_bound": "", "upper_bound": "", "index_position": 1, "key_type": "", "limit": 1, "reverse": false, "show_payer": false });
      let request3 = axios.post('https://api.waxsweden.org/v1/chain/get_table_rows', {"json":true,"code":"m.federation","scope":"m.federation","table":"miners","table_key":"","lower_bound":acc,"upper_bound":acc,"index_position":1,"key_type":"","limit":10,"reverse":false,"show_payer":false});

      return axios.all([request1, request2, request3])
        .then(
          axios.spread((...responses) => {
            // console.log(responses[0].data)

            let w = responses[1].data.length > 0 ? responses[0].data.core_liquid_balance.split(' ') : '0';
            let t = responses[1].data.rows.length > 0 ? responses[1].data.rows[0].balance.split(' ') : '0';
            let total = responses[0].data.total_resources.cpu_weight
              // console.log( dayjs().to(dayjs(responses[2].data.rows[0].last_mine).add(7,'hour').toISOString()) );
            // console.log(responses[0].data.account_name, +((responses[0].data.cpu_limit.used / responses[0].data.cpu_limit.max) * 100).toFixed(0))
            return {
              account: responses[0].data.account_name,
              cpu: +((responses[0].data.cpu_limit.used / responses[0].data.cpu_limit.max) * 100).toFixed(0),
              ram: +((responses[0].data.ram_usage / responses[0].data.ram_quota) * 100).toFixed(0),
              staked:total,
              wax: +w[0],
              tlm: +t[0],
              last: responses[1].data.rows.length > 0 ? dayjs().to(dayjs(responses[2].data.rows[0].last_mine).add(7,'hour').toISOString()) : '-'
            }
          })
        )
        .catch(e => console.error(e))
    });
    Promise.all(all).then(res => {
      if (res.length > 0) {
        // setAllWax(res.map(v=>v.wax).reduce((a, c) => a+c).toFixed(2))
        // setAllTlm(res.map(v=>v.tlm).reduce((a, c) => a+c).toFixed(2))
        setDatas(res);  
      }
      
      message.destroy();
      setTxtSearch('');
    })
  }
  
  const onSearch = async (acc) => {
    setTxtSearch(acc);
    if (acc && !!!accounts.includes(acc)) {
      console.log('add');
      setAccounts([...accounts, acc]);
      message.loading(`Add account ${acc}`)
    } else {
      message.error('This account has in list.');
    }
  }

  const ElementTable = () => {
    return (
      <Table size={'small'} columns={columns} pagination={{ pageSize: 100 }}  dataSource={datas.map((v,i) => ({key:i, ...v}))} />
    )
  }

  const loopTime = () => {
    clearInterval(timeoutID)
    setTimeoutID(setInterval(() => {
      if (accounts.length > 0) {
        getAccountInfo(accounts);
      }
    }, 1000 * sec));
  }
  

  useEffect(() => {
    if (sec > 0) {
      console.log('Change sec', sec);
      message.info(`Change time ${sec}`);
      loopTime();
    }
  }, [sec])

  useEffect(() => {
    // console.log('account change', accounts);
    getAccountInfo(accounts);
    loopTime();
  }, [accounts])

  
  
  return (
    <Row gutter={[12,12]}>
      <Col sm={{span:24}} md={{span:12}} lg={{span:6}}>
        <Search value={txtSearch} onChange={e=>setTxtSearch(e.target.value)} placeholder={'New Account'} allowClear={true} enterButton={<PlusOutlined />} onSearch={onSearch} />
      </Col>
      <Col sm={{span:24}} md={{span:12}} lg={{span:6}}>
        Refresh <InputNumber min={1} max={60*60} onChange={v => setSec(v)} defaultValue={sec} bordered={false} /> Sec.
      </Col>
      <Col span={24}>
        <ElementTable />
      </Col>
    </Row>
  )
}

export default AWAccount
