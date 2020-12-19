import instanceReducer, { InstanceState } from "./instance";

export interface ReducerState {
    instance: InstanceState;
}

export const initialState: ReducerState = {
    instance: {
        instances: [],
        loading: false,
        error: undefined
    }
};

export interface Action {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    error?: Error;
}

export type DispatchType = (a: Action) => void;

export function mainReducer(state: ReducerState, action: Action): ReducerState {
    console.log("Reducer: action: ", action, "state: ", state);
    return { instance: instanceReducer(state.instance, action) };
}
