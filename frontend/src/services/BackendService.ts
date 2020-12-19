import API from "@aws-amplify/api";
import { DispatchType } from "../reducers/main";
import { LOADING, LOADED, ERROR } from "../reducers/instance";
import { ENDPOINT_NAME } from "./BackendEndpoints";
import { Instance, InstanceJson } from "./Instance";

export class BackendService {

    apiGateway = API;

    dispatchGetInstances(dispatch: DispatchType): void {
        dispatch({ type: LOADING });
        this.getInstances().then((instances) =>
            dispatch({ type: LOADED, payload: instances })
        ).catch((error) =>
            dispatch({ type: ERROR, error })
        );
    }

    async getInstances(): Promise<Instance[]> {
        try {
            const respone = await this.apiGateway.get(ENDPOINT_NAME, "/instances", {});
            const rawList: InstanceJson[] = respone.result;
            return rawList.map((i) => new Instance(i));
        } catch (error) {
            console.warn("Error getting instances", error);
            const errorMessage = error.response ? error.response.data.result : undefined;
            throw new Error(`Error getting instances: ${error}, message: ${errorMessage}`);
        }
    }

    async setInstanceState(id: string, state: "start" | "stop"): Promise<string> {
        try {
            const response = await this.apiGateway.put(ENDPOINT_NAME, `/instances/${id}/state/${state}`, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("Set state result", response);
            return response.result;
        } catch (error) {
            console.warn("Error setting instance state", error);
            const errorMessage = error.response?.data?.result || error.response?.data?.message;
            throw new Error(`Error setting instance state: ${error}, message: ${errorMessage}`);
        }
    }
}
