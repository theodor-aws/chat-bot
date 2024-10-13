#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { ChatBotStack   } from "../lib/stack"
import { settings       } from "../config/settings"

const app = new cdk.App();

new ChatBotStack(app, settings.stack_name, {

    env: {

        region          : settings.deployment_region
    },
    
    config: {

        bedrockRegion   : settings.bedrock_region,
        bedrockModel    : settings.bedrock_model,
    }
});