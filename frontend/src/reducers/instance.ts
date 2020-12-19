import { Instance } from "../services/Instance";
import { Action } from "./main";

export interface InstanceState {
    instances: Instance[];
    loading: boolean;
    error: any | undefined;
}

export const LOADING = "instancesLoading";
export const LOADED = "instancesLoaded";
export const ERROR = "instancesError";

export default function instanceReducer(state: InstanceState, action: Action): InstanceState {
    switch (action.type) {
        case LOADING:
            return {
                instances: state.instances,
                loading: true,
                error: undefined
            };
        case LOADED:
            return {
                instances: action.payload,
                loading: false,
                error: undefined
            };
        case ERROR:
            return {
                instances: [],
                loading: false,
                error: action.error
            };
        default:
            return state;
    }
}
