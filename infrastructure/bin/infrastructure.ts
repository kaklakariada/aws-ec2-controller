#!/usr/bin/env node
import "source-map-support/register";
import { InfrastructureStack, InfrastructureStackProps } from "../lib/infrastructure-stack";
import { CONFIG } from "../infrastructure-config";
import { InfrastructureConfig } from "../lib/infrastructure-config-interface";
import { App } from "aws-cdk-lib";

const config: InfrastructureConfig = CONFIG;

const props: InfrastructureStackProps = {
    env: { region: config.region },
    description: `EC2 Controller ${config.domain}`,
    tags: { stack: config.stackName },
    domain: config.domain,
    hostedZoneName: config.hostedZoneName,
    hostedZoneId: config.hostedZoneId,
    sslCertificateArn: config.sslCertificateArn,
    contactEmailAddress: config.contactEmailAddress
};

const app = new App();
new InfrastructureStack(app, config.stackName, props);
