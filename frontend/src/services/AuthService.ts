import { Auth } from "aws-amplify";
import { CognitoUserSession } from "amazon-cognito-identity-js";

interface EssentialCredentials {
    accessKeyId: any;
    sessionToken: any;
    secretAccessKey: any;
    identityId: any;
    authenticated: any;
}

interface UserAttributes {
    name: string;
    given_name: string;
    family_name: string;
}

interface AuthData {
    id: string;
    name?: string;
    username: string;
    attributes: UserAttributes;
    signInUserSession: CognitoUserSession;
}

export class AuthService {

    currentAuthenticatedUser(): Promise<AuthData> {
        return Auth.currentAuthenticatedUser();
    }

    getCredentials(): Promise<EssentialCredentials> {
        return Auth.currentUserCredentials()
            .then((cred) => {
                const essentialCredentials = Auth.essentialCredentials(cred);
                console.debug("Got credentials", cred, essentialCredentials);
                return essentialCredentials;
            })
            .catch((err: any) => {
                console.error("Error getting credentials", err);
                throw new Error(err);
            });
    }

    async getIdToken(): Promise<string> {
        const cred = await this.currentAuthenticatedUser();
        return cred.signInUserSession.getIdToken().getJwtToken();
    }

    signOut() {
        Auth.signOut();
    }
}
