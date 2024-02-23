import { AxiosRequestConfig } from "axios";
import { UUID } from "crypto";
import RumsanClient from "../rumsan.client";
import { formatResponse } from "../utils";

export const Roles = {
    createRole : async (role: Role) => {},

    getRole: async (uuid: UUID, config?: AxiosRequestConfig) => {

        const response = await RumsanClient.getAxiosInstance.get(  '/roles/${uuid}', config,);
        return formatResponse<>(response);

    }
}