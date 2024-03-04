import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type CampaignState = {
  campaign: any;
  totalTextCampaign: number;
  totalVoiceCampaign: number;
};

type CampaignStateAction = {
  setCampaign: (campaign: any) => void;
  setTotalTextCampaign: (totalTextCampaign: number) => void;
  setTotalVoiceCampaign: (totalVoiceCampaign: number) => void;
  clearCampaign: () => void;
};

type CampaignStore = CampaignState & CampaignStateAction;

export const useCampaignStore = zustandStore<CampaignStore>(
  (set: any) => ({
    campaign: null,
    totalTextCampaign: 0,
    totalVoiceCampaign: 0,
    setCampaign: (campaign: any) => set({ campaign }),
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
  },
);
