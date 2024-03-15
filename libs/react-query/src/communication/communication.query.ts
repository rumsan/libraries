import {
  Audio,
  CommunicationService,
  CreateAudience,
  CreateCampaign,
  EditCampaign,
  ICampaignItemApiResponse,
  Transport,
} from '@rumsan/communication';
import { Pagination } from '@rumsan/sdk/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { TAGS } from '../utils/tags';

export class CommunicationQuery {
  private reactQueryClient: QueryClient;
  private client: CommunicationService;

  constructor(client: CommunicationService, reactQueryClient: QueryClient) {
    this.reactQueryClient = reactQueryClient;
    this.client = client;
  }
  useCreateCampaign() {
    return useMutation(
      {
        mutationFn: (payload: CreateCampaign) =>
          this.client.communication.createCampaign(payload),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_CAMPAIGNS],
          });
        },
      },
      this.reactQueryClient,
    );
  }

  useListCampaign(
    data: Pagination,
  ): UseQueryResult<{ data: { rows: ICampaignItemApiResponse[] } }, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_ALL_CAMPAIGNS],
        queryFn: () => this.client.communication.listCampaign(data),
      },
      this.reactQueryClient,
    );
  }
  useUpdateCampaign() {
    return useMutation(
      {
        mutationFn: (payload: EditCampaign & { id: string }) =>
          this.client.communication.updateCampaign(payload.id, payload),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_CAMPAIGNS],
          });
        },
      },
      this.reactQueryClient,
    );
  }

  useDeleteCampaign() {
    return useMutation(
      {
        mutationFn: (id: string) =>
          this.client.communication.deleteCampaign(id),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_CAMPAIGNS],
          });
        },
      },
      this.reactQueryClient,
    );
  }

  useGetCampaign(payload: {
    id: number;
  }): UseQueryResult<{ data: ICampaignItemApiResponse }, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_CAMPAIGNS],
        queryFn: () => this.client.communication.getCampaign(payload.id),
      },
      this.reactQueryClient,
    );
  }
  useGetAudio(): UseQueryResult<{ data: Audio[] }, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_CAMPAIGNS_AUDIO],
        queryFn: () => this.client.communication.getAudio(),
      },
      this.reactQueryClient,
    );
  }
  useTriggerCampaign() {
    return useMutation(
      {
        mutationFn: (id: number) =>
          this.client.communication.triggerCampaign(id),
      },
      this.reactQueryClient,
    );
  }
  useListAudience(): UseQueryResult<any, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_ALL_AUDIENCE],
        queryFn: () => this.client.communication.listAudience(),
      },
      this.reactQueryClient,
    );
  }
  useListTransport(): UseQueryResult<{ data: Transport[] }, Error> {
    return useQuery(
      {
        queryKey: [TAGS.GET_ALL_TRANSPORT],
        queryFn: () => this.client.communication.listTransport(),
      },
      this.reactQueryClient,
    );
  }

  useCreateAudience() {
    return useMutation(
      {
        mutationFn: (payload: CreateAudience) =>
          this.client.communication.createAudience(payload),
        onSuccess: () => {
          this.reactQueryClient.invalidateQueries({
            queryKey: [TAGS.GET_ALL_AUDIENCE],
          });
        },
      },
      this.reactQueryClient,
    );
  }
}
