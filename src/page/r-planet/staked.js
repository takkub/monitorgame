import React, {useEffect, useState} from "react";
import {Table, Typography} from 'antd';
import {getAdvanced, getItems, getReward, getType} from "../../function/getApi";
const { Text } = Typography;
const Staked = () => {
  const [list, setList] = useState([])
  const fetchData = async (pageState = null, fetchSize = 70) => {
    const type = await getType();
    const reward = await getReward();
    const items = await getItems('prize');
    const kolobok = await getItems('kolobok');
    const alienWorlds = await getType('atomicassets');
    const kolobokAdv = await getAdvanced();
    let recItems = items.data;
    let recReward = reward.data;
    let recKolobok = kolobok.data;
    let recKolobokAdv = kolobokAdv.data;
    let result = type.data.map(t => {
      let fReward = recReward.find(r => r.user === t.user)
      let fItems = recItems.find(r => r.user === t.user)
      let fKolobok = recKolobok.find(r => r.user === t.user)
      let fKolobokAdv = recKolobokAdv.find(r => r.user === t.user)
      return {
        ...t,
        collected: parseInt(fReward.collected.replace("000 AETHER", "")),
        unstaked:fItems.unstaked,
        staked: fReward.staked / 10000,
        kolobok: fKolobok ? fKolobok.unstaked : 0,
        kolobokAdv: fKolobokAdv ? fKolobokAdv.count : 0
      }
    })
    return {data: result}
  };
  useEffect(() => {
    (async () => {
      let {data} = await fetchData();
      // await LineAlert('TogTak','Test น่ะจ๊ะ')
      setList(data)
    })()
  }, []);
  const columns = [
    {title: "No.", dataIndex: 'key', key: 'key'},
    {title: 'User', dataIndex: 'user', key: 'user'},
    {title: 'Collected', dataIndex: 'collected', key: 'collected'},
    {title: 'Aether / Hour', dataIndex: 'staked', key: 'staked'},
    {title: 'Kolobok', dataIndex: 'kolobok', key: 'kolobok'},
    {title: 'Kolobok Adventure', dataIndex: 'kolobokAdv', key: 'kolobokAdv'},
    {title: 'UnStaked', dataIndex: 'unstaked', key: 'unstaked'},
    {title: 'Common', dataIndex: 'common', key: 'common'},
    {title: 'Uncommon', dataIndex: 'uncommon', key: 'uncommon'},
    {title: 'Rare', dataIndex: 'rare', key: 'rare'},
    {title: 'Epic', dataIndex: 'epic', key: 'epic'},
  ]
  return <>
    <Table
      pagination={{ pageSize: 100 }}
      size={'small'} columns={columns} dataSource={list}
      summary={pageData => {
        let totalKolobokAdv = 0;
        let totalKolobok = 0;
        let totalCollected = 0;
        let totalStaked = 0;
        let totalUnStaked = 0;
        let totalCommon = 0;
        let totalUncommon = 0;
        let totalRare = 0;
        let totalEpic = 0;

        pageData.forEach(({collected, staked,unstaked,kolobok,kolobokAdv, common,uncommon,rare,epic }) => {
          totalKolobok += kolobok;
          totalKolobokAdv += kolobokAdv;
          totalCollected += collected;
          totalStaked += staked;
          totalUnStaked += unstaked;
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
                <Text strong type="success">{totalStaked}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalKolobok}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalKolobokAdv}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text>{totalUnStaked}</Text>
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
