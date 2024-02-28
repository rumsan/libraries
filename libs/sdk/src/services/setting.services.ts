import { AxiosRequestConfig } from 'axios';
import { RumsanService } from '../rumsan.service';
import { Setting, UpdateSetting } from '../types';
import { formatResponse } from '../utils';

export const Settings = {
  listPublic: async (config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.get('/settings/public', config);
    return formatResponse<unknown>(response);
  },

  create: async (data: Setting, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post('/settings', data, config);
    return formatResponse<Setting>(response);
  },

  getPublic: async (name: string, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.get(
      `/settings/public/${name}`,
      config,
    );
    return formatResponse<Setting>(response);
  },

  update: async (name: string, data: Setting, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.patch(
      `/settings/${name}`,
      data,
      config,
    );
    return formatResponse<UpdateSetting>(response);
  },
};
