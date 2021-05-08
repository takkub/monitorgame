import axios from "axios";
const SERVER_API = 'http://localhost:3000';
const apiClient = (config) => {
  console.log(config)
  const { redirect, ...axiosConfig } = config;
  axiosConfig.withCredentials = true;
  if (!redirect) {
    axiosConfig.transformRequest = [
      (data, headers) => {
        return data;
      },
      ...axios.defaults.transformRequest
    ];

  }

  const client = axios.create(axiosConfig);

  client.interceptors.request.use(
    async (config) => {

      if (redirect === true) {
        const body = JSON.parse(JSON.stringify(config));
        // console.log('console.logbody', body);
        delete body.transformRequest;
        delete body.transformResponse;
        config.baseURL = process.env.SERVER_API;
        config.url = "/api";
        config.method = "post";
        config.data = JSON.stringify(body);
        config.params = null;
      }

      return config;

    },
    (error) => Promise.resolve({ error })
  );

  client.interceptors.response.use(
    (response) => Promise.resolve(response),
    (error) => {
      return Promise.reject(error);
    }
  );
  return client;

};

export const serverApi = () => {
  return apiClient({
    "baseURL": SERVER_API,
    // "withCredentials": true,
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });
};
