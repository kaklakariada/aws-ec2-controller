import React, { createContext, useContext, useReducer } from "react";
import { ReducerState, Action, initialState, DispatchType } from "../reducers/main";

const defaultValue: ReducerState = initialState;
const StateContext = createContext(defaultValue);

interface Arg {
  reducer: (state: ReducerState, action: Action) => ReducerState;
  initialState: ReducerState;
  children: JSX.Element[];
}

export const StateProvider = ({ reducer, initialState: initState, children }: Arg) => {
  const state = useReducer(reducer, initState);
  return (
    <StateContext.Provider value={state}>
      {children}
    </StateContext.Provider>
  );
};
export const useStateValue = () => {
  const context: any[] = useContext(StateContext);
  const state: ReducerState = context[0];
  const dispatch: DispatchType = context[1];
  return {state, dispatch};
};
