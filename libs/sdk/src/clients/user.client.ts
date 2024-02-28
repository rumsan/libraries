import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Pagination, User } from '../types';
import { UserClient } from '../types/client.types';
import { formatResponse } from '../utils';

export const getUserClient = (client: AxiosInstance): UserClient => {
  return {
    createUser: async (data: User, config?: AxiosRequestConfig) => {
      const response = await client.post('/users', data, config);
      return formatResponse<User>(response);
    },
    getUser: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/users/${uuid}`, config);
      return formatResponse<User>(response);
    },
    updateUser: async (
      uuid: string,
      data: User,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(`/users/${uuid}`, data, config);
      return formatResponse<User>(response);
    },
    removeUser: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/users/${uuid}`, config);
      return formatResponse<User>(response);
    },
    listUsers: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/users', {
        params: data,
        ...config,
      });
      return formatResponse<User[]>(response);
    },
    getMe: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/users/me', config);
      return formatResponse<User>(response);
    },
    updateMe: async (data: User, config?: AxiosRequestConfig) => {
      const response = await client.patch('/users/me', data, config);
      return formatResponse<User>(response);
    },
    addRolesToUser: async (
      uuid: string,
      data: User,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(`/users/${uuid}/roles`, data, config);
      return formatResponse<User>(response);
    },
  };
};

// getRoles: async (uuid: UUID, config?: AxiosRequestConfig) => {
//   const response = await RumsanService.client.post(
//     `/users/${uuid}/roles`,
//     config,
//   );
//   return formatResponse<>(response);
// },

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
