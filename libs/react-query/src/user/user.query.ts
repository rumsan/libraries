import { RumsanService } from '@rumsan/sdk';
import { User } from '@rumsan/sdk/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { UUID } from 'crypto';
import { useEffect } from 'react';
import { useErrorStore } from '../utils';
import { TAGS } from '../utils/tags';
import { useUserStore } from './user.store';

export class UserQuery {
  private reactQueryClient: QueryClient;
  private client: RumsanService;

  constructor(client: RumsanService, reactQueryClient: QueryClient) {
    this.reactQueryClient = reactQueryClient;
    this.client = client;
  }

  useUserCreate() {
    const setError = useErrorStore((state) => state.setError);
    return useMutation(
      {
        mutationFn: (data: User) => this.client.user.createUser(data),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_USER],
          });
        },
        onError: (err) => {
          setError(err as any);
        },
      },
      this.reactQueryClient,
    );
  }

  useUserList(): UseQueryResult<any, Error> {
    const userListQueryResult: any = useQuery(
      {
        queryKey: [TAGS.GET_ALL_USER],
        queryFn: () => this.client.user.listUsers(),
      },
      this.reactQueryClient,
    );
    const userStore = useUserStore();

    useEffect(() => {
      if (userListQueryResult.data) {
      }
    }, [userListQueryResult.data]);

    return userListQueryResult;
  }

  useUserCurrentUser(enabled: boolean): UseQueryResult<any, Error> {
    const userStore = useUserStore();

    const userQuery = useQuery(
      {
        queryKey: [TAGS.GET_ME],
        queryFn: this.client.user.getMe,
        enabled,
        initialData: userStore.user,
      },
      this.reactQueryClient,
    );

    useEffect(() => {
      if (userQuery.data) {
        userStore.setUser(userQuery.data.data);
      }
    }, [userQuery.data]);

    return userQuery?.data?.data;
  }

  useUserGet(payload: { uuid: UUID }): UseQueryResult<any, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_USER],
        queryFn: () => this.client.user.getUser(payload.uuid),
      },
      this.reactQueryClient,
    );
  }

  useUserEdit() {
    return useMutation(
      {
        mutationFn: (payload: any) =>
          this.client.user.updateUser(payload.uuid, payload.data),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_USER],
          });
        },
      },
      this.reactQueryClient,
    );
  }

  useUserRemove(payload: { uuid: UUID }) {
    return useMutation(
      {
        mutationFn: () => this.client.user.removeUser(payload.uuid),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_USER],
          });
        },
      },
      this.reactQueryClient,
    );
  }

  useUserRoleList(uuid: UUID): UseQueryResult<any, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_USER_ROLES, uuid],
        queryFn: async () => {
          const { response } = await this.client.user.listRoles(uuid);
          return response;
        },
      },
      this.reactQueryClient,
    );
  }
}
