import React from "react";
import {Button} from "antd";
import * as waxjs from "@waxio/waxjs/dist";

const Bot = () => {
  const wax = new waxjs.WaxJS('https://api.waxsweden.org', '.5are.wam',["EOS7DaLBULzPXKmV6V7aJrawgn2rwmK82o33k3KiAc8GBCWuM6qBd", "EOS7dSfgTsBkrRUHu7Pb3NC28iGyfcMQZwTN2JjEvL2QdmsPBbjjq", "EOS8UhZSLGoiUSifugc4x2LrLbKW6GwKKNzJbxtZBBChqcKbfV18G"], false);
  const handlePopup = async () => {
    try {
      const user = await wax.login();
      const userAccount = wax.userAccount
      const pubKeys = wax.pubKeys
      console.log(userAccount)
      let result = await wax.api.transact({
        actions: [{
          account: 'simpleassets',
          name: 'transfer',
          authorization: [{
            actor: wax.userAccount,
            permission: 'active',
          }],
          data: {
            from: wax.userAccount,
            to: '41xbq.wam',
            quantity: '0.00000001 WAX',
            memo: '',
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 1200,
      });
      console.log(result)
    } catch (e) {

      console.log('Fail Login');
    }
  }
  return (
    <div>
      <Button onClick={handlePopup}>Login</Button>
    </div>
  )
};
export default Bot;
