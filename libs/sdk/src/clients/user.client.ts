import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Pagination, User, UserRole } from '../types';
import { UserClient } from '../types/client.types';
import { formatResponse } from '../utils/formatResponse.utils';

export const getUserClient = (client: AxiosInstance): UserClient => {
  return {
    createUser: async (data: User, config?: AxiosRequestConfig) => {
      const response = await client.post('/users', data, config);
      return formatResponse<User>(response);
    },
    getUser: async (cuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/users/${cuid}`, config);
      return formatResponse<User>(response);
    },
    updateUser: async (
      cuid: string,
      data: User,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(`/users/${cuid}`, data, config);
      return formatResponse<User>(response);
    },
    removeUser: async (cuid: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/users/${cuid}`, config);
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

    listRoles: async (cuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/users/${cuid}/roles`, config);
      return formatResponse<UserRole[]>(response);
    },
    addRoles: async (
      cuid: string,
      roles: string[],
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(`/users/${cuid}/roles`, roles, config);
      return formatResponse<UserRole[]>(response);
    },
    removeRoles: async (
      cuid: string,
      roles: string[],
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.delete(`/users/${cuid}/roles`, {
        ...config,
        data: roles,
      });
      return formatResponse<UserRole[]>(response);
    },
  };
};

// removeRoles: async (
//   cuid: string,
//   data: UpdateUserDto,
//   config?: AxiosRequestConfig,
// ) => {
//   const response = await RumsanService.client.delete(
//     `/users/${cuid}/roles`,
//     data,
//     config,
//   );
//   return formatResponse<>(response);
// },
