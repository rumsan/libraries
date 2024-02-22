import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Auths, Users } from './services';
class RumsanClientClass {
  private axiosInstance: AxiosInstance | null = null;
  public User = Users;
  public Auth = Auths;

  public setup(config?: AxiosRequestConfig) {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create(config);
    }
  }

  public set accessToken(token: string | null) {
    if (this.axiosInstance) {
      if (token) {
        this.axiosInstance.defaults.headers['Authorization'] =
          `Bearer ${token}`;
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
}

export const RumsanClient = new RumsanClientClass();
