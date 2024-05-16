import { localStore } from '../utils/local.store';
import { zustandStore } from '../utils/zustand.store';

type AuditState = {
  audit: any;
  audits: any[];
};

type AuditStateAction = {
  setAudit: (audit: any) => void;
  setAuditList: (audit: any) => void;
  clearAudit: () => void;
};

type AuditStore = AuditState & AuditStateAction;

export const useAuditStore = zustandStore<AuditStore>(
  (set) => ({
    audit: null,
    audits: [],
    setAuditList: (audit) => set(audit),
    setAudit: (audit) => set({ audit }),
    clearAudit: () => set({ audit: null }),
  }),
  {
    devtoolsEnabled: true,
    persistOptions: {
      name: 'auditStorage',
      storage: localStore,
    },
  },
);
