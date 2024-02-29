import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Setting, UpdateSetting } from '../types';
import { SettingClient } from '../types/client.types';
import { formatResponse } from '../utils';

export const getSettingClient = (client: AxiosInstance): SettingClient => {
  return {
    listPublic: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/settings/public', config);
      return formatResponse<unknown>(response);
    },
    create: async (data: Setting, config?: AxiosRequestConfig) => {
      const response = await client.post('/settings', data, config);
      return formatResponse<Setting>(response);
    },
    getPublic: async (name: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/settings/public/${name}`, config);
      return formatResponse<Setting>(response);
    },
    update: async (
      name: string,
      data: Setting,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(`/settings/${name}`, data, config);
      return formatResponse<UpdateSetting>(response);
    },
  };
};
