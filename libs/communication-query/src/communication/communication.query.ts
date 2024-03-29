import { CreateAudience, CreateCampaign } from '@rumsan/communication/types';
import { TAGS } from '@rumsan/react-query/utils/tags';
import { Pagination } from '@rumsan/sdk/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCommunicationQuery } from '../providers';
import { useErrorStore } from '../utils';
import { useCampaignStore } from './communication.store';

export const useCreateCampaign = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const onError = useErrorStore((state) => state.setError);

  return useMutation(
    {
      mutationFn: (payload: CreateCampaign) =>
        communicationService.communication.createCampaign(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_ALL_CAMPAIGNS],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useListCampaign = (data: Pagination) => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const setCampaignList = useCampaignStore((state) => state.setCampaignList);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ALL_CAMPAIGNS, data],
      queryFn: () => communicationService.communication.listCampaign(data),
    },
    queryClient,
  );

  useEffect(() => {
    if (query.data) {
      setCampaignList(query?.data);
    }
  }, [query.data]);

  return query;
};

export const useUpdateCampaign = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const onError = useErrorStore((state) => state.setError);

  return useMutation(
    {
      mutationFn: (payload: any) =>
        communicationService.communication.updateCampaign(payload.id, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_ALL_CAMPAIGNS],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useDeleteCampaign = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const onError = useErrorStore((state) => state.setError);

  return useMutation(
    {
      mutationFn: (id: any) =>
        communicationService.communication.deleteCampaign(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_ALL_CAMPAIGNS],
        });
      },
      onError,
    },
    queryClient,
  );
};

export const useGetCampaign = (payload: { id: number }) => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const setCampaign = useCampaignStore((state) => state.setCampaign);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_CAMPAIGNS],
      queryFn: () => communicationService.communication.getCampaign(payload.id),
    },
    queryClient,
  );
  useEffect(() => {
    if (query.data) {
      setCampaign(query.data);
    }
  }, [query.data]);

  return query;
};

export const useGetAudio = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const setAudio = useCampaignStore((state) => state.setAudio);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_CAMPAIGNS_AUDIO],
      queryFn: () => communicationService.communication.getAudio(),
    },
    queryClient,
  );

  useEffect(() => {
    if (query.data) {
      setAudio(query.data);
    }
  }, [query.data]);

  return query;
};

export const useTriggerCampaign = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const onError = useErrorStore((state) => state.setError);

  return useMutation(
    {
      mutationFn: (id: number) =>
        communicationService.communication.triggerCampaign(id),
      onError,
    },
    queryClient,
  );
};

export const useListAudience = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const setAudience = useCampaignStore((state) => state.setAudience);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ALL_AUDIENCE],
      queryFn: () => communicationService.communication.listAudience(),
    },
    queryClient,
  );

  useEffect(() => {
    if (query.data) {
      setAudience(query.data);
    }
  }, [query.data]);

  return query;
};

export const useListTransport = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const setTransport = useCampaignStore((state) => state.setTransport);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ALL_TRANSPORT],
      queryFn: () => communicationService.communication.listTransport(),
    },
    queryClient,
  );
  useEffect(() => {
    if (query.data) {
      setTransport(query.data);
    }
  }, [query.data]);

  return query;
};

export const useCreateAudience = () => {
  const { queryClient, communicationService } = useCommunicationQuery();
  const onError = useErrorStore((state) => state.setError);

  return useMutation(
    {
      mutationFn: (payload: CreateAudience) =>
        communicationService.communication.createAudience(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TAGS.GET_ALL_AUDIENCE],
        });
      },
      onError,
    },
    queryClient,
  );
};
