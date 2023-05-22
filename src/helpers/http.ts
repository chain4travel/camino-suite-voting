import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const DEFAULT_ERR_MESSAGE = 'something wrong';

const axiosInstance = axios.create({
  baseURL: '/mock_data/',
});

export const post = (url: string, data: any, config?: AxiosRequestConfig) => {
  return axiosInstance.post(url, data, config);
};

export const get = async (url: string, config?: AxiosRequestConfig) => {
  return axiosInstance.get(url, config);
};

const onSuccess = (response: AxiosResponse) => {
  console.debug('successful response', response);

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
