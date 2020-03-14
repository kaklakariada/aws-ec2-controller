import React from "react";
import "./App.css";
import CssBaseline from "@material-ui/core/CssBaseline";
import { withAuthenticator } from "aws-amplify-react";
import InstanceList from "./components/InstanceList";
import { createMuiTheme, ThemeOptions } from "@material-ui/core/styles";
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

const AuthenticatedApp = withAuthenticator(App, false);

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

const lightTheme: ThemeOptions = {
  palette: {
    type: "light"
  }
};

const ThemedApp: React.FC = () => {
  const theme = createMuiTheme(darkTheme);
  return (
    <ThemeProvider theme={theme}>
      <AuthenticatedApp />
    </ThemeProvider>
  );
};

export default ThemedApp;
