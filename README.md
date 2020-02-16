# EC2 Controller

A serverless web app for starting/stopping EC2 instances

## Deployment to AWS

### Preconitions

To deploy this in your AWS account you will need the following:

* A region where you want to deploy, e.g. `eu-west-1`
* A Route53 hosted zone, e.g. `example.com.` and its ID `XXXXXXXXXXXXXX`
* A domain you want to use, e.g. `ec2-controller.example.com`
* An ACM certificate for `ec2-controller.example.com` (or `*.example.com`) in `us-east-1` and its ARN `arn:aws:acm:us-east-1:000000000000:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

On your local machine you will need the following:

* NodeJS
* JDK 11 (e.g. from [AdoptOpenJDK](https://adoptopenjdk.net/?variant=openjdk11&jvmVariant=hotspot))

### Build backend

```bash
cd backend
./gradlew clean build -i
```

### Configure infrastructure

Create file `infrastructure/infrastructure-config.ts` based on the following template and fill in your configuration:

```typescript
import { InfrastructureConfig } from "./lib/infrastructure-config-interface";

export const CONFIG: InfrastructureConfig = {
    region: "eu-west-1",
    domain: "ec2-controller.example.com",
    hostedZoneName: "example.com.",
    hostedZoneId: "XXXXXXXXXXXXXX",
    sslCertificateArn: "arn:aws:acm:us-east-1:000000000000:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    stackName: "ec2-controller",
    contactEmailAddress: "admin@example.com"
};
```

### Deploy infrastructure

```bash
cd infrastructure
npm run cdk deploy
```

This command will take up to 30 minutes. At the end it will output information you need for configuring the frontend in the next step.

### Configure frontend

Create file `frontend/src/frontend-config.ts` based on the following template and fill in the values for your deployed stack:

```typescript
import { FrontendConfig } from "./environment";

export const CONFIG: FrontendConfig = {
    region: "eu-west-1",
    apiGatewayEndpointUrl: "https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod",
    cognitoIdentityPoolId: "eu-west-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    cognitoUserPoolId: "eu-west-1_xxxxxxxxx",
    cognitoUserPoolWebClientId: "xxxxxxxxxxxxxxxxxxxxxxxxxx"
};
```

Create file `frontend/deploy/deploy-config.js` based on the following template and fill in the values for your deployed stack:

```javascript
exports.CONFIG = {
    staticWebsiteBucket: 'ec2-controller-staticcontentbucketxxxxxxxxxxxxxxxxxxxxxx',
    cloudfrontDistributionId: 'XXXXXXXXXXXXXX'
}
```

### Deploy frontend

```bash
cd frontend
npm run deploy
```

### Configure backend

#### Add EC2 instances to whitelist

Add entries to the DynamoDB table for instances that you want to control:

```json
{
    "id": "i-xxxxxxxxxxxxxxxxx",
    "controlAllowed": true,
    "domain": "instance.example.com",
    "sortOrder": 1
}
```

* `id`: AWS EC2 instance ID.
* `controlAllowed`: Allow starting/stopping this instance.
* `domain`: Domain name for this instance. Used to check if DNS entry is in sync.
* `sortOrder`: Specify order in which to display entries in the web app.

#### Create Cognito users

Go to the AWS Cognito console and create users for your new web app. Don't forget to add them to group `Users`.

## Development

### Backend

#### Run local backend server

Configure environment variables for local server: create file `backend/local-server-env.properties` based on the following template and fill in the values for your deployed stack:

```properties
TABLENAME_DYNAMODBINSTANCE = ec2-controller-instances-Backend
HOSTED_ZONE_ID = XXXXXXXXXXXXXX
```

Then start the local server:

```bash
cd backend
./gradlew runServer
```

#### Configure eclipse project

```bash
cd backend
./gradlew eclipse
```

### Frontend

Run local frontend during development:

```bash
cd frontend
npm start
```

### Upgrade dependencies in package.json

```bash
npx npm-check-updates -u
```

### Troubleshooting

#### There is no "Run" button for my EC2 instance in the web app

Add an entry for your instance to the DynamoDB table and set `controlAllowed` to `true`.

#### Local server returns `404` when running in Eclipse

Configure project using gradle and refresh project in Eclipse:

```bash
cd backend
./gradlew eclipse
```

#### `GET /instances` returns error 403 Forbidden

Make sure your Cognito user has role `Users`.

#### Creating a new account does not work.

Creating an account on the login page fails with message `SignUp is not permitted for this user pool`.

Registering of new users is deactivated for the Cognito user pool. You can change this by setting `allowAdminCreateUserOnly` to `false` in `cognito.ts`.
