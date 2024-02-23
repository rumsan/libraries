import { AxiosRequestConfig } from "axios"
import RumsanClient from "../rumsan.client"
import { formatResponse } from "../utils"

export const Apps = {
    listConstants  : async (name: string, config?: AxiosRequestConfig) => {
        const response = await RumsanClient.getAxiosInstance.get(`/app/constants/${name}`, config)  
        return formatResponse<any>(response)  
    }
}