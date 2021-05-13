import React, {useEffect, useState} from "react";
import {Table, Typography} from 'antd';
import {getReward, getType} from "../../function/getApi";
const { Text } = Typography;
const Staked = () => {
  const [list, setList] = useState([])
  const fetchData = async (pageState = null, fetchSize = 70) => {
    const type = await getType();
    const reward = await getReward();
    let recReward = reward.data;
    let result = type.data.map(t => {
      let fReward = recReward.find(r => r.user === t.user)
      return {
        ...t,
        collected: parseInt(fReward.collected.replace("000 AETHER", "")),
        staked: fReward.staked / 10000
      }
    })
    return {data: result}
  };
  useEffect(() => {
    (async () => {
      let {data} = await fetchData();
      setList(data)
    })()
  }, []);
  const columns = [
    {title: "No.", dataIndex: 'key', key: 'key'},
    {title: 'User', dataIndex: 'user', key: 'user'},
    {title: 'Collected', dataIndex: 'collected', key: 'collected'},
    {title: 'Aether / Hour', dataIndex: 'staked', key: 'staked'},
    {title: 'Common', dataIndex: 'common', key: 'common'},
    {title: 'Uncommon', dataIndex: 'uncommon', key: 'uncommon'},
    {title: 'Rare', dataIndex: 'rare', key: 'rare'},
    {title: 'Epic', dataIndex: 'epic', key: 'epic'},
  ]
  return <>
    <Table
      size={'small'} columns={columns} dataSource={list}
      summary={pageData => {
        let totalCollected = 0;
        let totalStaked = 0;
        let totalCommon = 0;
        let totalUncommon = 0;
        let totalRare = 0;
        let totalEpic = 0;

        pageData.forEach(({collected, staked, common,uncommon,rare,epic }) => {
          totalCollected += collected;
          totalStaked += staked;
          totalCommon += common;
          totalUncommon += uncommon;
          totalRare += rare;
          totalEpic += epic;
        });
        return (
          <>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={2}>Total</Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text strong type="success">{totalCollected}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalStaked}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalCommon}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalUncommon}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalRare}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalEpic}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </>
        );
      }}

    />
  </>
};
export default Staked;
