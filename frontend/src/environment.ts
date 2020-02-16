import { EC2_CONTROLLER_ENDPOINT } from "./services/BackendEndpoints";
import { CONFIG } from "./frontend-config";

export interface FrontendConfig {
    region: string;
    cognitoIdentityPoolId: string;
    cognitoUserPoolId: string;
    cognitoUserPoolWebClientId: string;
    apiGatewayEndpointUrl: string;
}

interface ApiEndpoint {
    name: string;
    endpoint: string;
    region: string;
}

interface AmplifyConfig {
    Auth: {
        identityPoolId: string;
        identityPoolRegion: string;
        region: string;
        userPoolId: string;
        userPoolWebClientId: string;
        mandatorySignIn: boolean;
        authenticationFlowType: string;
    };
    API: {
        endpoints: ApiEndpoint[]
    };
}

interface EnvironmentConfig {
    region: string;
    amplifyConfig: AmplifyConfig;
}

const isLocalDevEnvironment = window.location.hostname === "localhost";

const config: FrontendConfig = CONFIG;

const environment: EnvironmentConfig = {
    region: config.region,
    amplifyConfig: {
        Auth: {
            identityPoolId: config.cognitoIdentityPoolId,
            identityPoolRegion: config.region,
            region: config.region,
            userPoolId: config.cognitoUserPoolId,
            userPoolWebClientId: config.cognitoUserPoolWebClientId,
            mandatorySignIn: true,
            authenticationFlowType: "USER_SRP_AUTH"
        },
        API: {
            endpoints: [
                {
                    name: EC2_CONTROLLER_ENDPOINT,
                    endpoint: isLocalDevEnvironment ? "http://localhost:8080" : config.apiGatewayEndpointUrl,
                    region: config.region
                }
            ]
        }
    }
};

export default environment;
