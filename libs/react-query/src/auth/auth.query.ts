import { useMutation } from '@tanstack/react-query';
import { useRSQuery } from '../providers/rs-query-provider';
import { useErrorStore } from '../utils';
import { useAuthStore } from './auth.store';


export const   useRequestOtp= ()=> {
    const onError = useErrorStore((state) => state.setError);
  const setChallenge = useAuthStore((state) => state.setChallenge);
  const { queryClient, rumsanService } = useRSQuery()

  console.log('rumsanService', rumsanService)

    return useMutation(
      {
        mutationFn: rumsanService.auth.getOtp,
        onSuccess: (data) => {
          setChallenge(data?.data.challenge);
          return data.data;
        },
        onError,
      },
    queryClient
    );
  }

  export const useVerifyOtp=()=> {
    const onError = useErrorStore((state) => state.setError);
    const setToken = useAuthStore((state) => state.setToken);
  const {queryClient,rumsanService} = useRSQuery()


    return useMutation(
      {
        mutationFn: rumsanService.auth.login,
        onSuccess: (data) => {
          setToken(data?.data.accessToken);
          return data.data;
        },
        onError,
      },
     queryClient
    );
}
