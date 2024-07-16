import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Pagination, Setting, SettingList } from '../types';
import { SettingClient } from '../types/client.types';
import { formatResponse } from '../utils/formatResponse.utils';

export const getSettingClient = (client: AxiosInstance): SettingClient => {
  return {
    listPublic: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/settings/public', {
        params: data,
        ...config,
      });
      return formatResponse<SettingList>(response);
    },
    create: async (data: Setting, config?: AxiosRequestConfig) => {
      const response = await client.post('/settings', data, config);
      return formatResponse<Setting>(response);
    },
    getPublic: async (name: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/settings/public/${name}`, config);
      return formatResponse<Setting>(response);
    },

    update: async (data: Setting, config?: AxiosRequestConfig) => {
      const response = await client.patch(
        `/settings/${data?.name}`,
        data,
        config,
      );
      return formatResponse<Setting>(response);
    },
  };
};
