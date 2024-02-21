export const Auths = {
  login: async (data: Login, config?: AxiosRequestConfig) => {
    const response = await RumsanClient.getAxiosInstance.post(
      '/auth/login',
      data,
      config,
    );
    return formatResponse<LoginResponseDto>(response);
  },
};
