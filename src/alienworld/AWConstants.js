const atomicassets_account = "atomicassets";
const federation_account = "federation";
const mining_account = "m.federation";
const token_account = "alien.worlds";
const collection = "alien.worlds";
const endpoint = "https://api.waxsweden.org";
const atomic_endpoint = ['https://wax.api.atomicassets.io', 'https://wax3.api.atomicassets.io'];
//const endpoint = "https://testnet.waxsweden.org";
//const atomic_endpoint = "https://test.wax.api.atomicassets.io";
const { Api, JsonRpc, RpcError } = require('eosjs');
const {ExplorerApi, RpcApi} = require("atomicassets");
const fetch = require('node-fetch');

const aa_api = new ExplorerApi(atomic_endpoint[0], atomicassets_account, {
  fetch,
  rateLimit: 4,
});
const eos_rpc = new JsonRpc(endpoint, { fetch });

export {
  federation_account,
  mining_account,
  token_account,
  collection,
  atomic_endpoint,
  aa_api,
  eos_rpc,
};

