import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const DEFAULT_ERR_MESSAGE = 'something wrong';
const DEFAULT_API_VERSION = 'v2';

const axiosInstance = axios.create({
  baseURL: process.env.MAGELLAN_API_HOST ?? '/mock_data/',
});

export const updateBaseUrl = (url: string) =>
  (axiosInstance.defaults.baseURL = `${url}/${DEFAULT_API_VERSION}`);
export const post = (url: string, data: any, config?: AxiosRequestConfig) => {
  return axiosInstance.post(url, data, config);
};

export const get = async (url: string, config?: AxiosRequestConfig) => {
  return axiosInstance.get(url, config);
};

const onSuccess = (response: AxiosResponse) => {
  return response;
};

const onError = (error: any) => {
  console.debug('error response', error.response);

  const errorMessage =
    error?.response?.data?.error?.message || DEFAULT_ERR_MESSAGE;

  console.error(errorMessage);

  return Promise.reject({ message: errorMessage });
};

axiosInstance.interceptors.response.use(onSuccess, onError);
