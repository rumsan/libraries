import { AxiosRequestConfig } from 'axios';
import { FormattedResponse } from '../utils/formatResponse.utils';
import { AuthResponse } from './auth.types';
import { CreateChallenge } from './challenge.types';
import { LoginResponse } from './loginResponse.types';
import { OTP } from './otp.types';
import { Pagination } from './pagination.types';
import { Permission } from './permission.types';
import {
  CreateRole,
  EditRole,
  ListRole,
  Role,
  RoleWithPermission,
  SearchPermission,
} from './role.types';
import { Setting, SettingList } from './setting.types';
import { User, UserRole } from './user.types';
import { WalletLogin } from './walletLogin.types';

export type AppClient = {
  listConstants: (
    name: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};

export type AuthClient = {
  login: (
    data: OTP,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<LoginResponse>>;
  getOtp: (
    data: OTP,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<AuthResponse>>;
  walletLogin: (
    data: WalletLogin,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
  getChallenge: (
    data: CreateChallenge,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<AuthResponse>>;
};

export type RoleClient = {
  createRole: (role: CreateRole) => Promise<FormattedResponse<Role>>;
  listRole: (
    data?: ListRole,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Role>>;
  searchRoleByPermission: (
    data: SearchPermission,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Role[]>>;
  updateRole: (
    name: string,
    data: EditRole,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<RoleWithPermission>>;
  deleteRole: (
    name: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Role>>;
  getRole: (
    name: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<RoleWithPermission>>;
  listPermissionsByRole: (
    name: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Permission[]>>;
};

export type SettingClient = {
  listSettings: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<SettingList>>;
  create: (
    data: Setting,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Setting>>;
  getByName: (
    name: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Setting>>;
  update: (
    data: Setting,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Setting>>;
};

export type UserClient = {
  createUser: (
    data: User,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<User>>;
  getUser: (
    cuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<User>>;
  updateUser: (
    cuid: string,
    data: User,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<User>>;
  removeUser: (
    cuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<User>>;
  listUsers: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<User[]>>;
  getMe: (config?: AxiosRequestConfig) => Promise<FormattedResponse<User>>;
  updateMe: (
    data: User,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<User>>;
  listRoles: (
    cuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<UserRole[]>>;
  addRoles: (
    cuid: string,
    roles: string[],
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<UserRole[]>>;
  removeRoles: (
    cuid: string,
    roles: string[],
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<UserRole[]>>;
};
