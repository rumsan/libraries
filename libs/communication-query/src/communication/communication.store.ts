import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type CampaignState = {
  campaign: any;
  transport: any;
  audience: any;
  campaignList: any;
  audio: any;
  totalTextCampaign: number;
  totalVoiceCampaign: number;
};

type CampaignStateAction = {
  setCampaign: (campaign: any) => void;
  setAudio: (audio: any) => void;
  setTransport: (transport: any) => void;
  setAudience: (audience: any) => void;
  setCampaignList: (campaigns: any) => void;
  setTotalTextCampaign: (totalTextCampaign: number) => void;
  setTotalVoiceCampaign: (totalVoiceCampaign: number) => void;
  clearCampaign: () => void;
};

type CampaignStore = CampaignState & CampaignStateAction;

export const useCampaignStore = zustandStore<CampaignStore>(
  (set: any) => ({
    campaign: null,
    audience: [],
    transport: [],
    campaignList: [],
    audio: [],
    totalTextCampaign: 0,
    totalVoiceCampaign: 0,
    setCampaign: (campaign: any) => set({ campaign }),
    setAudience: (audience: any) => set({ audience }),
    setTransport: (transport: any) => set({ transport }),
    setAudio: (audio: any) => set({ audio }),
    setCampaignList: (campaigns: any) => set({ campaigns }),
    clearCampaign: () => set({ campaign: null }),
    setTotalTextCampaign: (totalTextCampaign: number) =>
      set({
        totalTextCampaign,
      }),
    setTotalVoiceCampaign: (totalVoiceCampaign: number) =>
      set({
        totalVoiceCampaign,
      }),
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'campaignStore',
      storage: localStore,
    },
  }
);
