import { useMutation } from '@tanstack/react-query';
import { UUID } from 'crypto';
import { useRSQuery } from '../providers/rs-query-provider';
import { useErrorStore } from '../utils';
import { TAGS } from '../utils/tags';

export const useUserRoleCreate = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: rumsanService.role.createRole,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRoleEdit = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: (payload: { uuid: UUID; data: any }) =>
        rumsanService.role.updateRole(payload.uuid, payload.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRoleDelete = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: (uuid: UUID) => rumsanService.role.deleteRole(uuid),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
      },
      onError,
    },
    queryClient,
  );
};
