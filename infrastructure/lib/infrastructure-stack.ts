import { Stack, Construct, StackProps } from "@aws-cdk/core";
import { StaticContentConstruct } from "./static-content";
import { ApiGatewayBackendConstruct } from "./backend";
import { CognitoAuthConstruct } from "./cognito";

export interface InfrastructureStackProps extends StackProps {
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
      domain: props.domain,
      cognitoUserpoolArn: auth.userPoolArn,
      userRole: auth.userRole,
      hostedZoneId: props.hostedZoneId
    });
  }
}
