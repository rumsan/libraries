import { AxiosRequestConfig } from 'axios';
import { RumsanService } from '../rumsan.service';
import {
  AuthResponse,
  CreateChallenge,
  LoginResponse,
  OTP,
  WalletLogin,
} from '../types';
import { formatResponse } from '../utils';

export const Auth = {
  login: async (data: OTP, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post(
      '/auth/login',
      data,
      config,
    );
    return formatResponse<LoginResponse>(response);
  },

  getOtp: async (data: OTP, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post('/auth/otp', data, config);
    return formatResponse<AuthResponse>(response);
  },

  walletLogin: async (data: WalletLogin, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post(
      '/auth/wallet',
      data,
      config,
    );
    return formatResponse<any>(response);
  },

  getChallenge: async (data: CreateChallenge, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.post(
      '/auth/challenge',
      data,
      config,
    );
    return formatResponse<AuthResponse>(response);
  },
};
