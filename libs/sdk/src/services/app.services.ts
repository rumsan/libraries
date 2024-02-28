import { AxiosRequestConfig } from 'axios';
import { RumsanService } from '../rumsan.service';
import { formatResponse } from '../utils';

export const Apps = {
  listConstants: async (name: string, config?: AxiosRequestConfig) => {
    const response = await RumsanService.client.get(
      `/app/constants/${name}`,
      config,
    );
    return formatResponse<any>(response);
  },
};
