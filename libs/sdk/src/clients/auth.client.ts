import { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  CreateChallenge,
  LoginResponse,
  OTP,
  WalletLogin,
} from '../types';
import { AuthClient } from '../types/client.types';
import { formatResponse } from '../utils/formatResponse.utils';

export const getAuthClient = (client: AxiosInstance): AuthClient => {
  return {
    login: async (data: OTP, config?: AxiosRequestConfig) => {
      const response = await client.post('/auth/login', data, config);
      return formatResponse<LoginResponse>(response);
    },

    getOtp: async (data: OTP, config?: AxiosRequestConfig) => {
      const response = await client.post('/auth/otp', data, config);
      return formatResponse<AuthResponse>(response);
    },

    walletLogin: async (data: WalletLogin, config?: AxiosRequestConfig) => {
      const response = await client.post('/auth/wallet', data, config);
      return formatResponse<any>(response);
    },

    getChallenge: async (
      data: CreateChallenge,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post('/auth/challenge', data, config);
      return formatResponse<AuthResponse>(response);
    },
  };
};
