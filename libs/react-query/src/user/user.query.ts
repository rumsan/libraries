import { Pagination, User } from '@rumsan/sdk/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UUID } from 'crypto';
import { useEffect } from 'react';
import { useRSQuery } from '../providers/rs-query-provider';
import { useErrorStore } from '../utils';
import { TAGS } from '../utils/tags';
import { useUserStore } from './user.store';

export const useUserCreate = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: rumsanService.user.createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserList = (payload: Pagination) => {
  const { queryClient, rumsanService } = useRSQuery();
  const setUsers = useUserStore((state) => state.setUsers);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ALL_USER, payload],
      queryFn: () => rumsanService.user.listUsers(payload),
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

export const useUserCurrentUser = (enabled = true) => {
  const userStore = useUserStore();

  const { queryClient, rumsanService } = useRSQuery();

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ME],
      queryFn: rumsanService.user.getMe,
      enabled,
      initialData: userStore.user,
    },
    queryClient,
  );
  useEffect(() => {
    if (query.data) {
      userStore.setCurrentUser(query.data);
    }
  }, [query.data]);

  return query;
};

export const useUserGet = (uuid: UUID) => {
  const { queryClient, rumsanService } = useRSQuery();

  return useQuery(
    {
      queryKey: [TAGS.GET_USER],
      queryFn: () => rumsanService.user.getUser(uuid),
    },
    queryClient,
  );
};

export const useUserEdit = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: ({ uuid, data }: { uuid: UUID; data: User }) =>
        rumsanService.user.updateUser(uuid, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRemove = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: (uuid: UUID) => rumsanService.user.removeUser(uuid),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_ALL_USER, TAGS.GET_USER],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserRoleList = (uuid: UUID) => {
  const { queryClient, rumsanService } = useRSQuery();

  return useQuery(
    {
      queryKey: [TAGS.GET_USER_ROLES],
      queryFn: () => rumsanService.user.listRoles(uuid),
    },
    queryClient,
  );
};

export const useUserRolesRemove = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: ({ roles, uuid }: { uuid: UUID; roles: string[] }) =>
        rumsanService.user.removeRoles(uuid, roles),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_USER_ROLES],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useUserAddRoles = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: ({ roles, uuid }: { uuid: UUID; roles: string[] }) =>
        rumsanService.user.addRoles(uuid, roles),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_USER_ROLES],
        });
      },
      onError,
    },
    queryClient,
  );
};
