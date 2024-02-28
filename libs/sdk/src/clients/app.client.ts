import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AppClient } from '../types/client.types';
import { formatResponse } from '../utils';

export const getAppClient = (client: AxiosInstance): AppClient => {
  return {
    listConstants: async (name: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/app/constants/${name}`, config);
      return formatResponse<any>(response);
    },
  };
};
