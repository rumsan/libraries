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

  useLogin() {
    const setError = useErrorStore((state) => state.setError);
    const setToken = useAuthStore((state) => state.setToken);

    return useMutation(
      {
        mutationFn: this.client.auth.login,
        onSuccess: (data) => {
          setToken(data?.data.accessToken);
          return data.data;
        },
        onError: (err) => {
          setError(err as any);
        },
      },
      this.reactQueryClient,
    );
  }

  useSendOtp() {
    const setError = useErrorStore((state) => state.setError);
    const setChallenge = useAuthStore((state) => state.setChallenge);

    return useMutation(
      {
        mutationFn: this.client.auth.getOtp,
        onSuccess: ({ data }) => {
          setChallenge(data?.challenge);
          return data;
        },
        onError: (err) => {
          setError(err as any);
        },
      },
      this.reactQueryClient,
    );
  }
}
