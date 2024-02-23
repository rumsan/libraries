import { AxiosRequestConfig } from 'axios';
import { ChallengeDto, OtpDto, OtpLoginDto, WalletLoginDto } from '../dtos';
import { RumsanClient } from '../rumsan.client';
import { AuthResponse, LoginResponse } from '../types';
import { formatResponse } from '../utils';

export const Auths = {
  login: async (data: OtpLoginDto, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/auth/login',
      data,
      config,
    );
    return formatResponse<LoginResponse>(response);
  },

  getOtp: async (data: OtpDto, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/auth/otp',
      data,
      config,
    );
    return formatResponse<AuthResponse>(response);
  },

  walletLogin: async (data: WalletLoginDto, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/auth/wallet',
      data,
      config,
    );
    return formatResponse<any>(response);
  },

  getChallenge: async (data: ChallengeDto, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/auth/challenge',
      data,
      config,
    );
    return formatResponse<AuthResponse>(response);
  },
};
