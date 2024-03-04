import { AxiosInstance, AxiosRequestConfig } from 'axios';
import {} from '../types';
import { CommunicationClient } from '../types/client.types';
import {
  Audience,
  Audio,
  CreateCampaign,
  EditCampaign,
  ICampaignItemApiResponse,
  ListCampaign,
  Transport,
} from '../types/communication.types';
import { formatResponse } from '../utils';

export const getCommunicationClient = (
  client: AxiosInstance,
): CommunicationClient => {
  return {
    createCampaign: async (campaign: CreateCampaign) => {
      const response = await client.post('/campaigns', campaign);
      return formatResponse<ICampaignItemApiResponse>(response);
    },
    listCampaign: async (data?: ListCampaign, config?: AxiosRequestConfig) => {
      const response = await client.get('/campaigns?', {
        params: data,
        ...config,
      });
      return formatResponse<ICampaignItemApiResponse[]>(response);
    },
    deleteCampaign: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/campaigns/${id}`, config);
      return formatResponse<ICampaignItemApiResponse>(response);
    },
    updateCampaign: async (data: EditCampaign, config?: AxiosRequestConfig) => {
      const response = await client.patch(
        `/campaigns/${data.id}`,
        data,
        config,
      );
      return formatResponse<ICampaignItemApiResponse>(response);
    },
    getCampaign: async (id: number, config?: AxiosRequestConfig) => {
      const response = await client.get(`/campaigns/${id}`, config);
      return formatResponse<ICampaignItemApiResponse>(response);
    },
    triggerCampaign: async (id: number, config?: AxiosRequestConfig) => {
      const response = await client.get(`/campaigns/${id}/trigger`, config);
      return formatResponse<ICampaignItemApiResponse[]>(response);
    },
    getAudio: async (config?: AxiosRequestConfig) => {
      const response = await client.get(`/campaigns/audio`, config);
      return formatResponse<Audio[]>(response);
    },
    listAudience: async (config?: AxiosRequestConfig) => {
      const response = await client.get(`/audiences`, config);
      return formatResponse<Audience[]>(response);
    },
    listTransport: async (config?: AxiosRequestConfig) => {
      const response = await client.get(`/transports`, config);
      return formatResponse<Transport[]>(response);
    },
  };
};
