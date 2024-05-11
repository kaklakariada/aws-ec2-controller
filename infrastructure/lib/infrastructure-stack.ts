import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiGatewayBackendConstruct } from "./backend";
import { CognitoAuthConstruct } from "./cognito";
import { StaticContentConstruct } from "./static-content";

export interface InfrastructureStackProps extends StackProps {
  region: string;
  domain: string;
  hostedZoneName: string;
  hostedZoneId: string;
  sslCertificateArn: string;
  contactEmailAddress: string;
}

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    new StaticContentConstruct(this, "StaticContent", {
      domain: props.domain,
      hostedZoneName: props.hostedZoneName,
      sslCertificateArn: props.sslCertificateArn
    });

    const auth = new CognitoAuthConstruct(this, "Auth", {
      domain: props.domain,
      contactEmailAddress: props.contactEmailAddress
    });

    new ApiGatewayBackendConstruct(this, "Backend", {
      region: props.region,
      domain: props.domain,
      cognitoUserpoolArn: auth.userPoolArn,
      userRole: auth.userRole,
      hostedZoneId: props.hostedZoneId
    });
  }
}
