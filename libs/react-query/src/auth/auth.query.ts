import { RumsanService } from '@rumsan/sdk';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { useErrorStore } from '../utils';
import { useAuthStore } from './auth.store';

export class AuthQuery {
  private reactQueryClient: QueryClient;
  private client: RumsanService;

  constructor(client: RumsanService, reactQueryClient: QueryClient) {
    this.reactQueryClient = reactQueryClient;
    this.client = client;
  }

  useRequestOtp() {
    const onError = useErrorStore((state) => state.setError);
    const setChallenge = useAuthStore((state) => state.setChallenge);

    return useMutation(
      {
        mutationFn: this.client.auth.getOtp,
        onSuccess: (data) => {
          setChallenge(data?.data.challenge);
          return data.data;
        },
        onError,
      },
      this.reactQueryClient,
    );
  }

  useVerifyOtp() {
    const onError = useErrorStore((state) => state.setError);
    const setToken = useAuthStore((state) => state.setToken);

    return useMutation(
      {
        mutationFn: this.client.auth.login,
        onSuccess: (data) => {
          setToken(data?.data.accessToken);
          return data.data;
        },
        onError,
      },
      this.reactQueryClient,
    );
  }
}
