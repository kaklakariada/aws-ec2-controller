#!/usr/bin/env node
import "source-map-support/register";
import cdk = require("@aws-cdk/core");
import { InfrastructureStack, InfrastructureStackProps } from "../lib/infrastructure-stack";
import { CONFIG } from "../infrastructure-config";
import { InfrastructureConfig } from "../lib/infrastructure-config-interface";

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

const app = new cdk.App();
new InfrastructureStack(app, config.stackName, props);
