import { AmplifyUser } from '@aws-amplify/ui';
import { Authenticator, UseAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";
import React from "react";
import "./App.css";
import AppBar from "./components/AppBar";
import InstanceList from "./components/InstanceList";
import { StateProvider } from "./hooks/state";
import { initialState, mainReducer } from "./reducers/main";

export type SignOut = UseAuthenticator['signOut'] | undefined;

interface AppProps {
  signOut: SignOut;
  user: AmplifyUser | undefined;
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

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ThemedApp: React.FC = () => {
  return (
    <Authenticator loginMechanisms={['username']}>
      {({ signOut, user }) => (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <App signOut={signOut} user={user} />
        </ThemeProvider>
      )}
    </Authenticator>
  );
};

export default ThemedApp;
