import { AmplifyUser } from '@aws-amplify/ui';
import { Authenticator, UseAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import CssBaseline from "@material-ui/core/CssBaseline";
import { createTheme, ThemeOptions } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
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

const darkTheme: ThemeOptions = {
  palette: {
    type: "dark"
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: "#303030"
      }
    }
  }
};

const ThemedApp: React.FC = () => {
  const theme = createTheme(darkTheme);
  return (
    <Authenticator loginMechanisms={['username']}>
      {({ signOut, user }) => (
        <ThemeProvider theme={theme}>
          <App signOut={signOut} user={user} />
        </ThemeProvider>
      )}
    </Authenticator>
  );
};

export default ThemedApp;
