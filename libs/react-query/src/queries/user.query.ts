import { RumsanClient } from '@rumsan/sdk';
import { CreateUserDto } from '@rumsan/sdk/dtos';
import { Pagination, User } from '@rumsan/sdk/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRumsan } from '../providers/query.provider';
import { useUserStore } from '../stores/user.store';
import { useErrorStore } from '../utils';
import { TAGS } from '../utils/tags';

export const useUserCreate = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (user: CreateUserDto) => RsClient.User.create(user),
      onSuccess: () => {
        queryClient?.invalidateQueries({ queryKey: [TAGS.USER_LIST] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserList = (payload: Pagination) => {
  const { queryClient, RsClient } = useRumsan<RumsanClient>();
  const { setUsers } = useUserStore();

  const query = useQuery(
    {
      queryKey: [TAGS.USER_LIST, payload],
      queryFn: () => RsClient.User.listUsers(payload),
    },
    queryClient,
  );

  useEffect(() => {
    if (query.data) {
      setUsers(query.data);
    }
  }, [query.data]);

  return query;
};

export const useUserGet = (cuid: string) => {
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useQuery(
    {
      queryKey: [TAGS.USER_SELECTED],
      queryFn: () => RsClient.User.get(cuid),
    },
    queryClient,
  );
};

export const useUserEdit = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: ({ cuid, data }: { cuid: string; data: User }) =>
        RsClient.User.updateUser(cuid, data),
      onSuccess: () => {
        queryClient?.invalidateQueries({
          queryKey: [TAGS.USER_LIST, TAGS.USER_SELECTED],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRemove = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: (cuid: string) => RsClient.User.removeUser(cuid),
      onSuccess: () => {
        queryClient?.invalidateQueries({
          queryKey: [TAGS.USER_LIST, TAGS.USER_SELECTED],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRoleList = (cuid: string) => {
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useQuery(
    {
      queryKey: [],
      queryFn: () => RsClient.User.listRoles(cuid),
    },
    queryClient,
  );
};

export const useUserRolesRemove = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: ({ roles, cuid }: { cuid: string; roles: string[] }) =>
        RsClient.User.removeRoles(cuid, roles),
      onError,
    },
    queryClient,
  );
};

export const useUserAddRoles = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, RsClient } = useRumsan<RumsanClient>();

  return useMutation(
    {
      mutationFn: ({ roles, cuid }: { cuid: string; roles: string[] }) =>
        RsClient.User.addRoles(cuid, roles),
      onError,
    },
    queryClient,
  );
};
