import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StackConfig } from "./types";
import { Playground } from "./playground";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

const lambdaArchitecture = lambda.Architecture.X86_64;

export interface ChatBotStackProps extends cdk.StackProps {

    config: StackConfig;
}

export class ChatBotStack extends cdk.Stack {

    constructor(
        scope   : Construct,
        id      : string,
        props   : ChatBotStackProps
    ) {
        super(scope, id, { description: "ChatBot", ...props, });

        const bedrockRegion = props.config.bedrockRegion ?? cdk.Aws.REGION;
        const bedrockModel  = props.config.bedrockModel;
        const powerToolsLayerVersion = "72";
        const powerToolsLayer = lambda.LayerVersion.fromLayerVersionArn(
            this,
           "PowertoolsLayer",
            lambdaArchitecture === lambda.Architecture.X86_64
                ? `arn:${cdk.Aws.PARTITION}:lambda:${cdk.Aws.REGION}:017000801446:layer:AWSLambdaPowertoolsPythonV2:${powerToolsLayerVersion}`
                : `arn:${cdk.Aws.PARTITION}:lambda:${cdk.Aws.REGION}:017000801446:layer:AWSLambdaPowertoolsPythonV2-Arm64:${powerToolsLayerVersion}`
        );

        const apiKeysSecret = new secretsmanager.Secret(this, "ApiKeysSecret", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            secretObjectValue: {},
        });

        const playground = new Playground(this, "Playground", {
            config: props.config,
            bedrockRegion,
            bedrockModel,
            lambdaArchitecture,
            powerToolsLayer
        });

        new cdk.CfnOutput(this, "CognitoUserPool", {
            value: `https://${cdk.Stack.of(this).region
                }.console.aws.amazon.com/cognito/v2/idp/user-pools/${playground.userPool.userPoolId
                }/users?region=${cdk.Stack.of(this).region}`,
        });

        new cdk.CfnOutput(this, "UserInterfaceDomainName", {
            value: `https://${playground.distribution.distributionDomainName}`,
        });

        new cdk.CfnOutput(this, "ApiKeysSecretName", {
            value: apiKeysSecret.secretName,
        });
    }
}