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
    payload?: any;
    error?: any;
}

export type DispatchType = (a: Action) => void;

export const mainReducer = (state: ReducerState, action: Action) => {
    console.log("Reducer: action: ", action, "state: ", state);
    return { instance: instanceReducer(state.instance, action) };
};
