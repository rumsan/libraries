import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Auths, Users } from './services';
export default class RumsanClient {
  private static axiosInstance: AxiosInstance | null = null;

  public static setup(config?: AxiosRequestConfig) {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create(config);
    }
  }

  public static get getAxiosInstance() {
    if (!this.axiosInstance) {
      throw new Error(
        'RumsanClient not setup. Please call RumsanClient.setup() before using it.',
      );
    }
    return this.axiosInstance;
  }
  public static User = Users;
  public static Auth = Auths;
}
