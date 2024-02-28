import { AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import { RumsanService } from '../rumsan.service';
import { Pagination, User } from '../types';
import { formatResponse } from '../utils';
export const Users = {
  create: async (data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post('/users', data, config);
    return formatResponse<User>(response);
  },

  get: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.get(`/users/${uuid}`, config);
    return formatResponse<User>(response);
  },

  update: async (uuid: UUID, data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.patch(
      `/users/${uuid}`,
      data,
      config,
    );
    return formatResponse<User>(response);
  },

  delete: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.delete(
      `/users/${uuid}`,
      config,
    );
    return formatResponse<User>(response);
  },

  list: async (data?: Pagination, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.get('/users', {
      params: data,
      headers: config?.headers,
      ...config,
    });
    return formatResponse<User[]>(response);
  },

  getMe: async (config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.get('/users/me', config);
    return formatResponse<User>(response);
  },

  updateMe: async (data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.patch(
      '/users/me',
      data,
      config,
    );
    return formatResponse<User>(response);
  },

  // getRoles: async (uuid: UUID, config?: AxiosRequestConfig) => {
  //   const response = await RumsanService.client.post(
  //     `/users/${uuid}/roles`,
  //     config,
  //   );
  //   return formatResponse<>(response);
  // },

  addRoles: async (uuid: UUID, data: User, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post(
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
  //   const response = await RumsanService.client.delete(
  //     `/users/${uuid}/roles`,
  //     data,
  //     config,
  //   );
  //   return formatResponse<>(response);
  // },
};
