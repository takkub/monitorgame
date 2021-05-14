const fetch = require('node-fetch');

const stake = async (token_account, federation_account, account, planet_name, quantity, eos_api) => {
    const actions = [{
        account: token_account,
        name: 'transfer',
        authorization: [{
            actor: account,
            permission: 'active',
        }],
        data: {
            from: account,
            to: federation_account,
            quantity,
            memo: 'staking'
        }
    }];

    actions.push({
        account: federation_account,
        name: 'stake',
        authorization: [{
            actor: account,
            permission: 'active',
        }],
        data: {
            account,
            planet_name,
            quantity
        }
    });

    const res = await eos_api.transact({
        actions
    }, {
        blocksBehind: 3,
        expireSeconds: 90,
    });

    return res;
};


const unstake = async (federation_account, token_account, account, planet_name, quantity, eos_api) => {
    const actions = [];

    // get planet symbol from federation account
    const planet_res = await eos_api.rpc.get_table_rows({code: federation_account, scope: federation_account, table: 'planets', limit: 1, lower_bound: planet_name, upper_bound: planet_name});

    if (!planet_res.rows.length){
        throw new Error(`Could not find planet ${planet_name}`);
    }

    const [precision, sym] = planet_res.rows[0].dac_symbol.split(',');
    // fix decimals
    quantity = parseFloat(quantity).toFixed(precision);
    quantity = `${quantity} ${sym}`;

    actions.push({
        account: token_account,
        name: 'transfer',
        authorization: [{
            actor: account,
            permission: 'active',
        }],
        data: {
            from: account,
            to: federation_account,
            quantity: quantity,
            memo: 'Unstaking'
        }
    });

    const res = await eos_api.transact({
        actions
    }, {
        blocksBehind: 3,
        expireSeconds: 90,
    });

    return res;
};


const refund = async (federation_account, account, refund_id, eos_api) => {
    const actions = [];

    actions.push({
        account: federation_account,
        name: 'refund',
        authorization: [{
            actor: account,
            permission: 'active',
        }],
        data: {
            id: refund_id
        }
    });

    const res = await eos_api.transact({
        actions
    }, {
        blocksBehind: 3,
        expireSeconds: 90,
    });

    return res;
};

const getMap = async (federation_account, planet_name, eos_api) => {
    const res = await eos_api.rpc.get_table_rows({code: federation_account, scope: planet_name, table: 'maps', limit: 1000});
    const map = [];
    res.rows.forEach((row) => {
        if (typeof map[row.x] === 'undefined'){
            map[row.x] = [];
        }

        map[row.x][row.y] = row.asset_id;
    });

    return map;
}

const getBalance = async (account, eos_rpc) => {
    const res = await eos_rpc.get_table_rows({code: 'alien.worlds', scope: account, table: 'accounts', limit: 1});

    let balance = '0.0000 TLM';
    if (res.rows.length){
        balance = res.rows[0].balance;
    }

    return balance;
}

const getStaked = async (federation_account, account, eos_rpc) => {
    // Get a list of the planets and then get balance for each
    const planets_res = await eos_rpc.get_table_rows({code: federation_account, scope: federation_account, table: 'planets', limit: 100});

    const bal_res = await eos_rpc.get_currency_balance('token.worlds', account);

    const planet_tokens = {};
    let total = 0;

    if (planets_res.rows.length){
        planets_res.rows.forEach((p) => {
            if (p.active){
                const planet_sym = p.dac_symbol.split(',')[1];
                let planet_balance = `0.0000 ${planet_sym}`;
                bal_res.forEach((bal_str) => {
                    const [amount, sym] = bal_str.split(' ');
                    if (planet_sym === sym){
                        planet_balance = bal_str;
                    }
                });
                const [amount, symbol] = planet_balance.split(' ');

                planet_tokens[p.planet_name] = {amount, symbol};

                total += parseFloat(amount);
            }
        });
    }

    const planet_tokens_a = [];
    for (let p in planet_tokens){
        const pa = planet_tokens[p];
        pa.planet_name = p;
        planet_tokens_a.push(pa);
    }

    return {staked: planet_tokens_a, total};
}

