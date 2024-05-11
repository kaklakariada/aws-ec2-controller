import { Amplify } from "aws-amplify";
import { createRoot } from 'react-dom/client';
import App from "./App";
import environment from "./environment";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

Amplify.configure(environment.amplifyConfig);


const container = document.getElementById('root');
const root =  createRoot(container!)
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
// serviceWorker.register();
