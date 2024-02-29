import {
  QueryClient,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { RumsanService } from '@rumsan/sdk';
import { UUID } from 'crypto';
import { TAGS } from '../utils/tags';

export class RoleQuery {
  private reactQueryClient: QueryClient;
  private client: RumsanService;

  constructor(client: RumsanService, reactQueryClient: QueryClient) {
    this.reactQueryClient = reactQueryClient;
    this.client = client;
  }

  userRoleCreate() {
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: this.client.role.createRole,
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
        },
      },
      this.reactQueryClient,
    );
  }

  userRoleList(payload: any): UseQueryResult<any, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_ALL_ROLES],
        queryFn: () => this.client.role.listRole,
      },
      this.reactQueryClient,
    );
  }

  userRoleEdit() {
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: (payload: { uuid: UUID; data: any }) =>
          this.client.role.updateRole(payload.uuid, payload.data),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
        },
      },
      this.reactQueryClient,
    );
  }

  userRoleDelete() {
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: (uuid: UUID) => this.client.role.deleteRole(uuid),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
        },
      },
      this.reactQueryClient,
    );
  }
}
