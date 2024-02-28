import axios, {
  AxiosHeaderValue,
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
} from 'axios';
import { Apps, Auth, Settings, Users } from './services';

class RumsanServiceClass {
  private _client: AxiosInstance | null = null;

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

  public User = Users;
  public Auth = Auth;
  public Setting = Settings;
  public App = Apps;
}

export const RumsanService = new RumsanServiceClass();
