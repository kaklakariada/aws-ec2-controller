import { fetchAuthSession, AuthSession, signOut, getCurrentUser, AuthUser } from "aws-amplify/auth";

import { AWSCredentials } from "@aws-amplify/core/internals/utils";

export class AuthService {

    async _getIdToken(): Promise<string> {
        const credentails = await this.getAuthSession()
        const token = credentails.tokens?.idToken?.toString()
        if (!token) {
            throw new Error(`No session found for user`);
        }
        return token
    }

    async currentAuthenticatedUser(): Promise<AuthUser> {
        return await getCurrentUser();
    }

    async getAuthSession(): Promise<AuthSession> {
        return await fetchAuthSession();
    }

    private async getCredentials(): Promise<AWSCredentials> {
        const session = await this.getAuthSession()
        if (!session.credentials) {
            throw new Error(`Auth session does not contain credentials`);
        }
        return session.credentials
    }
    async getRenewableCredentials(): Promise<RenewableCredentials> {
        return new RenewableCredentials(this.getCredentials, await this.getCredentials());
    }


    signOut() {
        signOut({ global: true });
    }
}

type CredentialsConsumer = (credentials: RenewableCredentials) => void;
type CredentialsProvider = () => Promise<AWSCredentials>;


const CREDENTIAL_RENEWAL_BUFFER_MILLIS = 1000*10;

export class RenewableCredentials {
    constructor(private fetchCredentials: CredentialsProvider, private awsCredentials: AWSCredentials) {
        const remainingTimeMinutes = (this.expiration.getTime() - Date.now()) / 1000 / 60;
        console.log(`Credentials expire at ${this.expiration} in ${remainingTimeMinutes} minutes`)
    }
    whenExpired(consumer: CredentialsConsumer) {
        const expirationMillis = this.expiration.getTime() - Date.now()- CREDENTIAL_RENEWAL_BUFFER_MILLIS;
        console.log(`Renewing credentials in ${expirationMillis / 1000/60} minutes`);
        setTimeout(async () => {
            const newCredentials = await this.fetchCredentials();
            consumer(new RenewableCredentials(this.fetchCredentials, newCredentials));
        }, expirationMillis);
    }

    get expiration(): Date {
        if (!this.awsCredentials.expiration) {
            throw new Error(`Credentials do not have an expiration date`);
        }
        return this.awsCredentials.expiration;
    }

    get remainingValidTimeMillis(): number {
        return this.expiration.getTime() - Date.now();
    }

    get credentials(): AWSCredentials {
        return this.awsCredentials;
    }
}
