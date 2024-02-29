import { RumsanService } from '@rumsan/sdk';
import {
  QueryClient,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
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
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: this.client.user.createUser,
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
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
        userStore.setTotalUser(userListQueryResult.data?.data?.length);
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

  useUserGet(payload: { uuid: string }): UseQueryResult<any, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_USER],
        queryFn: () => this.client.user.getUser(payload.uuid),
      },
      this.reactQueryClient,
    );
  }

  useUserEdit() {
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: (payload: any) =>
          this.client.user.updateUser(payload.uuid, payload.data),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
        },
      },
      this.reactQueryClient,
    );
  }

  useUserRemove(payload: { uuid: string }) {
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: () => this.client.user.removeUser(payload.uuid),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
        },
      },
      this.reactQueryClient,
    );
  }
}
