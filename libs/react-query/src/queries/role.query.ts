import { RumsanClient } from '@rumsan/sdk';
import { CreateRole, EditRole, Pagination } from '@rumsan/sdk/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRumsan } from '../providers/query.provider';
import { useRoleStore } from '../stores/role.store';
import { useErrorStore } from '../utils';
import { TAGS } from '../utils/tags';

export const useUserRoleCreate = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (role: CreateRole) => RsClient.Role.createRole(role),
      onSuccess: () => {
        queryClient?.invalidateQueries({ queryKey: [TAGS.ROLE_LIST] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRoleEdit = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (payload: { name: string; data: EditRole }) =>
        RsClient.Role.updateRole(payload.name, payload.data),
      onSuccess: () => {
        queryClient?.invalidateQueries({ queryKey: [TAGS.ROLE_LIST] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRoleDelete = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (name: string) => RsClient.Role.deleteRole(name),
      onSuccess: () => {
        queryClient?.invalidateQueries({ queryKey: [TAGS.ROLE_LIST] });
      },
      onError,
    },
    queryClient,
  );
};

export const useRoleList = (payload: Pagination) => {
  const { queryClient, RsClient } = useRumsan<RumsanClient>();
  const { setRoles } = useRoleStore();

  const query = useQuery(
    {
      queryKey: [TAGS.ROLE_LIST, payload],
      queryFn: () => RsClient.Role.listRole(payload),
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
