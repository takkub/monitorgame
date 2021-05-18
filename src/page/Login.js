import React, {useEffect, useContext} from 'react';
import { Button } from 'antd';
import authContext from '../context/Auth';
import { useHistory, useLocation } from "react-router-dom";
import * as waxjs from "@waxio/waxjs/dist";
import * as awmine from "../alienworld/AWMine";
import {mining_account} from "../alienworld/AWConstants";

const Login = () => {
    const wax = new waxjs.WaxJS('https://api.waxsweden.org');

    // const background_mine = async (account) => {
    //     return new Promise(async (resolve, reject) => {
    //         const bagDifficulty = await getBagDifficulty(account);
    //         const landDifficulty = await getLandDifficulty(account);
    //         const difficulty = bagDifficulty + landDifficulty;
    //         console.log('difficulty', difficulty);
    //         // setStatus(`Mine difficulty ${difficulty}`);
    //
    //         console.log('start doWork = ' + Date.now());
    //         const last_mine_tx = await awmine.lastMineTx(mining_account, account, wax.api.rpc);
    //
    //         awmine.doWorkWorker({ mining_account, account, difficulty, last_mine_tx }).then(
    //           (mine_work) => {
    //               console.log('end doWork = ' + Date.now());
    //               console.log(mine_work);
    //               //   setStatus(`Mine data ${JSON.stringify(mine_work)}`);
    //               resolve(mine_work);
    //           }
    //         );
    //     });
    // };
    // const server_claim2 = async (mining_account1, account, account_permission, mine_data1, hyperion_endpoints) => {
    //     console.log(mining_account1);
    //     console.log(account);
    //     console.log(account_permission);
    //     console.log(mine_data1);
    //     console.log(hyperion_endpoints);
    //     try {
    //         var mine_work = JSON.parse(mine_data1);
    //         const mine_data = {
    //             miner: mine_work.account,
    //             nonce: mine_work.rand_str,
    //         };
    //         console.log("Claiming Now");
    //         const claimData = await claim(mining_account,account, 'active', mine_data, hyperion_endpoints, wax.api);
    //         console.log("Claim Data" + claimData);
    //         setStatus('Claiming...')
    //         setStatus(`Claim data : ${claimData.toString()}`)
    //     } catch (error) {
    //         console.log(error);
    //         setStatus('claim fail');
    //     }
    // }
    // const claim = (mining_account, account, account_permission, mine_data, hyperion_endpoints, eos_api) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const actions = [{
    //                 account: mining_account,
    //                 name: 'mine',
    //                 authorization: [{
    //                     actor: account,
    //                     permission: account_permission,
    //                 }],
    //                 data: mine_data
    //             }];
    //             const res = await eos_api.transact({
    //                 actions
    //             }, {
    //                 blocksBehind: 3,
    //                 expireSeconds: 90,
    //             });
    //
    //             console.log(res.transaction_id)
    //
    //             setStatus('Transaction claiming')
    //             setMineing(false);
    //             setCondition({ ...condition, delay: false });
    //             (async()=>awGetData())()
    //
    //             resolve(res.transaction_id);
    //         }
    //         catch (e){
    //             console.log(`Failed to push mine results ${e.message}`);
    //             reject(e);
    //         }
    //     });
    // }
    // const awMine = () => {
    //     try {
    //         background_mine(ac).then((mine_work) => {
    //             (async () => {
    //                 await server_claim2(mining_account, ac, 'active',  JSON.stringify(mine_work), ["https://api.waxsweden.org", "https://wax.eosrio.io"])
    //                 // awTransection(JSON.stringify(mine_work));
    //             })()
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         setStatus(`Fail mining!!`);
    //     }
    // }
    //

    const handlePopup = async () => {
        try {
            const user = await wax.login();
            const userAccount = wax.userAccount
            const pubKeys = wax.pubKeys


            console.log(userAccount)
            // auth.publicKey = user.pubKeys;
            // auth.userAccount = user.userAccount;
            // auth.isLogin = true;
            // history.replace(from)
            
        } catch (e) {
            console.log('Fail Login');
        }
    }
    return (
        <div>
            <Button onClick={handlePopup}>Login</Button>
        </div>
    )
}

export default Login
