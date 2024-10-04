export * from './app.client';
export * from './auth.client';
export * from './role.client';
export * from './setting.client';

import { AxiosHeaderValue, CreateAxiosDefaults } from 'axios';
import { ApiClient } from './api.client';
import { UserClient } from './user.client';

export const getClient = (config: CreateAxiosDefaults) => {
  const apiClient = new ApiClient(config);

  return {
    apiClient: apiClient,
    setAccessToken: (accessToken: string) =>
      (apiClient.accessToken = accessToken),
    setAppId: (appId: string) => (apiClient.appId = appId),
    setHeaders: (headers: { [key: string]: AxiosHeaderValue }) =>
      (apiClient.headers = headers),

    User: new UserClient(apiClient),
  };
};
