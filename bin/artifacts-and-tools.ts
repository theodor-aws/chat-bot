#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StackConfig } from "../lib/types";
import { ChatBotStack } from "../lib/stack";

const config: StackConfig = {

    bedrockRegion   : "us-east-1",
    bedrockModel    : "us.anthropic.claude-3-haiku-20240307-v1:0",
    playground: {

        enabled: true,
    }
};

const app = new cdk.App();
new ChatBotStack(app, "ArtifactsAndToolsStack", { config });

/*
Bedrock Models:

https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference-support.html

Claude 3.0 Haiku:
us.anthropic.claude-3-haiku-20240307-v1:0

Claude 3.5 Sonnet:
us.anthropic.claude-3-5-sonnet-20240620-v1:0

https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html

AI21 Labs	Jamba-Instruct	1.x	ai21.jamba-instruct-v1:0
AI21 Labs	Jurassic-2 Mid	1.x	ai21.j2-mid-v1
AI21 Labs	Jurassic-2 Ultra	1.x	ai21.j2-ultra-v1
AI21 Labs	Jamba 1.5 Large	1.x	ai21.jamba-1-5-large-v1:0
AI21 Labs	Jamba 1.5 Mini	1.x	ai21.jamba-1-5-mini-v1:0
Amazon	Titan Text G1 - Express	1.x	amazon.titan-text-express-v1
Amazon	Titan Text G1 - Lite	1.x	amazon.titan-text-lite-v1
Amazon	Titan Text Premier	1.x	amazon.titan-text-premier-v1:0
Amazon	Titan Embeddings G1 - Text	1.x	amazon.titan-embed-text-v1
Amazon	Titan Embedding Text v2	1.x	amazon.titan-embed-text-v2:0
Amazon	Titan Multimodal Embeddings G1	1.x	amazon.titan-embed-image-v1
Amazon	Titan Image Generator G1 V1	1.x	amazon.titan-image-generator-v1
Amazon	Titan Image Generator G1 V2	2.x	amazon.titan-image-generator-v2:0
Anthropic	Claude	2.0	anthropic.claude-v2
Anthropic	Claude	2.1	anthropic.claude-v2:1
Anthropic	Claude 3 Sonnet	1.0	anthropic.claude-3-sonnet-20240229-v1:0
Anthropic	Claude 3.5 Sonnet	1.0	anthropic.claude-3-5-sonnet-20240620-v1:0
Anthropic	Claude 3 Haiku	1.0	anthropic.claude-3-haiku-20240307-v1:0
Anthropic	Claude 3 Opus	1.0	anthropic.claude-3-opus-20240229-v1:0
Anthropic	Claude Instant	1.x	anthropic.claude-instant-v1
Cohere	Command	14.x	cohere.command-text-v14
Cohere	Command Light	15.x	cohere.command-light-text-v14
Cohere	Command R	1.x	cohere.command-r-v1:0
Cohere	Command R+	1.x	cohere.command-r-plus-v1:0
Cohere	Embed English	3.x	cohere.embed-english-v3
Cohere	Embed Multilingual	3.x	cohere.embed-multilingual-v3
Meta	Llama 2 Chat 13B	1.x	meta.llama2-13b-chat-v1
Meta	Llama 2 Chat 70B	1.x	meta.llama2-70b-chat-v1
Meta	Llama 3 8B Instruct	1.x	meta.llama3-8b-instruct-v1:0
Meta	Llama 3 70B Instruct	1.x	meta.llama3-70b-instruct-v1:0
Meta	Llama 3.1 8B Instruct	1.x	meta.llama3-1-8b-instruct-v1:0
Meta	Llama 3.1 70B Instruct	1.x	meta.llama3-1-70b-instruct-v1:0
Meta	Llama 3.1 405B Instruct	1.x	meta.llama3-1-405b-instruct-v1:0
Meta	Llama 3.2 1B Instruct	1.x	meta.llama3-2-1b-instruct-v1:0
Meta	Llama 3.2 3B Instruct	1.x	meta.llama3-2-3b-instruct-v1:0
Meta	Llama 3.2 11B Instruct	1.x	meta.llama3-2-11b-instruct-v1:0
Meta	Llama 3.2 90B Instruct	1.x	meta.llama3-2-90b-instruct-v1:0
Mistral AI	Mistral 7B Instruct	0.x	mistral.mistral-7b-instruct-v0:2
Mistral AI	Mixtral 8X7B Instruct	0.x	mistral.mixtral-8x7b-instruct-v0:1
Mistral AI	Mistral Large	1.x	mistral.mistral-large-2402-v1:0
Mistral AI	Mistral Large 2 (24.07)	1.x	mistral.mistral-large-2407-v1:0
Mistral AI	Mistral Small	1.x	mistral.mistral-small-2402-v1:0
Stability AI	Stable Diffusion XL	0.x	stability.stable-diffusion-xl-v0
Stability AI	Stable Diffusion XL	1.x	stability.stable-diffusion-xl-v1
Stability AI	Stable Diffusion 3 Large	1.x	stability.sd3-large-v1:0
Stability AI	Stable Image Ultra	1.x	stability.stable-image-ultra-v1:0
Stability AI	Stability Image Core	1.x	stability.stable-image-core-v1:0
*/