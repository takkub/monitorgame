import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Progress, Row, Col, InputNumber,Checkbox, Collapse, Input  } from 'antd';
import {LoadingOutlined, CheckCircleFilled, CloseCircleFilled} from '@ant-design/icons';

import dayjs from 'dayjs';
import * as waxjs from "@waxio/waxjs/dist";

import { federation_account, mining_account, token_account, collection, atomic_endpoint, aa_api, eos_rpc } from '../alienworld/AWConstants';
import * as awmine from '../alienworld/AWMine';
// import { setPlayerData, setTagData, getBag, setBag, getLand, getLandById, setLand, getPlanets, getLandByPlanet, getPlayerData, getLandMiningParams, getBagMiningParams, getNextMineDelay, lastMineTx, doWork, doWorkWorker, processRandomQueue, setLandCommission, claim, get_bounty_from_tx } from '../alienworld/AWMine';
import { stake, unstake, refund, getMap, getBalance, getStaked, getUnstakes, subscribe, getAssets, getAssetsGraph, agreeTerms, agreedTermsVersion } from '../alienworld/AWFederation';
import authContext from "../context/Auth";

const { Panel } = Collapse;
const { TextArea } = Input;
const wax = new waxjs.WaxJS('https://api.waxsweden.org');


const Home = () => {
    let auth = useContext(authContext);
    const federation_account = 'federation';

    let secloop = 10000;
    const listHour = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];

    const [maxCPU, setMaxCPU] = useState(90);
    const [ac, setAC] = useState(auth.account);
    const [waxp, setWax] = useState('0 WAX');
    const [tlm, setTlm] = useState('0 TLM');
    const [cpu, setCpu] = useState(100)
    const [ram, setRam] = useState(100)
    const [net, setNet] = useState(100)
    const [items, setItems] = useState([]);
    const [mybag, setMyBag] = useState([]);
    const [map, setMap] = useState('');
    const [delay, setDelay] = useState('');
    const [status, setStatus] = useState('Loading...');
    const [history, setHistory] = useState([]);
    const [checkTime, setCheckTime] = useState(['7', '8', '9', '10', '11', '13', '14', '15', '16', '17', '19', '20', '21', '22', '23']);

    
    const [mineing, setMineing] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [condition, setCondition] = useState({
        time: (checkTime.includes(dayjs().hour().toString())===true),
        delay: false,
        cpu: false
    })
    

    const getWax = () => {
        let params = { code: "eosio.token", account: ac, symbol: "WAX" };
        axios.post('https://wax.greymass.com/v1/chain/get_currency_balance', JSON.stringify(params)).then(res => {
            if (res?.data.length === 1) {
                auth.wax = res.data[0];
                setWax(res.data[0]);
            }
        })
        return true;
    }
    const getTLM = () => {
        let params = {json:true,code:"alien.worlds",scope:ac,table:"accounts",table_key:"","lower_bound":"",upper_bound:"",index_position:1,key_type:"",limit:1,reverse:false,show_payer:false};
        axios.post('https://api.waxsweden.org/v1/chain/get_table_rows', params).then(res => {
            if (res?.data.rows.length >= 1) {
                auth.tlm = res.data?.rows[0]?.balance;
                setTlm(res.data?.rows[0]?.balance);
            }
        })
        return true;
    }
    const getItem = () => {
        axios.get(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${ac}&page=1&limit=10000&order=desc&sort=asset_id`)
            .then(res => {
                let objItem = res.data.data.filter(f => f.schema.schema_name === "tool.worlds").map(v => ({ code: v.asset_id, name: v.name }));
                setItems(objItem);
            })
        
    }
    const getCPURAM = () => {
        let params = {"account_name":ac};
        axios.post('https://api.waxsweden.org/v1/chain/get_account', params).then(res => {
            let tempCPU = ((res.data.cpu_limit.used / res.data.cpu_limit.max) * 100).toFixed(2).toString();
            let tempRAM = ((res.data.ram_usage / res.data.ram_quota) * 100).toFixed(2).toString();
            let tempNET = ((res.data.net_limit.used / res.data.net_limit.max) * 100).toFixed(2).toString();
            setCpu(+tempCPU);
            setRam(+tempRAM);
            setNet(+tempNET);
        })
    }

    const checkAll = (ch) => {
        if (ch) {
            setCheckTime(listHour);
        } else {
            setCheckTime([]);
        }
    }
    const checkOnce = (ch, val) => {
        if (ch) {
            setCheckTime([...checkTime, val]);
        } else {
            setCheckTime([...checkTime.filter(f => f!==val)]);
        }
    }
    
    

    const awGetMineDelay = async (account) => {
        try {
            console.log(wax);
            setStatus('Get delay')
            const bag = await awmine.getBag(mining_account, account, wax.api.rpc, aa_api);
            setStatus('Get bag')
            const land = await awmine.getLand(federation_account, mining_account, account, wax.api.rpc, aa_api);
            setStatus('Get land')

            setItems(bag.filter(f => f.schema.schema_name === "tool.worlds").map(v => ({ code: v.asset_id, name: v.name })));
            setMyBag(bag);
            setMap(`${land.asset_id} : ${land.name} (${land.data.x}x${land.data.y}) (Com.${land.data.commission / 100}%)`);
            
            const params = awmine.getBagMiningParams(bag);
            const land_params = awmine.getLandMiningParams(land);
            params.delay *= land_params.delay / 10;
            params.difficulty += land_params.difficulty;
            setStatus('Get next time mine')
            var minedelay = await awmine.getNextMineDelay(mining_account, account, params, wax.api.rpc);
            return minedelay;
        } catch (error) {
            console.log(error)
        }
    };
    
    const awGetPlayer = async (account) => {
        try {
            var data = await awmine.getPlayerData(
              federation_account,
              account,
              wax.api.rpc,
              aa_api
            );
            console.log(data)
        } catch (e) {
            console.log('Fail get player data',e);
        }
    }

    const awSetBag = async (account, bag) => {
        try {
            var items = JSON.parse(bag).items;
            if (items === undefined) throw new Error('missing items');
            if (items.length < 1 || items.length > 3)
            throw new Error('bag size must be [1-3]');
            
            await awmine.setBag(mining_account, account, items, wax.api);
        } catch (error) {
            console.log(error);
        }
    }
    const awGetBag = async (account) =>  {
        try {
          var data = await awmine.getBag(mining_account, account, wax.api.rpc, aa_api);
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }
    
    const awGetData = async () => {
        let d = await awGetMineDelay(ac);
        let seconds = Math.floor(d / 1000)
        let time = setInterval(() => {
            console.log(`Loop delay ${seconds} sec`)
            console.log(condition);
            let min = Math.floor(seconds / 60);
            let hour;
            if (min >= 60) {
                hour = Math.floor(min / 60);
            }
            let sec = seconds - (min * 60);
            if (seconds === 0) {
                setDelay('');
                console.log('clear time');
                clearInterval(time);
                console.log(condition);
                setCondition({ ...condition, delay: true });
            } else {
                seconds--;
                setDelay(`${(hour?hour.toString().padStart(2,'0')+':':'')}${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`);  
            }
        }, 1000);
        

    }

    const getBagDifficulty = async (account) => {
        try {
          const bag = await awmine.getBag(mining_account, account, wax.api.rpc, aa_api);
          const params = awmine.getBagMiningParams(bag);
          return params.difficulty;
        } catch (error) {
          return error;
        }
      };
      
    const getLandDifficulty = async (account) => {
        try {
          const land = await awmine.getLand(
            federation_account,
            mining_account,
            account,
            wax.api.rpc,
            aa_api
          );
          const params = awmine.getLandMiningParams(land);
          return params.difficulty;
        } catch (error) {
          return error;
        }
      };
    const background_mine = async (account) => {
        return new Promise(async (resolve, reject) => {
          const bagDifficulty = await getBagDifficulty(account);
          const landDifficulty = await getLandDifficulty(account);
          const difficulty = bagDifficulty + landDifficulty;
            console.log('difficulty', difficulty);
            // setStatus(`Mine difficulty ${difficulty}`);
      
          console.log('start doWork = ' + Date.now());
          const last_mine_tx = await awmine.lastMineTx(mining_account, account, wax.api.rpc);

          awmine.doWorkWorker({ mining_account, account, difficulty, last_mine_tx }).then(
                (mine_work) => {
                    console.log('end doWork = ' + Date.now());
                    console.log(mine_work);
                    //   setStatus(`Mine data ${JSON.stringify(mine_work)}`);
                    resolve(mine_work);
                }
            );
        });
    };

    const server_claim2 = async (mining_account1, account, account_permission, mine_data1, hyperion_endpoints) => {
        console.log(mining_account1);
        console.log(account);
        console.log(account_permission);
        console.log(mine_data1);
        console.log(hyperion_endpoints);
        try {
            var mine_work = JSON.parse(mine_data1);
            const mine_data = {
                miner: mine_work.account,
                nonce: mine_work.rand_str,
            };
            console.log("Claiming Now");
            const claimData = await claim(mining_account,account, 'active', mine_data, hyperion_endpoints, wax.api);
            console.log("Claim Data" + claimData);
            setStatus('Claiming...')
            setStatus(`Claim data : ${claimData.toString()}`)
        } catch (error) {
            console.log(error);
            setStatus('claim fail');
        }
    }
    const claim = (mining_account, account, account_permission, mine_data, hyperion_endpoints, eos_api) => {
        return new Promise(async (resolve, reject) => {
            try {
                const actions = [{
                    account: mining_account,
                    name: 'mine',
                    authorization: [{
                        actor: account,
                        permission: account_permission,
                    }],
                    data: mine_data
                }];
                const res = await eos_api.transact({
                    actions
                }, {
                    blocksBehind: 3,
                    expireSeconds: 90,
                });
    
                console.log(res.transaction_id)

                setStatus('Transaction claiming')
                setMineing(false);
                setCondition({ ...condition, delay: false });
                (async()=>awGetData())()
    
                resolve(res.transaction_id);
            }
            catch (e){
                console.log(`Failed to push mine results ${e.message}`);
                reject(e);
            }
        });
    }
    const getBountyFromTx = async (transaction_id, miner, hyperion_endpoints) => {
        // temporary fix
        // await sleep(4000);

        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 30; i++){
                for (let h = 0; h < hyperion_endpoints.length; h++){
                    const hyp = hyperion_endpoints[h];
                    if (hyp != 'https://wax.eosusa.news')
                    {
                        try {
                            const url = `${hyp}/v2/history/get_transaction?id=${transaction_id}`
                            const t_res = await fetch(url);
                            const t_json = await t_res.json();
                            // console.log(t_json)
                            if (t_json.executed){
                                let amount = 0
                                const amounts = t_json.actions.filter(a => a.act.name === 'transfer').map(a => a.act).filter(a => a.data.to === miner).map(a => a.data.quantity)
                                amounts.forEach(a => amount += parseFloat(a))
                                if (amount > 0){
                                    resolve(`${amount.toFixed(4)} TLM`)
                                    return
                                }
                            }
                        }
                        catch (e){
                            console.log(e.message)
                        }
                    }

                    // await sleep(1000);
                }

                // await sleep(2000);
            }

            resolve('UNKNOWN');
        });
    }

    const sleep = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
      

    const awMine = () => {
        try {
            background_mine(ac).then((mine_work) => {
                (async () => {
                    await server_claim2(mining_account, ac, 'active',  JSON.stringify(mine_work), ["https://api.waxsweden.org", "https://wax.eosrio.io"])
                    // awTransection(JSON.stringify(mine_work));
                })()
            });
        } catch (error) {
            console.log(error);
            setStatus(`Fail mining!!`);
        }
    }

    const awTransection = (data) => {
        var mine_work = JSON.parse(data);
        try {
          console.log(`${mine_work.account} Pushing mine results...`);
            setStatus(`Pushing transection.`);
          const mine_data = {
            miner: mine_work.account,
            nonce: mine_work.rand_str,
          };
      
          console.log('mine_data', mine_data);
      
          const actions = [
            {
              account: mining_account,
              name: 'mine',
              authorization: [
                {
                  actor: mine_work.account,
                  permission: 'active',
                },
              ],
              data: mine_data,
            },
          ];
          
                wax.api
                .transact(
                  {
                    actions,
                  },
                  {
                    blocksBehind: 3,
                    expireSeconds: 90,
                  }
                )
                .then((result) => {
                  console.log('result is=', result);
          
                  var amounts = new Map();
                  if (result && result.processed) {
                    let mined_amount = 0;
                    result.processed.action_traces[0].inline_traces.forEach((t) => {
                        if (t.act.account === 'alien.worlds' && t.act.name === 'transfer' && t.act.data.to === mine_work.account){
                        const [amount_str] = t.act.data.quantity.split(' ');
                        mined_amount += parseFloat(amount_str);        
                        }
                    });
                  
                    console.log(`${mined_amount.toFixed(4)} TLM`);
                      setStatus(`Mine success!! ${mined_amount.toFixed(4)} TLM`);
                      setHistory([...history, `${dayjs().format('YYYY-MM-DD HH:mm:ss')} ${mined_amount.toFixed(4)} TLM`]);
                      setMineing(false);
                      setCondition({ ...condition, delay: false });
                      (async()=>awGetData())()
                  }
                }).catch((err) => {
                    console.log(err);
                    setStatus(`${err}`);
                });
        } catch (error) {
            console.log(error);
            setStatus(`Fail push transection!!`);
        }
    }
    
    useEffect(() => {
        console.log(history)
    }, [history])
    useEffect(() => {
        if (checkTime.includes(dayjs().hour().toString())===true) {
            setCondition({ ...condition, time: true });
        } else {
            setCondition({ ...condition, time: false });
        }
    }, [checkTime])
    useEffect(() => {
        if (cpu <= maxCPU) {
            setCondition({ ...condition, cpu: true });
        } else {
            setCondition({ ...condition, cpu: false });
        }
    }, [cpu]);
    useEffect(() => {
        console.log((checkTime.includes(dayjs().hour().toString())===true), checkTime, dayjs().hour().toString());
        console.log('condition', condition);
        if (condition.time === false) {
            setStatus('Time to offline');
        } else if (condition.delay === false) {
            setStatus('Waiting...');
        } else if (condition.cpu === false) {
            setStatus(`Waiting checking cpu every 15 sec.`);
        } else {
            if (mineing) {
                setStatus(`Minging...`);
            } else {
                setMineing(true);
                setStatus(`Time to mine`);
                awMine()
            }
            
        }
    }, [condition])

    useEffect(() => {
        (async () => {
            if (wax?.api) {
                setStatus(`Login ${ac}`)
                getWax();
                getTLM();
                getCPURAM();
                await awGetData();
            }
        })()
        
        let timer = window.setInterval(() => {
            console.log('get cpu every 15 sec.')
            getCPURAM()
        }, 15000)
        return () => {
            window.clearInterval(timer);
        };
    }, [wax,ac])

    useEffect(() => {
        (async () => {
            setStatus('Login...')
            const user = await wax.login();
            setAC(user);
        })()
    }, [])
    
    return (
        <div>
            <h1>{ac ? `Hi, ${ac}`: 'Wait auto login'}</h1>
            <p>{tlm} / {waxp} </p>
            <p>Status : {status}</p>
            <Row gutter={[4, 4]}>
                <Col span={8}>
                    <p>Delay :<br />{condition.delay ?<CheckCircleFilled style={{color:'green'}} />:<CloseCircleFilled style={{color:'red'}}  />} {`${delay}`}</p>
                </Col>
                <Col span={8}>
                    <p>Time :<br />{condition.time ?<CheckCircleFilled style={{color:'green'}} />:<CloseCircleFilled style={{color:'red'}}  />} {condition.time===false ? 'Offline' : 'Online'}</p>
                </Col>
                <Col span={8}>
                    <p>CPU :<br />{condition.cpu ?<CheckCircleFilled style={{color:'green'}} />:<CloseCircleFilled style={{color:'red'}}  />} {`${cpu.toFixed(0)}/${maxCPU} %`}</p>
                </Col>
            </Row>
            <Row gutter={[12,12]} style={{marginBottom:'15px'}}>
                <Col span={24}>
                    <div>
                        <span style={{marginRight:'5px'}}>CPU / MAX : <InputNumber onChange={v=>setMaxCPU(v)} min={1} max={99} defaultValue={maxCPU} bordered={false} /></span>
                        <Progress percent={cpu} status={(cpu>maxCPU?'exception':'active')} />
                    </div>
                    <div>
                        <span style={{marginRight:'5px'}}>RAM</span>
                        <Progress percent={ram} status={ram>90?'exception':'active'}  />
                    </div>
                    <div>
                        <span style={{marginRight:'5px'}}>NET</span>
                        <Progress percent={net} status={ram>90?'exception':'active'} />
                    </div>
                </Col>
            </Row>
            <Row gutter={[12, 12]}>
                <Col span={24}>
                    {map}
                </Col>
                <Col span={24}>
                    {items && items.map((v, i) => <p key={i} style={{ marginBottom: 0}}>{`${v.code} : ${v.name}`}</p>)}
                </Col>
                <Col span={24}>
                    <TextArea rows={4} bordered={false} placeholder={'History ..'} value={history && history.map((v, i) => <span key={i}>{v}</span>)} />
                </Col>
                <Col span={24}>
                    <Collapse ghost expandIcon={() => ''}>
                        <Panel header="Config time online" key="1">
                            <div key={'all'}><Checkbox onChange={v => checkAll(v.target.checked)}>{`All`}</Checkbox></div>
                            {
                                listHour.map((h, i) => {
                                    return <div key={i}><Checkbox onChange={v => checkOnce(v.target.checked, h)} checked={!!checkTime.find(f => f === h)}>{`${h.toString().padStart(2,'0')}:00-${h.toString().padStart(2,'0')}:59`}</Checkbox></div>
                                })
                            }
                        </Panel>
                    </Collapse>
                </Col>
            </Row>


            
        
            
            
           

         
        </div>
    )
}

export default Home
