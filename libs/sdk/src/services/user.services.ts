import { AxiosRequestConfig } from 'axios';
import { ListUserDto } from '../dtos';
import RahatClient from '../rumsan.client';
import { TUser } from '../types';
import { formatResponse } from '../utils';
export const User = {

    list:async (data?: ListUserDto, config?: AxiosRequestConfig) => {
        const response = await RahatClient.getAxiosInstance.get('/users', {params: data,headers: config?.headers , ...config});
        return formatResponse<TUser>(response)
    }
}


