import {
  QueryClient,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { RumsanService } from '@rumsan/sdk';
import { Role } from '@rumsan/sdk/types';
import { FormattedResponse } from '@rumsan/sdk/utils/formatResponse.utils';
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

  userRoleList(payload: any): UseQueryResult<FormattedResponse<Role[]>, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_ALL_ROLES],
        queryFn: () =>
          this.client.role.listRole(payload).then(({ response }) => response),
      },
      this.reactQueryClient,
    );
  }

  userRoleEdit() {
    const qc = useQueryClient();

    return useMutation(
      {
        mutationFn: (payload: { cuid: string; data: any }) =>
          this.client.role.updateRole(payload.cuid, payload.data),
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
        mutationFn: (cuid: string) => this.client.role.deleteRole(cuid),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [TAGS.GET_ALL_ROLES] });
        },
      },
      this.reactQueryClient,
    );
  }
}
