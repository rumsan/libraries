import { AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import { RumsanClient } from '../rumsan.client';
import { Pagination, User } from '../types';
import { formatResponse } from '../utils';
export const Users = {
  create: async (data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/users',
      data,
      config,
    );
    return formatResponse<User>(response);
  },

  get: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get(
      `/users/${uuid}`,
      config,
    );
    return formatResponse<User>(response);
  },

  update: async (uuid: UUID, data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.patch(
      `/users/${uuid}`,
      data,
      config,
    );
    return formatResponse<User>(response);
  },

  delete: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.delete(
      `/users/${uuid}`,
      config,
    );
    return formatResponse<User>(response);
  },

  list: async (data?: Pagination, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get('/users', {
      params: data,
      headers: config?.headers,
      ...config,
    });
    return formatResponse<User[]>(response);
  },

  getMe: async (config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get(
      '/users/me',
      config,
    );
    return formatResponse<User>(response);
  },

  updateMe: async (data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.patch(
      '/users/me',
      data,
      config,
    );
    return formatResponse<User>(response);
  },

  // getRoles: async (uuid: UUID, config?: AxiosRequestConfig) => {
  //   const response = await RumsanClient.getAxiosInstance.post(
  //     `/users/${uuid}/roles`,
  //     config,
  //   );
  //   return formatResponse<>(response);
  // },

  addRoles: async (uuid: UUID, data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      `/users/${uuid}/roles`,
      data,
      config,
    );
    return formatResponse<User>(response);
  },

  // removeRoles: async (
  //   uuid: UUID,
  //   data: UpdateUserDto,
  //   config?: AxiosRequestConfig,
  // ) => {
  //   const response = await RumsanClient.getAxiosInstance.delete(
  //     `/users/${uuid}/roles`,
  //     data,
  //     config,
  //   );
  //   return formatResponse<>(response);
  // },
};
