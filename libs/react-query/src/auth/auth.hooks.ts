import { RumsanClient } from '@rumsan/sdk';
import { useMutation } from '@tanstack/react-query';
import { useErrorStore } from '../utils';
import { useAuthStore } from './auth.store';

export const useLogin = () => {
  const setError = useErrorStore((state) => state.setError);
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: RumsanClient.Auth.login,
    onSuccess: (data) => {
      setToken(data?.data.accessToken);
      return data.data;
    },
    onError: (err) => {
      setError(err as any);
    },
  });
};

export const useSendOtp = () => {
  const setError = useErrorStore((state) => state.setError);
  const setChallenge = useAuthStore((state) => state.setChallenge);

  return useMutation({
    mutationFn: RumsanClient.Auth.getOtp,
    onSuccess: (data) => {
      setChallenge(data?.data?.challenge);
      return data.data;
    },
    onError: (err) => {
      setError(err as any);
    },
  });
};