const getUnstakes = async (federation_account, account, eos_rpc) => {
    const refunds_res = await eos_rpc.get_table_rows({
        code: federation_account,
        scope: federation_account,
        table: 'refunds',
        index_position: 2,
        key_type: 'i64',
        upper_bound: account,
        lower_bound: account,
        limit: 100
    });

    return refunds_res.rows;
}

const getAssets = async (account, aa_endpoints, collection, schema = '', tries = 0) => {
    if (typeof aa_endpoints === 'string'){
        aa_endpoints = [aa_endpoints];
    }
    let aa_endpoint = aa_endpoints[tries];
    console.log(`Trying endpoint ${aa_endpoint} for try ${tries}`);

    try {
        let url = `${aa_endpoint}/atomicassets/v1/assets?collection_name=${collection}&owner=${account}&limit=200`
        if (schema){
            url += `&schema_name=${schema}`
        }
        const res = await fetch(url);
        const res_json = await res.json();
        // console.log(res_json);
        if (typeof res_json !== 'object') {
            throw new Error('There was a temporary error on the server, please wait a few minutes and refresh the page to try again');
        }
        if (res_json.errors && res_json.errors.length){
            // console.log(res_json.errors[0].extensions);
            if (res_json.errors[0].extensions.code === 'rate-limit'){
                throw new Error('The server is currently overloaded, please wait a few minutes and refresh the page to try again');
            }
            else {
                throw new Error(res_json.errors[0].message);
            }
        }

        if (res_json.success === false){
            throw new Error(res_json.message);
        }
        const assets = res_json.data;

        const tools_map = new Map();
        for (let a=0; a<assets.length; a++){
            const asset = assets[a];
            if (schema === 'land.worlds'){
                tools_map.set(asset.asset_id, asset);
            }
            else {
                const identifier = `${asset.data.cardid}|${asset.data.shine}`;
                asset.quantity = 1;
                if (!tools_map.has(identifier)){
                    asset.asset_ids = [asset.asset_id];
                    delete asset.asset_id;
                    tools_map.set(identifier, {owner: asset.owner, data: asset.data, asset_ids: asset.asset_ids, quantity: asset.quantity});
                }
                else {
                    const tool = tools_map.get(identifier);
                    tool.asset_ids.push(asset.asset_id);
                    tool.quantity++;
                    tools_map.set(identifier, tool);
                }
            }
        }

        return Array.from(tools_map.values());
    }
    catch (e){
        let error_msg = e.message
        console.error(error_msg);

        if (tries >= aa_endpoints.length - 1){
            throw e;
        }
        else {
            return await getAssets(account, aa_endpoints, collection, schema, ++tries)
        }
    }
}

