import React from "react";
import { ReducerState, Action, initialState, DispatchType } from "../reducers/main";


interface IStateContext {
  dispatch: DispatchType;
  state: ReducerState;
}

const defaultValue: IStateContext = {
  dispatch: () => {
    throw Error("Not implemented");
  },
  state: initialState,
};
const StateContext = React.createContext(defaultValue);

interface Arg {
  reducer: (state: ReducerState, action: Action) => ReducerState;
  initialState: ReducerState;
  children: JSX.Element[];
}

export const StateProvider = ({ reducer, initialState: initState, children }: Arg) => {
  const [state, dispatch] = React.useReducer(reducer, initState);
  return (
    <StateContext.Provider value={{ dispatch, state }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateValue = () => {
  return React.useContext(StateContext);
};
