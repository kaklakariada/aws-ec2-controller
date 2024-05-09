import { get, put } from 'aws-amplify/api';
import { DispatchType } from "../reducers/main";
import { LOADING, LOADED, ERROR } from "../reducers/instance";
import { ENDPOINT_NAME } from "./BackendEndpoints";
import { Instance, InstanceJson } from "./Instance";

export class BackendService {

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
            const request = get({ apiName: ENDPOINT_NAME, path: "/instances", options: {} });
            const response = await (await request.response).body.json();
            console.log("Got instances", response);
            const rawList = (response as any).result as InstanceJson[]
            return (rawList).map((i) => new Instance(i));
        } catch (error: any) {
            console.warn("Error getting instances", error);
            const errorMessage = error.response ? error.response.data.result : undefined;
            throw new Error(`Error getting instances: ${error}, message: ${errorMessage}`);
        }
    }

    async setInstanceState(id: string, state: "start" | "stop"): Promise<string> {
        try {
            const request = put({ apiName: ENDPOINT_NAME, path: `/instances/${id}/state/${state}`, options: {} });
            console.log("Set state result", request);
            return JSON.stringify(await (await request.response).body.json());
        } catch (error: any) {
            console.warn("Error setting instance state", error);
            const errorMessage = error.response?.data?.result || error.response?.data?.message;
            throw new Error(`Error setting instance state: ${error}, message: ${errorMessage}`);
        }
    }
}
