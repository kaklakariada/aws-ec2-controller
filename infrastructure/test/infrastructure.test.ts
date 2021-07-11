import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from 'aws-cdk-lib';
import Infrastructure = require('../lib/infrastructure-stack');

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Infrastructure.InfrastructureStack(app, 'MyTestStack', {
    domain: "domain",
    hostedZoneName: "hostedZoneName",
    hostedZoneId: "hostedZoneId",
    sslCertificateArn: "sslCert",
    contactEmailAddress: "email"
  });
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
});