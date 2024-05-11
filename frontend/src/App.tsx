import { Authenticator, ThemeProvider, UseAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import CssBaseline from "@mui/material/CssBaseline";
import {  StyledEngineProvider } from "@mui/material/styles";
import React from "react";
import "./App.css";
import AppBar from "./components/AppBar";
import InstanceList from "./components/InstanceList";
import { StateProvider } from "./hooks/state";
import { initialState, mainReducer } from "./reducers/main";
import { AuthUser } from 'aws-amplify/auth';

export type SignOut = UseAuthenticator['signOut'] | undefined;

interface AppProps {
  signOut: SignOut;
  user: AuthUser|undefined;
}

const App: React.FC<AppProps> = ({ signOut, user }) => {
  return (
    <div className="App">
      <React.StrictMode>
        <StateProvider initialState={initialState} reducer={mainReducer}>
          <CssBaseline />
          <AppBar user={user} signOut={signOut} />
          <header className="App-header">
          </header>
          <InstanceList />
        </StateProvider>
      </React.StrictMode>
    </div>
  );
};


const ThemedApp: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider >
        <Authenticator loginMechanisms={['username']}>
          {({ signOut, user }) => (
            <App signOut={signOut} user={user} />
          )}
        </Authenticator>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemedApp;
