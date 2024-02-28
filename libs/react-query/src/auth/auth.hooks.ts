import { RumsanService } from '@rumsan/sdk';
import { useMutation } from '@tanstack/react-query';
import { RumsanReactQueryClient } from '../client';
import { useErrorStore } from '../utils';
import { useAuthStore } from './auth.store';

export const useLogin = () => {
  const setError = useErrorStore((state) => state.setError);
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation(
    {
      mutationFn: RumsanService.Auth.login,
      onSuccess: (data) => {
        setToken(data?.data.accessToken);
        return data.data;
      },
      onError: (err) => {
        setError(err as any);
      },
    },
    RumsanReactQueryClient,
  );
};

export const useSendOtp = () => {
  const setError = useErrorStore((state) => state.setError);
  const setChallenge = useAuthStore((state) => state.setChallenge);

  return useMutation(
    {
      mutationFn: RumsanService.Auth.getOtp,
      onSuccess: ({ data }) => {
        setChallenge(data?.challenge);
        return data;
      },
      onError: (err) => {
        setError(err as any);
      },
    },
    RumsanReactQueryClient,
  );
};
