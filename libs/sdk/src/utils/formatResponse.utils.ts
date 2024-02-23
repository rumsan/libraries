import { Response } from '@rumsan/core';
import { AxiosResponse } from 'axios';

import { StringUtils } from '@rumsan/core';
export const formatResponse = <T>(response: AxiosResponse) => {
  console.log(StringUtils);
  return {
    data: <T>response.data.data,
    response: <Response<T>>response.data,
    httpReponse: response,
  };
};