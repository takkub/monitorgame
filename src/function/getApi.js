import axios from "axios";
export const getType = async () => {
  let allData = []
  let listUser = [
    {
      user: "hnwbg.wam",
      lower_bound: "144846706769350346599474509966485749760",
      upper_bound: "144846706769350346617921254040195301375",
    },
    {
      user: ".5are.wam",
      lower_bound: "1731408175145289022618015696940957696",
      upper_bound: "1731408175145289041064759770650509311",
    },
    {
      user: "fahrk.wam",
      lower_bound: "119108531806412413348189687557044305920",
      upper_bound: "119108531806412413366636431630753857535",
    },
    {
      user: "vdtsa.wam",
      lower_bound: "290371474494830808016014241899804098560",
      upper_bound: "290371474494830808034460985973513650175",
    },
    {
      user: "1hzrq.wam",
      lower_bound: "15283424670378811043105154799713124352",
      upper_bound: "15283424670378811061551898873422675967",
    },
    {
      user: "ymkro.wam",
      lower_bound: "325170065499044789917391812772975607808",
      upper_bound: "325170065499044789935838556846685159423",
    },
    {
      user: "41xbq.wam",
      lower_bound: "43171251097569370235942450583954259968",
      upper_bound: "43171251097569370254389194657663811583",
    },
    {
      user: "4egrk.wam",
      lower_bound: "45990607444524970683223238248966914048",
      upper_bound: "45990607444524970701669982322676465663",
    }
  ]

  let i = 1;
  for (let fetch of listUser) {
    let paramsType = {
      "json": true,
      "code": "s.rplanet",
      "scope": "simpleassets",
      "table": "assets",
      "lower_bound": fetch.lower_bound,
      "upper_bound": fetch.upper_bound,
      "index_position": "2",
      "key_type": "i128",
      "limit": 1000,
      "reverse": false,
      "show_payer": false
    }

    const {data} = await axios.post(`https://wax.cryptolions.io/v1/chain/get_table_rows`, paramsType)
    let result = {
      key: i++,
      user: fetch.user,
      common: data.rows.filter(v => v.rarity === 'common').length,
      uncommon: data.rows.filter(v => v.rarity === 'uncommon').length,
      rare: data.rows.filter(v => v.rarity === 'rare').length,
      epic: data.rows.filter(v => v.rarity === 'epic').length
    }
    allData.push(result)
  }
  return {
    data: allData
  };
}
export const getReward = async () => {
  let allData = []
  let listUser = ['.5are.wam', '41xbq.wam', 'ymkro.wam', 'fahrk.wam', '1hzrq.wam', '4egrk.wam', '2ezbs', 'vdtsa.wam', 'hnwbg.wam']
  let i = 1;
  for (let fetch of listUser) {
    let params = {
      "json": true,
      "code": "s.rplanet",
      "scope": "s.rplanet",
      "table": "accounts",
      "lower_bound": fetch,
      "upper_bound": fetch,
      "index_position": 1,
      "key_type": "name",
      "limit": 1,
      "reverse": false,
      "show_payer": false
    }
    await axios.post(`https://wax.cryptolions.io/v1/chain/get_table_rows`, params).then(result => {
      if (result.data.rows.length > 0) {
        let [record] = result.data.rows
        allData.push(record)
      }
    }).catch(error => {
      console.log(error)
    })
  }
  return {
    data: allData
  };
}

