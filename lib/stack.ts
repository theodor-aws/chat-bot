import * as cdk             from "aws-cdk-lib"
import * as lambda          from "aws-cdk-lib/aws-lambda"
import * as secretsmanager  from "aws-cdk-lib/aws-secretsmanager"
import { Construct        } from "constructs"
import { StackConfig      } from "./types"
import { Playground       } from "./playground"

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

        const bedrockRegion = props.config.bedrockRegion || props.env?.region || cdk.Aws.REGION;
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

        new cdk.CfnOutput(this, "PublicURL", {
            value: `https://${playground.distribution.distributionDomainName}`,
        });

        new cdk.CfnOutput(this, "UserPool", {
            value: `https://${cdk.Stack.of(this).region
                }.console.aws.amazon.com/cognito/v2/idp/user-pools/${playground.userPool.userPoolId
                }/users?region=${cdk.Stack.of(this).region}`,
        });

        new cdk.CfnOutput(this, "MessageHandler", {

            value: `https://${cdk.Stack.of(this).region
                }.console.aws.amazon.com/lambda/home?region=${cdk.Stack.of(this).region
                }#/functions/${playground.messageHandler.functionName
                }?tab=configure`,
        });

        /*
        new cdk.CfnOutput(this, "ApiKeysSecretName", {
            value: apiKeysSecret.secretName,
        });
        */
    }
}