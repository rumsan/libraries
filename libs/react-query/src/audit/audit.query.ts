import { Pagination } from '@rumsan/sdk/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRSQuery } from '../providers';
import { TAGS } from '../utils/tags';
import { useAuditStore } from './audit.store';

export const useAuditList = (payload?: Pagination) => {
  const { queryClient, rumsanService } = useRSQuery();
  const setAudit = useAuditStore((state) => state.setAuditList);

  const query = useQuery(
    {
      queryKey: [TAGS.GET_ALL_AUDIT],
      queryFn: async () => {
        const res = await rumsanService.client.get('/audits');
        return res.data;
      },
    },
    queryClient,
  );

  useEffect(() => {
    if (query.data) {
      setAudit(query.data);
    }
  }, [query.data]);
  return query;
};
