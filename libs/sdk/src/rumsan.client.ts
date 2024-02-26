import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Apps, Auths, Settings, Users } from './services';

class RumsanClientClass {
  private axiosInstance: AxiosInstance | null = null;

  public setup(config?: AxiosRequestConfig) {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create(config);
    }
  }

  public set accessToken(token: string | null) {
    if (this.axiosInstance) {
      if (token) {
        this.axiosInstance.defaults.headers[
          'Authorization'
        ] = `Bearer ${token}`;
      }
    }
  }

  public get getAxiosInstance() {
    if (!this.axiosInstance) {
      throw new Error(
        'RumsanClient not setup. Please call RumsanClient.setup() before using it.',
      );
    }
    return this.axiosInstance;
  }

  public User = Users;
  public Auth = Auths;
  public Setting = Settings;
  public App = Apps;
}

export const RumsanClient = new RumsanClientClass();
