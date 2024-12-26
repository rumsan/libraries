import { OTP, RumsanClient } from '@rumsan/sdk';
import { Service } from '@rumsan/sdk/enums';
import { useMutation } from '@tanstack/react-query';
import { useRumsan } from '../providers/query.provider';
import { useRumsanAppStore } from '../stores/app.store';
import { useErrorStore } from '../utils';

export const useRequestOtp = () => {
  const onError = useErrorStore((state) => state.setError);
  const { setChallenge, clientId: storeClientId } = useRumsanAppStore();
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (address: string, clientId?: string, service?: Service) => {
        const data: OTP = {
          address,
          clientId: clientId || storeClientId,
          service: service || Service.EMAIL,
        };
        return RsClient.Auth.getOtp(data);
      },
      onSuccess: (data) => {
        setChallenge(data?.data.challenge);
        return data.data;
      },
      onError,
    },
    queryClient,
  );
};

export const useVerifyOtp = () => {
  const onError = useErrorStore((state) => state.setError);
  const {
    setAccessToken,
    setCurrentUser,
    setChallenge,
    challenge: storedChallenge,
  } = useRumsanAppStore();
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (otp: string, challenge?: string) => {
        const data = {
          challenge: challenge || storedChallenge || '',
          otp,
        };
        if (!data.challenge) throw new Error('Challenge is not set');
        return RsClient.Auth.login(data);
      },
      onSuccess: (data) => {
        setChallenge(null);
        setAccessToken(data?.data.accessToken);
        RsClient.setAccessToken(data?.data.accessToken);
        if (data?.data.user) {
          setCurrentUser(data?.data.user);
        }

        return data.data;
      },
      onError,
    },
    queryClient,
  );
};
