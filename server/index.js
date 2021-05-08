const express = require('express')
const axios = require('axios');
const index = express()
const ac = require("@antiadmin/anticaptchaofficial");
const waxjs = require("@waxio/waxjs/dist");
const apiClient = async (config, req, res) => {
  const client = axios.create({
    transformRequest: [
      (data, headers) => {
        return data;
      },
      ...axios.defaults.transformRequest
    ],
    transformResponse: [
      (data) => {
        try {
          return JSON.parse(data || "{}");
        } catch (error) {
          console.log('Error Pef1', error)
        }
      },
      ...axios.defaults.transformResponse
    ]
  });

  client.interceptors.request.use(
    config => {
      console.log(req.headers)
      config.headers['Content-Type'] = !config.headers["Content-Type"] ? "application/json" : config.headers["Content-Type"];
      config.headers['Accept'] = "application/json";
      config.headers['X-Frame-Options'] = "DENY";
      config.headers['Access-Control-Allow-Origin'] = "http://localhost:3000";
      return config;
    },
    error => {
      Promise.reject(error)
    });

  client.interceptors.response.use(
    response => {
      return Promise.resolve(response)
    },
    error => {
      return Promise.reject(error);
    });
  return client.request(config);
};

index.get('/', (req, res) => {
  res.send('Hello World')
})
index.get('/captcha', (req, res) => {
//set API key
  ac.setAPIKey('024abf85776e9b810a0bebcc6b886422');
  ac.solveRecaptchaV2Proxyless('https://all-access.wax.io/cloud-wallet/signing', '6LdaB7UUAAAAAD2w3lLYRQJqsoup5BsYXI2ZIpFF')
    .then(gresponse => {
      console.log('g-response: '+gresponse);
      console.log('google cookies:');
      console.log(ac.getCookies());
    })
    .catch(error => console.log('test received error '+error));
  res.send('Hello World')
})

index.get('/login', async (req, res) => {
  // const wax = new waxjs.WaxJS('https://wax.greymass.com');
  // const wax = new waxjs.WaxJS('https://api-idm.wax.io/', null, null, false);
  const wax = new waxjs.WaxJS('https://wax.greymass.com', 'hnwbg.wam', ['EOS5fReTHjAhq7kAykhAHVaFm5h1Tmdh3XL2jfh3oMLLEak3RnDDz','EOS7DaLBULzPXKmV6V7aJrawgn2rwmK82o33k3KiAc8GBCWuM6qBd','EOS8UhZSLGoiUSifugc4x2LrLbKW6GwKKNzJbxtZBBChqcKbfV18G']);

  console.log(await wax)
  res.send('Hello World')
})

index.post("/apiOutSite", async (req, res) => {
  try {
    let data = req.body.params
    const response = await apiClient({
      baseURL: 'https://wax.cryptolions.io',
      method: 'post',
      url: '/v1/chain/get_table_rows',
      data
    }, req, res);
    res.status(response.status).send(response.data);
  } catch (e) {
    res.status(e.response.status).send(e.response.data)
  }
});

index.listen(3000, () => {
  console.log('Start server at port 3000.')
})
