import { AxiosResponse } from "axios";
import { TResponse } from '../types/response.types';
export const formatResponse = <T> (response: AxiosResponse)=> {
    return {
        data: <T>response.data.data,
        response: <TResponse<T>>response.data,
        httpReponse: response,
      };
}