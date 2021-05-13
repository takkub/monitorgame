import React, {useEffect, useState} from "react";
import { Table,Statistic } from 'antd';
import axios from 'axios';
import _ from "lodash";
const {Countdown} = Statistic;
const ListAdventures = () => {
  const [list,setList] = useState([])
  const fetchData = async (pageState = null, fetchSize = 70) => {
    let listUser = ['.5are.wam', '41xbq.wam', 'ymkro.wam', 'fahrk.wam', '1hzrq.wam', '4egrk.wam', '2ezbs', 'vdtsa.wam','hnwbg.wam']
    let allData = []
    for (let fetch of listUser) {
      let params = {
        "json": true,
        "code": "ilovekolobok",
        "scope": "ilovekolobok",
        "table": "advents",
        "table_key": "owner",
        "lower_bound": fetch,
        "upper_bound": fetch + 'a',
        "index_position": 2,
        "key_type": "i64",
        "limit": 1000,
        "reverse": false,
        "show_payer": false
      }
      const {data} = await axios.post(`https://wax.cryptolions.io/v1/chain/get_table_rows`,params)
        .catch(e => {
          console.log("catch", e);
          return {
            data: []
          };
        });
      for (let result of data.rows) {
        let JData = result.data ? JSON.parse(result.data) : ''
        let Monster = result.game ? result.game : 0
        let [Drop] = JData.p ? JData.p : ''
        switch (Monster) {
          case 0 :
            result.game = "ยาย";
            break;
          case 1:
            result.game = "กระต่าย";
            break;
          case 2:
            result.game = "หมาป่า";
            break;
          case 3:
            result.game = "หมี";
            break;
          case 4:
            result.game = "หมาจิ่งจอก";
            break;
          default:
            result.game = '';
          break;
        }
        switch (Drop) {
          case 0 :
            result.drop = "Common";
            break;
          case 1:
            result.drop = "UnCommon";
            break;
          case 2:
            result.drop = "Rare";
            break;
          case 3:
            result.drop = "Epic";
            break;
          default:
            result.game = '';
            break;
        }
        switch (JData.r) {
          case 0 :
            result.status = "แพ้";
            break;
          case 1:
            result.status = "ชนะ";
            break;
          default:
            result.game = '';
            break;
        }
        allData.push(result)
      }
    }
    _.orderBy(allData, ['owner', 'coldown', 'game'], ['asc', 'asc', 'asc']);
    return {
      data: allData
    };
  };
  useEffect(() => {
    (async () => {
      let {data} = await fetchData();
      setList(data)
    })()
  }, []);
  const columns = [
    {title: "Assetid", dataIndex: 'assetid', key:'assetid'},
    {title: 'Owner', dataIndex: 'owner', key:'owner'},
    {title: 'Game', dataIndex: 'game', key:'game'},
    {title: "Drop", dataIndex: 'drop', key:'drop'},
    {title: 'Coldown', dataIndex: 'coldown', key:'coldown', render: (text) => (<Countdown valueStyle={{'fontSize': '18px'}}  value={text * 1000}/>)},
    {
      title: 'Status', dataIndex: 'status', render: (text) => {
        return <span style={{
          fontSize: '18px',
          fontWeight: '600',
          color: text === 'ชนะ' ? '#1bff00' : '#ff0000'
        }}>{text}</span>
      }
    },
  ]
  return <>
    <Table size={'small'} columns={columns} dataSource={list} />
  </>
};
export default ListAdventures;
