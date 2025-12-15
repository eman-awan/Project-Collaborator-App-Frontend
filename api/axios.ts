// import { API_PORT, API_URL } from '@env';
import { ENV_CONFIG } from '@/env_config';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from "expo-secure-store";

const apiURL = axios.create({
  baseURL: ENV_CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiURL.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type AxiosData<T = any> = AxiosResponse<T>['data'];
export default apiURL;
