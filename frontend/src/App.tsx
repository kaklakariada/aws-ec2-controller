import React from "react";
import "./App.css";
import '@aws-amplify/ui-react/styles.css';
import CssBaseline from "@material-ui/core/CssBaseline";
import { Authenticator } from '@aws-amplify/ui-react';
import InstanceList from "./components/InstanceList";
import { createTheme, ThemeOptions } from "@material-ui/core/styles";
import { CognitoUserAmplify } from '@aws-amplify/ui';
import { ThemeProvider } from "@material-ui/styles";
import AppBar from "./components/AppBar";
import { StateProvider } from "./hooks/state";
import { initialState, mainReducer } from "./reducers/main";

interface AppProps {
  signOut: (data?: Record<string | number | symbol, any> | undefined) => void;
  user: CognitoUserAmplify;
}

const App: React.FC<AppProps> = ({ signOut, user }) => {
  return (
    <div className="App">
      <React.StrictMode>
        <StateProvider initialState={initialState} reducer={mainReducer}>
          <CssBaseline />
          <AppBar user={user} signOut={signOut}/>
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