const getAssetsGraph = async (account, aa_endpoints, collection, schema = '', tries = 0) => {
    if (typeof aa_endpoints === 'string'){
        aa_endpoints = [aa_endpoints];
    }
    let aa_endpoint = aa_endpoints[tries];
    console.log(`Trying endpoint ${aa_endpoint} for try ${tries}`);
    const query_obj = {
        "query":`query ToolsQuery {
          atomicassets_assets(where: {owner: {_eq: "${account}"}, collection_name: {_eq: "${collection}"}, schema_name: {_eq: "${schema}"}}, limit: 1000) {
            asset_id
            atomicassets_asset_data {
              data
            }
            owner
          }
        }
        `,
        "variables":null,
        "operationName":"ToolsQuery"
    }

    try {
        const res = await fetch(`${aa_endpoint}/v1/graphql`, {
            method: 'POST',
            body: JSON.stringify(query_obj),
            headers: { 'Content-Type': 'application/json' }
        });
        const res_json = await res.json();
        // console.log(res_json);
        if (typeof res_json !== 'object') {
            throw new Error('There was a temporary error on the server, please wait a few minutes and refresh the page to try again');
        }
        if (res_json.errors && res_json.errors.length){
            // console.log(res_json.errors[0].extensions);
            if (res_json.errors[0].extensions.code === 'rate-limit'){
                throw new Error('The server is currently overloaded, please wait a few minutes and refresh the page to try again');
            }
            else {
                throw new Error(res_json.errors[0].message);
            }
        }
        // return res_json;
        // console.log(res_json);
        if (res_json.success === false){
            throw new Error(res_json.message);
        }
        const assets = res_json.data.atomicassets_assets;
        // console.log(assets);

        const tools_map = new Map();
        // const assets = await aa_api.getAssets({owner: account, collection_name: collection, schema_name: schema}, 1, 1000);
        for (let a=0; a<assets.length; a++){
            const asset = assets[a];
            // console.log(asset.atomicassets_asset_data);
            // asset.atomicassets_asset_data = null;
            if (!asset.atomicassets_asset_data){
                // console.log(`Do not have AA data`, aa_endpoint, asset.asset_id);
                const data_url = `${aa_endpoint}/atomicassets/v1/assets/${asset.asset_id}`;
                const data_res = await fetch(data_url);
                const data_json = await data_res.json();
                // console.log(data_json);
                asset.atomicassets_asset_data = data_json.data;
                // continue;
            }
            asset.data = asset.atomicassets_asset_data.data;
            delete asset.atomicassets_asset_data;
            // console.log(asset);
            // continue;

            if (schema === 'land.worlds'){
                tools_map.set(asset.asset_id, asset);
            }
            else {
                const identifier = `${asset.data.cardid}|${asset.data.shine}`;
                asset.quantity = 1;
                if (!tools_map.has(identifier)){
                    asset.asset_ids = [asset.asset_id];
                    delete asset.asset_id;
                    tools_map.set(identifier, asset);
                }
                else {
                    const tool = tools_map.get(identifier);
                    tool.asset_ids.push(asset.asset_id);
                    tool.quantity++;
                    tools_map.set(identifier, tool);
                }
            }
        }

        return Array.from(tools_map.values());
    }
    catch (e){
        let error_msg = e.message
        console.error(error_msg);

        if (tries >= aa_endpoints.length - 1){
            throw e;
        }
        else {
            return await getAssets(account, aa_endpoints, collection, schema, ++tries)
        }
    }
}

const agreeTerms = async (federation_account, account, terms_id, terms_hash, eos_api) => {
    const actions = [];

    actions.push({
        account: federation_account,
        name: 'agreeterms',
        authorization: [{
            actor: account,
            permission: 'active',
        }],
        data: {
            account,
            terms_id,
            terms_hash
        }
    });

    const res = await eos_api.transact({
        actions
    }, {
        blocksBehind: 3,
        expireSeconds: 90,
    });

    return res;
}

const agreedTermsVersion = async (federation_account, account, eos_rpc) => {
    const terms_res = await eos_rpc.get_table_rows({
        code: federation_account,
        scope: federation_account,
        table: 'userterms',
        upper_bound: account,
        lower_bound: account,
        limit: 1
    });

    if (terms_res.rows.length){
        return terms_res.rows[0].terms_id;
    }

    return 0;
}

const axon = require('axon');

const subscribe = async (account, callback, ws_host = 'api-ws.alienworlds.io', ws_port = 3000, test = false) => {
    const sock = axon.socket('sub-emitter');

    sock.connect(ws_port, ws_host);

    const sub = (test)?`test:test`:`asset:${account}`;

    sock.on(sub, function(msg){
        if (msg && msg.action === 'mint'){
            callback(msg);
        }
    });
}

export { stake, unstake, refund, getMap, getBalance, getStaked, getUnstakes, subscribe, getAssets, getAssetsGraph, agreeTerms, agreedTermsVersion }


