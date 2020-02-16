export interface InfrastructureConfig {
    region: string;
    domain: string;
    hostedZoneName: string;
    hostedZoneId: string;
    sslCertificateArn: string;
    stackName: string;
    contactEmailAddress: string;
}
