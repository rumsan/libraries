import { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  CreateRole,
  EditRole,
  ListRole,
  Permission,
  Role,
  RoleWithPermission,
  SearchPermission,
} from '../types';
import { RoleClient } from '../types/client.types';
import { formatResponse } from '../utils/formatResponse.utils';

export const getRoleClient = (client: AxiosInstance): RoleClient => {
  return {
    createRole: async (role: CreateRole) => {
      const response = await client.post('/roles', role);
      return formatResponse<Role>(response);
    },
    listRole: async (data?: ListRole, config?: AxiosRequestConfig) => {
      const response = await client.get('/roles', {
        params: data,
        ...config,
      });
      return formatResponse<Role>(response);
    },
    searchRoleByPermission: async (
      data: SearchPermission,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(
        '/roles/search-by-permission',
        data,
        config,
      );
      return formatResponse<Role[]>(response);
    },
    updateRole: async (
      name: string,
      data: EditRole,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(`/roles/${name}`, data, config);
      return formatResponse<RoleWithPermission>(response);
    },
    deleteRole: async (name: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/roles/${name}`, config);
      return formatResponse<Role>(response);
    },
    getRole: async (name: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/roles/${name}`, config);
      return formatResponse<RoleWithPermission>(response);
    },
    listPermissionsByRole: async (
      name: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(`/roles/${name}/permissions`, config);
      return formatResponse<Permission[]>(response);
    },
  };
};
