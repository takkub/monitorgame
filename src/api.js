import axios from "axios";
const apiClient = (config) => {
  const axiosConfig = config;
  axiosConfig.withCredentials = true;
  const client = axios.create(axiosConfig);

  client.interceptors.request.use(
    async (config) => {

      return config;
    },
    (error) => Promise.resolve({ error })
  );

  client.interceptors.response.use(
    (response) => Promise.resolve(response),
    (error) => {
      return Promise.reject(error.response);
    }
  );

  return client;

};

export const serverApi = (url) => {
  console.log(url)
  return apiClient({
    "baseURL": url,
    // "withCredentials": true,
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });
};
