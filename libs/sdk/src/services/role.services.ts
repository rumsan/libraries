import { AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import { RumsanClient } from '../rumsan.client';
import {
  CreateRole,
  EditRole,
  ListRole,
  Permission,
  Role,
  RoleWithPermission,
  SearchPermission,
} from '../types';
import { formatResponse } from '../utils';

export const Roles = {
  createRole: async (role: CreateRole) => {
    const response = await RumsanClient.getAxiosInstance.post('/roles', role);
    return formatResponse<Role>(response);
  },

  listRole: async (data?: ListRole, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get('/roles', {
      params: data,
      ...config,
    });
    return formatResponse<Role>(response);
  },

  searchRoleByPermission: async (
    data: SearchPermission,
    config?: AxiosRequestConfig,
  ) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/roles/search-by-permission',
      data,
      config,
    );
    return formatResponse<Role[]>(response);
  },

  updateRole: async (
    uuid: UUID,
    data: EditRole,
    config?: AxiosRequestConfig,
  ) => {
    const response = await RumsanClient.getAxiosInstance.patch(
      '/roles/${uuid}',
      data,
      config,
    );
    return formatResponse<RoleWithPermission>(response);
  },

  deleteRole: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.delete(
      '/roles/${uuid}',
      config,
    );
    return formatResponse<Role>(response);
  },

  getRole: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get(
      '/roles/${uuid}',
      config,
    );
    return formatResponse<RoleWithPermission>(response);
  },

  listPermissionsByRole: async (uuid: UUID, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get(
      '/roles/${uuid}/permissions',
      config,
    );
    return formatResponse<Permission[]>(response);
  },
};
