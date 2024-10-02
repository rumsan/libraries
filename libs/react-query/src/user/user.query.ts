import { Pagination, User } from '@rumsan/sdk/types';
import { useMutation, useQuery } from '@tanstack/react-query';
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
      queryKey: [TAGS.GET_ME, enabled],
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

export const useUserGet = (cuid: string) => {
  const { queryClient, rumsanService } = useRSQuery();

  return useQuery(
    {
      queryKey: [TAGS.GET_USER],
      queryFn: () => rumsanService.user.getUser(cuid),
    },
    queryClient,
  );
};

export const useUserEdit = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: ({ cuid, data }: { cuid: string; data: User }) =>
        rumsanService.user.updateUser(cuid, data),
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
      mutationFn: (cuid: string) => rumsanService.user.removeUser(cuid),
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

export const useUserRoleList = (cuid: string) => {
  const { queryClient, rumsanService } = useRSQuery();

  return useQuery(
    {
      queryKey: [TAGS.GET_USER_ROLES, cuid],
      queryFn: () => rumsanService.user.listRoles(cuid),
    },
    queryClient,
  );
};

export const useUserRolesRemove = () => {
  const onError = useErrorStore((state) => state.setError);
  const { queryClient, rumsanService } = useRSQuery();

  return useMutation(
    {
      mutationFn: ({ roles, cuid }: { cuid: string; roles: string[] }) =>
        rumsanService.user.removeRoles(cuid, roles),
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
      mutationFn: ({ roles, cuid }: { cuid: string; roles: string[] }) =>
        rumsanService.user.addRoles(cuid, roles),
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
