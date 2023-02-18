import { AmplifyUser } from '@aws-amplify/ui';
import { Authenticator, UseAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, DeprecatedThemeOptions, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/styles";
import React from "react";
import "./App.css";
import AppBar from "./components/AppBar";
import InstanceList from "./components/InstanceList";
import { StateProvider } from "./hooks/state";
import { initialState, mainReducer } from "./reducers/main";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


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

const darkTheme: DeprecatedThemeOptions = {
  palette: {
    mode: "dark"
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
  const theme = createTheme(adaptV4Theme(darkTheme));
  return (
    <Authenticator loginMechanisms={['username']}>
      {({ signOut, user }) => (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <App signOut={signOut} user={user} />
          </ThemeProvider>
        </StyledEngineProvider>
      )}
    </Authenticator>
  );
};

export default ThemedApp;
