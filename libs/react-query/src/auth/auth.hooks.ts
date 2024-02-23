import { OtpDto } from '@rumsan/sdk/dtos';
import { useMutation } from '@tanstack/react-query';
import { useErrorStore } from '../utils';
import { useAuthStore } from './auth.store';

export const useLogin = () => {
  const setError = useErrorStore((state) => state.setError);
  // const setError = useAuthStore((state) => state.setError);
  const setToken = useAuthStore((state) => state.setToken);

  // const userLogin = async (
  //   payload: LoginPayload,
  // ): Promise<ApiResponse<LoginResponse>> => {
  //   const res = await api.post('/auth/login', payload);
  //   return res.data;
  // };

  return useMutation({
    mutationFn: userLogin,
    onSuccess: (data) => {
      setToken(data?.data.accessToken);
      return data.data;
    },
    onError: (err) => {
      setError(err as any);
    },
  });
};

const createOtp = async (payload: OtpDto) => {
  const res = await api.post('/auth/otp', payload);
  return res.data;
};

export const useSendOtp = () => {
  const setError = useErrorStore((state) => state.setError);
  const setChallenge = useAuthStore((state) => state.setChallenge);

  return useMutation<any, unknown, ApiResponse<OtpDto>>({
    mutationFn: (payload) => createOtp(payload),
    onSuccess: (data) => {
      setChallenge(data?.data?.challenge);
      return data.data;
    },
    onError: (err) => {
      setError(err as any);
    },
  });
};
