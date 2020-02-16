import API from "@aws-amplify/api";
import { AuthService } from "./AuthService";
import { EnvironmentService } from "./EnvironmentService";
import { DispatchType } from "../reducers/main";
import { LOADING, LOADED, ERROR } from "../reducers/instance";
import { EC2_CONTROLLER_ENDPOINT } from "./BackendEndpoints";
import { Instance, InstanceJson } from "./Instance";

export class BackendService {

    authService = new AuthService();
    envService = new EnvironmentService();
    apiGateway = API;

    dispatchGetInstances(dispatch: DispatchType) {
        dispatch({ type: LOADING });
        this.getInstances().then((instances) =>
            dispatch({ type: LOADED, payload: instances })
        ).catch((error) =>
            dispatch({ type: ERROR, error })
        );
    }

    async getInstances(): Promise<Instance[]> {
        try {
            const respone = await this.apiGateway.get(EC2_CONTROLLER_ENDPOINT, "/instances", {});
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
            const response = await this.apiGateway.put(EC2_CONTROLLER_ENDPOINT, `/instances/${id}/state/${state}`, {
                headers: { "Content-Type": "Content-Type" }
            });
            console.log("Set state result", response);
            return response.result;
        } catch (error) {
            console.warn("Error setting instance state", error);
            const errorMessage = error.response.data.result;
            throw new Error(`Error setting instance state: ${error}, message: ${errorMessage}`);
        }
    }
}
