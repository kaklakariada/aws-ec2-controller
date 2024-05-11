#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import "source-map-support/register";
import { CONFIG } from "../infrastructure-config";
import { InfrastructureConfig } from "../lib/infrastructure-config-interface";
import { InfrastructureStack, InfrastructureStackProps } from "../lib/infrastructure-stack";

const config: InfrastructureConfig = CONFIG;

const props: InfrastructureStackProps = {
    env: { region: config.region },
    description: `EC2 Controller ${config.domain}`,
    tags: { stack: config.stackName },
    region: config.region,
    domain: config.domain,
    hostedZoneName: config.hostedZoneName,
    hostedZoneId: config.hostedZoneId,
    sslCertificateArn: config.sslCertificateArn,
    contactEmailAddress: config.contactEmailAddress
};

const app = new App();
new InfrastructureStack(app, config.stackName, props);
