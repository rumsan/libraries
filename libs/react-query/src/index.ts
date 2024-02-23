export * from './auth';

import { RumsanClient } from '@rumsan/sdk';
import { useAuthStore } from './auth';

const envKeys =
  'NEXT_PUBLIC_API_HOST_URL' || 'REACT_APP_API_HOST' || 'NEXT_PUBLIC_API_HOST';

RumsanClient.setup({
  baseURL: process.env[envKeys] || 'http://localhost:3000',
});

RumsanClient.getAxiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
