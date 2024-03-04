import { RumsanService } from '@rumsan/sdk';
import { Pagination, User } from '@rumsan/sdk/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
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

    return useMutation({
      mutationFn: (payload: User) => this.client.user.createUser(payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
      },
    });
  }

  useUserList(payload: Pagination): UseQueryResult<any, Error> {
    const userListQueryResult: any = useQuery({
      queryKey: [TAGS.GET_ALL_USER],
      queryFn: () => this.client.user.listUsers(payload),
    });
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

    const userQuery = useQuery({
      queryKey: [TAGS.GET_ME],
      queryFn: () => this.client.user.getMe(),
      enabled,
      initialData: userStore.user,
    });

    useEffect(() => {
      if (userQuery.data) {
        userStore.setUser(userQuery.data.data);
      }
    }, [userQuery.data]);

    return userQuery?.data?.data;
  }

  useUserGet(payload: { uuid: string }): UseQueryResult<any, Error> {
    return useQuery({
      queryKey: [TAGS.GET_USER],
      queryFn: () => this.client.user.getUser(payload.uuid),
    });
  }

  useUserEdit() {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: (payload: any) =>
        this.client.user.updateUser(payload.uuid, payload.data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
      },
    });
  }

  useUserRemove(payload: { uuid: string }) {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: () => this.client.user.removeUser(payload.uuid),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_USER] });
      },
    });
  }
}
