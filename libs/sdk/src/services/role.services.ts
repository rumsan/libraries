import { AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import {
  CreateRoleDto,
  EditRoleDto,
  ListRoleDto,
  SearchPermissionDto,
} from '../dtos';
import RumsanClient from '../rumsan.client';
import { Permission, Role, RoleWithPermission } from '../types';
import { formatResponse } from '../utils';

export const Roles = {
  createRole: async (role: CreateRoleDto) => {
    const response = await RumsanClient.getAxiosInstance.post('/roles', role);
    return formatResponse<Role>(response);
  },

  listRole: async (data?: ListRoleDto, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.get('/roles', {
      params: data,
      ...config,
    });
    return formatResponse<Role>(response);
  },

  searchRoleByPermission: async (
    data: SearchPermissionDto,
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
    data: EditRoleDto,
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
