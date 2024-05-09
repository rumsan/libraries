import { CreateRole, EditRole, Pagination } from '@rumsan/sdk/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRoleStore } from '.';
import { useRSQuery } from '../providers/rs-query-provider';
import { useErrorStore } from '../utils';
import { TAGS } from '../utils/tags';

export const useUserRoleCreate = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: (role: CreateRole) => rumsanService.role.createRole(role),
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
      mutationFn: (payload: { name: string; data: EditRole }) =>
        rumsanService.role.updateRole(payload.name, payload.data),
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
      mutationFn: (name: string) => rumsanService.role.deleteRole(name),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
      },
      onError,
    },
    queryClient,
  );
};

export const useRoleList = (payload: Pagination) => {
  const { queryClient, rumsanService } = useRSQuery();
  const setRoles = useRoleStore((state) => state.setRoleList);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ALL_ROLES, payload],
      queryFn: () => rumsanService.role.listRole(payload),
    },
    queryClient,
  );

  useEffect(() => {
    if (query.data) {
      setRoles(query.data);
    }
  }, [query.data]);

  return query;
};
