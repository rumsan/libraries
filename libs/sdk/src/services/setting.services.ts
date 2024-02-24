import { AxiosRequestConfig } from 'axios';
import { CreateSettingDto, UpdateSettingDto } from '../dtos';
import { RumsanClient } from '../rumsan.client';
import { Setting, UpdateSetting } from '../types';
import { formatResponse } from '../utils';

export const Settings = {
  listPublic: async (config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get(
      '/settings/public',
      config,
    );
    return formatResponse<unknown>(response);
  },

  create: async (data: CreateSettingDto, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/settings',
      data,
      config,
    );
    return formatResponse<Setting>(response);
  },

  getPublic: async (name: string, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get(
      `/settings/public/${name}`,
      config,
    );
    return formatResponse<Setting>(response);
  },

  update: async (
    name: string,
    data: UpdateSettingDto,
    config?: AxiosRequestConfig,
  ) => {
    const response = await RumsanClient.getAxiosInstance.patch(
      `/settings/${name}`,
      data,
      config,
    );
    return formatResponse<UpdateSetting>(response);
  },
};
