import Amplify from '@aws-amplify/core';
import ReactDOM from "react-dom";
import App from "./App";
import environment from "./environment";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

Amplify.configure(environment.amplifyConfig);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
// serviceWorker.register();
