import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Pagination, User, UserRole } from '../types';
import { formatResponse } from '../utils';
import { ApiClient } from './api.client';

export class UserClient {
  private _client: AxiosInstance;
  private _prefix = 'users';

  constructor(private apiClient: ApiClient) {
    this._client = apiClient.client;
  }

  async create<T>(data: User<T>, config?: AxiosRequestConfig) {
    const response = await this._client.post(`${this._prefix}`, data, config);
    return formatResponse<User<T>>(response);
  }

  async get<T>(cuid: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}/${cuid}`, config);
    return formatResponse<User<T>>(response);
  }

  async updateUser<T>(
    cuid: string,
    data: Partial<User<T>>,
    config?: AxiosRequestConfig,
  ) {
    const response = await this._client.patch(
      `${this._prefix}/${cuid}`,
      data,
      config,
    );
    return formatResponse<User<T>>(response);
  }

  async removeUser(cuid: string, config?: AxiosRequestConfig) {
    const response = await this._client.delete(
      `${this._prefix}/${cuid}`,
      config,
    );
    return formatResponse<User>(response);
  }

  async listUsers<T>(data?: Pagination, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}`, {
      params: data,
      ...config,
    });
    return formatResponse<User<T>[]>(response);
  }

  async getMe<T>(config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}/me`, config);
    return formatResponse<User<T>>(response);
  }

  async updateMe<T>(data: Partial<User<T>>, config?: AxiosRequestConfig) {
    const response = await this._client.patch(
      `${this._prefix}/me`,
      data,
      config,
    );
    return formatResponse<User<T>>(response);
  }

  async listRoles(cuid: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(
      `${this._prefix}/${cuid}/roles`,
      config,
    );
    return formatResponse<UserRole[]>(response);
  }

  async addRoles(cuid: string, roles: string[], config?: AxiosRequestConfig) {
    const response = await this._client.post(
      `${this._prefix}/${cuid}/roles`,
      roles,
      config,
    );
    return formatResponse<UserRole[]>(response);
  }

  async removeRoles(
    cuid: string,
    roles: string[],
    config?: AxiosRequestConfig,
  ) {
    const response = await this._client.delete(
      `${this._prefix}/${cuid}/roles`,
      {
        ...config,
        data: roles,
      },
    );
    return formatResponse<UserRole[]>(response);
  }
}
