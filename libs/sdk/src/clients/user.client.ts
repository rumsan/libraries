import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import { AssignRole, ListUser, UpdateRoleAssignment, User, UserRole } from '../types';
import { UserClient } from '../types/client.types';
import { formatResponse } from '../utils/formatResponse.utils';

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
    listUsers: async (data?: ListUser, config?: AxiosRequestConfig) => {
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

    listRoles: async (uuid: UUID, config?: AxiosRequestConfig) => {
      const response = await client.get(`/users/${uuid}/roles`, config);
      return formatResponse<UserRole[]>(response);
    },
    addRoles: async (
      uuid: UUID,
      roles: string[],
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(`/users/${uuid}/roles`, roles, config);
      return formatResponse<UserRole[]>(response);
    },
    removeRoles: async (
      uuid: UUID,
      roles: string[],
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.delete(`/users/${uuid}/roles`, {
        ...config,
        data: roles,
      });
      return formatResponse<UserRole[]>(response);
    },

    assignRoleInProject: async (
      uuid: string,
      data: AssignRole,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(
        `/users/${uuid}/roles/assign`,
        data,
        config,
      );
      return formatResponse(response);
    },
    listRolesInProject: async (
      uuid: string,
      xrefId: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/users/${uuid}/xref-id/${xrefId}/roles`,
        config,
      );
      return formatResponse(response);
    },
    removeRoleInProject: async (
      uuid: string,
      xrefId: string,
      name: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.delete(
        `/users/${uuid}/xref-id/${xrefId}/roles/${name}`,
        config,
      );
      return formatResponse(response);
    },
    updateRoleAssignmentInProject: async (
      uuid: string,
      xrefId: string,
      name: string,
      data: UpdateRoleAssignment,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(
        `/users/${uuid}/xref-id/${xrefId}/roles/${name}`,
        data,
        config,
      );
      return formatResponse(response);
    },
    listActiveRoles: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(
        `/users/${uuid}/roles/active`,
        config,
      );
      return formatResponse(response);
    },
    listAllPermissions: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/users/${uuid}/permissions`, config);
      return formatResponse(response);
    },
    listPermissionsInProject: async (
      uuid: string,
      xrefId: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/users/${uuid}/xref-id/${xrefId}/permissions`,
        config,
      );
      return formatResponse(response);
    },
    listUsersInProject: async (
      xrefId: string,
      name?: string,
      includeExpired?: boolean,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(`/users/xref-id/${xrefId}`, {
        params: { name, includeExpired },
        ...config,
      });
      return formatResponse(response);
    },
    listUsersByRoleInProject: async (
      xrefId: string,
      name: string,
      includeExpired?: boolean,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/users/xref-id/${xrefId}/roles/${name}`,
        {
          params: { includeExpired },
          ...config,
        },
      );
      return formatResponse(response);
    },
    getUserAbilitiesInProject: async (
      uuid: string,
      xrefId: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/users/${uuid}/xref-id/${xrefId}/abilities`,
        config,
      );
      return formatResponse(response);
    },
  };
};

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
