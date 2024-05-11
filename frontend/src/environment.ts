import { CONFIG } from "./frontend-config";
import { ResourcesConfig } from "aws-amplify";
export interface FrontendConfig {
    region: string;
    cognitoIdentityPoolId: string;
    cognitoUserPoolId: string;
    cognitoUserPoolWebClientId: string;
    apiGatewayEndpointUrl: string;
}

interface EnvironmentConfig {
    region: string;
    amplifyConfig: ResourcesConfig;
}

const isLocalDevEnvironment = window.location.hostname === "localhost";

const config: FrontendConfig = CONFIG;

const environment: EnvironmentConfig = {
    region: config.region,
    amplifyConfig: {
        Auth: {
            Cognito: {
                userPoolId: config.cognitoUserPoolId,
                userPoolClientId: config.cognitoUserPoolWebClientId,
                identityPoolId: config.cognitoIdentityPoolId,
                allowGuestAccess: false,
            },
        },
        API: {
            REST: {
                Ec2ControllerEndpoint: {
                    endpoint: isLocalDevEnvironment ? "http://localhost:8080" : config.apiGatewayEndpointUrl,
                    region: config.region

                }
            }
        }
    }
};

export default environment;
