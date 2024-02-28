import axios, {
  AxiosHeaderValue,
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
} from 'axios';
import {
  getAppClient,
  getAuthClient,
  getRoleClient,
  getSettingClient,
  getUserClient,
} from './clients';
import {
  AppClient,
  AuthClient,
  RoleClient,
  SettingClient,
  UserClient,
} from './types/client.types';

export class RumsanService {
  private _client: AxiosInstance;
  public auth: AuthClient;
  public app: AppClient;
  public setting: SettingClient;
  public role: RoleClient;
  public user: UserClient;

  constructor(config?: AxiosRequestConfig) {
    this.setClient(config);
    this.auth = getAuthClient(this._client);
    this.app = getAppClient(this._client);
    this.setting = getSettingClient(this._client);
    this.role = getRoleClient(this._client);
    this.user = getUserClient(this._client);
  }

  public set accessToken(token: string | null) {
    if (this._client) {
      if (token) {
        this._client.defaults.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  public set headers(
    headers: HeadersDefaults & { [key: string]: AxiosHeaderValue },
  ) {
    if (this._client) {
      this._client.defaults.headers = headers;
    }
  }

  public getClient() {
    if (!this._client) {
      throw new Error(
        'RumsanClient not setup. Please call RumsanClient.setup() before using it.',
      );
    }
    return this._client;
  }

  public get client() {
    return this.getClient();
  }

  public setClient(config?: AxiosRequestConfig) {
    if (!this._client) {
      this._client = axios.create(config);
    }
    return this._client;
  }
}
