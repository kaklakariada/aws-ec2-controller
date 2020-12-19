import React from "react";
import "./App.css";
import CssBaseline from "@material-ui/core/CssBaseline";
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import InstanceList from "./components/InstanceList";
import { createMuiTheme, ThemeOptions, makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import AppBar from "./components/AppBar";
import { StateProvider } from "./hooks/state";
import { initialState, mainReducer } from "./reducers/main";

const App: React.FC = () => {
  return (
    <div className="App">
      <React.StrictMode>
        <StateProvider initialState={initialState} reducer={mainReducer}>
          <CssBaseline />
          <AppBar />
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

const useStyles = makeStyles(() => ({
  authenticator: {
    'text-align': 'center'
  }
}));

const ThemedApp: React.FC = () => {
  const classes = useStyles();
  const theme = createMuiTheme(darkTheme);
  return (
    <AmplifyAuthenticator usernameAlias="username" className={classes.authenticator}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </AmplifyAuthenticator>
  );
};

export default ThemedApp;
