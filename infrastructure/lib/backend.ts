import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { AccessLogFormat, AuthorizationType, ConnectionType, CorsOptions, EndpointType, LambdaIntegration, LambdaIntegrationOptions, LogGroupLogDestination, MethodLoggingLevel, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Architecture, Code, Function as LambdaFunction, LoggingFormat, Runtime, SnapStartConf } from "aws-cdk-lib/aws-lambda";
import { LogGroup, LogGroupClass, LogGroupProps, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

interface BackendProps {
  region: string;
  cognitoUserpoolArn: string;
  domain: string;
  hostedZoneId: string;
  userRole: Role;
}

export class ApiGatewayBackendConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id);

    const instancesTable = new Table(this, "InstancesTable", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: "id", type: AttributeType.STRING }
    });

    const backendCodeAsset = Code.fromAsset("../backend/build/distributions/backend.zip");

    const commonLambdaConfig = {
      handler: "io.micronaut.function.aws.proxy.payload1.ApiGatewayProxyRequestEventFunction",
      architecture: Architecture.X86_64,
      snapStart: SnapStartConf.ON_PUBLISHED_VERSIONS,
      runtime: Runtime.JAVA_21,
      timeout: Duration.seconds(30),
      memorySize: 2048,
      code: backendCodeAsset,
      loggingFormat: LoggingFormat.TEXT,
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    }

    const logGroupProps: LogGroupProps = {
      retention: RetentionDays.ONE_MONTH,
      logGroupClass: LogGroupClass.STANDARD,
      removalPolicy: RemovalPolicy.DESTROY,
    }

    const defaultLambdaEnv = {
      MICRONAUT_ENVIRONMENTS: "lambda",
      MICRONAUT_SERVER_CORS_CONFIGURATIONS_WEB_ALLOWEDORIGINS: props.domain,
      DEPLOYMENT_AWS_REGION: props.region,
    };

    const listInstancesLambda = new LambdaFunction(this, "ListInstances", {
      ...commonLambdaConfig,
      logGroup: new LogGroup(this, "ListInstancesLambdaLogGroup", logGroupProps),
      environment: {
        ...defaultLambdaEnv,
        TABLENAME_DYNAMODBINSTANCE: instancesTable.tableName,
        HOSTED_ZONE_ID: props.hostedZoneId
      },
      initialPolicy: [
        new PolicyStatement({ actions: ["ec2:DescribeInstances"], resources: ["*"] }),
        new PolicyStatement({ actions: ["route53:ListResourceRecordSets"], resources: [`arn:aws:route53:::hostedzone/${props.hostedZoneId}`] }),
        new PolicyStatement({ actions: ["dynamodb:Scan"], resources: [instancesTable.tableArn] }),
        new PolicyStatement({ actions: ["pricing:GetProducts"], resources: ["*"] })
      ]
    });

    const startStopInstancesLambda = new LambdaFunction(this, "StartStopInstances", {
      ...commonLambdaConfig,
      logGroup: new LogGroup(this, "StarStopInstancesLambdaLogGroup", logGroupProps),
      environment: {
        ...defaultLambdaEnv,
        TABLENAME_DYNAMODBINSTANCE: instancesTable.tableName
      },
      initialPolicy: [
        new PolicyStatement({ actions: ["dynamodb:GetItem"], resources: [instancesTable.tableArn] }),
        new PolicyStatement({ actions: ["ec2:StartInstances", "ec2:StopInstances"], resources: ["*"] })
      ]
    });

    const listInstancesLambdaAlias = listInstancesLambda.addAlias("prod");
    const startStopInstancesLambdaAlias = startStopInstancesLambda.addAlias("prod");

    const corsAllowedOrigin = `https://${props.domain}`;
    const api = new RestApi(this, "RestApi", {
      restApiName: "EC2 Controller",
      description: "Backend for EC2 Controller",
      endpointTypes: [EndpointType.REGIONAL],
      failOnWarnings: true,
      retainDeployments: false,
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
      deployOptions: {
        stageName: "prod",
        tracingEnabled: false,
        loggingLevel: MethodLoggingLevel.INFO,
        accessLogFormat: AccessLogFormat.clf(),
        accessLogDestination: new LogGroupLogDestination(new LogGroup(this, "RestApiLogGroup", logGroupProps)),
        cachingEnabled: false,
        metricsEnabled: false,
        dataTraceEnabled: false,
        throttlingBurstLimit: 5, // requests (default: 5000)
        throttlingRateLimit: 5, // requests per second (default: 10000)
      }
    });

    const instancesResource = api.root.addResource("instances");
    const instanceStateResource = instancesResource
      .addResource("{id}")
      .addResource("state")
      .addResource("{state}");

    const options: LambdaIntegrationOptions = {
      proxy: true,
      allowTestInvoke: true,
      connectionType: ConnectionType.INTERNET,
    };

    function corsOptions(method: string): CorsOptions {
      return {
        statusCode: 204,
        allowOrigins: [corsAllowedOrigin],
        allowMethods: [method],
        allowCredentials: false,
        allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"],
        maxAge: Duration.minutes(30),
      };
    }

    instancesResource.addCorsPreflight(corsOptions("GET"));
    const getInstancesMethod = instancesResource.addMethod("GET",
      new LambdaIntegration(listInstancesLambdaAlias, options),
      { operationName: "ListInstances" });

    instanceStateResource.addCorsPreflight(corsOptions("PUT"));
    const putInstanceStateMethod = instanceStateResource.addMethod("PUT",
      new LambdaIntegration(startStopInstancesLambdaAlias, options),
      { operationName: "StartStopInstance" });

    props.userRole.addToPolicy(new PolicyStatement({
      actions: ["execute-api:Invoke"], resources: [
        getInstancesMethod.methodArn,
        putInstanceStateMethod.methodArn.replace("{state}", "*").replace("{id}", "*")]
    }));

    new CfnOutput(this, "ApiGatewayUrl", {
      description: "Api gateway url",
      value: api.url
    });

    new CfnOutput(this, "InstanceTableName", {
      description: "Name of the instances DynamoDB table",
      value: instancesTable.tableName
    });
  }
}


