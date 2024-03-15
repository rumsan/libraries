import { Pagination } from '.';

export interface CreateCampaign {
  name: string;
  type: string;
  startTime: string | Date | null;
  status: string;
  details: string;
  audienceIds: number[];
  transportId: number;
}

export interface EditCampaign {
  id: string;
  name?: string;
  type?: string;
  startTime?: string | Date | null;
  status?: string;
  details?: string;
  audienceIds?: number[];
  transportId?: number;
}

export type ListCampaign = Partial<Pagination>;

export interface ICampaignItemApiResponse {
  id: number;
  appId: string;
  name: string;
  startTime: string;
  type: string;
  details: {
    from: string;
    twiml: TwiML;
    callbackUrl: string;
    countryCode: string;
    body?: string;
    message?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  transportId: number;
  deletedAt: null | string;
  transport: Transport;
  audiences: Audience[];
  campaigns: number[];
  totalAudiences: number;
  communicationLogs: any[];
}

interface TwiML {
  ivr: IVR;
  audio: Audio;
}

interface IVR {
  url: string;
  method: string;
}

export interface Audio {
  id: number;
  filename: string;
  url: string;
  method: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
}

export interface Transport {
  id: number;
  name: string;
  details: TransportDetails;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}

export interface Audience {
  id: number;
  details: AudienceDetails;
  appId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}

interface TransportDetails {
  api: string;
  sid: string;
  token: string;
}
interface AudienceDetails {
  name: string;
  email: string;
  phone: string;
  discordId: string;
  discordToken: string;
}

export interface Transport {
  id: number;
  name: string;
  details: TransportDetails;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}
