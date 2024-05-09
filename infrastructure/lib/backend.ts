import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { AuthorizationType, EndpointType, LambdaIntegration, LambdaIntegrationOptions, MethodLoggingLevel, MockIntegration, PassthroughBehavior, Resource, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { CfnFunction, Code, Function as LambdaFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface BackendProps {
  cognitoUserpoolArn: string;
  domain: string;
  hostedZoneId: string;
  userRole: Role;
}

function addCorsOptions(apiResource: Resource, allowOriginDomain: string, allowMethod: string) {
  apiResource.addMethod("OPTIONS", new MockIntegration({
    integrationResponses: [{
      statusCode: "200",
      responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Origin": `'https://${allowOriginDomain}'`,
        "method.response.header.Access-Control-Allow-Credentials": "'true'",
        "method.response.header.Access-Control-Allow-Methods": `'${allowMethod}'`,
      }
    }],
    passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    }
  }), {
    authorizationType: AuthorizationType.NONE,
    methodResponses: [{
      statusCode: "200",
      responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Credentials": true, // COGNITO
        "method.response.header.Access-Control-Allow-Origin": true,
      }
    }]
  });
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
    const listInstancesLambda = new LambdaFunction(this, "ListInstances", {
      handler: "org.itsallcode.aws.ec2.StreamLambdaHandler",
      runtime: Runtime.JAVA_21,
      timeout: Duration.seconds(30),
      memorySize: 2048,
      code: backendCodeAsset,
      environment: {
        MICRONAUT_ENVIRONMENTS: "lambda",
        MICRONAUT_SERVER_CORS_CONFIGURATIONS_ALLPROD_ALLOWEDORIGINS: props.domain,
        TABLENAME_DYNAMODBINSTANCE: instancesTable.tableName,
        HOSTED_ZONE_ID: props.hostedZoneId
      },
      initialPolicy: [new PolicyStatement({ actions: ["ec2:DescribeInstances"], resources: ["*"] }),
      new PolicyStatement({ actions: ["route53:ListResourceRecordSets"], resources: [`arn:aws:route53:::hostedzone/${props.hostedZoneId}`] }),
      new PolicyStatement({ actions: ["dynamodb:Scan"], resources: [instancesTable.tableArn] }),
      new PolicyStatement({ actions: ["pricing:GetProducts"], resources: ["*"] })]
    });

    const startStopInstancesLambda = new LambdaFunction(this, "StartStopInstances", {
      handler: "org.itsallcode.aws.ec2.StreamLambdaHandler",
      runtime: Runtime.JAVA_21,
      timeout: Duration.seconds(30),
      memorySize: 2048,
      code: backendCodeAsset,
      environment: {
        MICRONAUT_ENVIRONMENTS: "lambda",
        MICRONAUT_SERVER_CORS_CONFIGURATIONS_ALLPROD_ALLOWEDORIGINS: props.domain,
        TABLENAME_DYNAMODBINSTANCE: instancesTable.tableName
      },
      initialPolicy: [
        new PolicyStatement({ actions: ["dynamodb:GetItem"], resources: [instancesTable.tableArn] }),
        new PolicyStatement({ actions: ["ec2:StartInstances", "ec2:StopInstances"], resources: ["*"] })
      ]
    });

    const listInstancesLambdaAlias = listInstancesLambda.addAlias("prod");
    const startStopInstancesLambdaAlias = startStopInstancesLambda.addAlias("prod");

    enableSnapStart(listInstancesLambda);
    enableSnapStart(startStopInstancesLambda);

    const api = new RestApi(this, "RestApi", {
      restApiName: "EC2 Controller",
      description: "Backend for EC2 Controller",
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
      endpointTypes: [EndpointType.REGIONAL],
      failOnWarnings: true,
      deployOptions: {
        stageName: "prod",
        tracingEnabled: false,
        methodOptions: {
          "/*/*": {
            metricsEnabled: false,
            loggingLevel: MethodLoggingLevel.INFO,
            dataTraceEnabled: false,
            throttlingBurstLimit: 5,
            throttlingRateLimit: 10
          }
        }
      }
    });

    const instancesResource = api.root.addResource("instances");
    const instanceStateResource = instancesResource
      .addResource("{id}")
      .addResource("state")
      .addResource("{state}");

    const options: LambdaIntegrationOptions = {
      proxy: true,
      allowTestInvoke: true
    };
    const getInstancesMethod = instancesResource.addMethod("GET",
      new LambdaIntegration(listInstancesLambdaAlias, options),
      { operationName: "ListInstances" });
    const putInstanceStateMethod = instanceStateResource.addMethod("PUT",
      new LambdaIntegration(startStopInstancesLambdaAlias, options),
      { operationName: "StartStopInstance" });

    addCorsOptions(instancesResource, props.domain, "GET");
    addCorsOptions(instanceStateResource, props.domain, "PUT");

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

function enableSnapStart(lambda: LambdaFunction) {
  (lambda.node.defaultChild as CfnFunction).addPropertyOverride('SnapStart', {
    ApplyOn: 'PublishedVersions',
  });
}
