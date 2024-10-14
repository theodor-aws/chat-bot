# Simple Chat-Bot for Bedrock

## Table of contents
- [Overview](#overview)
- [Deployment](#deployment)
- [Security](#security)
- [Supported AWS Regions](#supported-aws-regions)
- [Quotas](#quotas)
- [Clean up](#clean-up)

## Overview

This sample offers a simple chat-based user interface to Bedrock Models that support Converse API, including Antropic Claude 3 Models. The project uses the [Amazon Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html).

## Deployment

#### Environment setup
First, verify that your environment satisfies the following prerequisites:

You have:

1. An [AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. `AdministratorAccess` policy granted to your AWS account (for production, we recommend restricting access as needed)
3. Please make sure, that you have activated access to Claude 3 Haiku Model in **us-west-2** region in your account: Switch **us-west-2** region -> Bedrock -> [Model Access @ us-west-2](https://us-west-2.console.aws.amazon.com/bedrock/home?region=us-west-2#/modelaccess)

#### Deploy with CloudShell

1. Login to AWS Console
2. Switch to **us-west-2** (Oregon) region
3. Open CloudShell (use a button on the top-side bar of the console)
4. Run the following commands in CloudShell:

```shell
git clone https://github.com/theodor-aws/chat-bot
cd chat-bot
chmod +x install.sh
./install.sh
```

You are all set for deployment; you can now jump to [deployment](#deployment).

### Deployment

**Step 1.** Clone the repository
```bash
git clone https://github.com/theodor-aws/chat-bot
```
**Step 2.** Move into the cloned repository
```bash
cd chat-bot
```
**Step 3.** Run the installation script
```bash
chmod +x install.sh
./install.sh
```

**Step 5.**  Once deployed, take note of the `UserInterfaceDomainName` that use can use to access the app.
```bash
...
Outputs:
ChatBot.UserInterfaceDomainName = https://dxxxxxxxxxxxxx.cloudfront.net
ChatBot.CognitoUserPool = https://xxxxx.console.aws.amazon.com/cognito/v2/
...
```

**Step 6.** Add your chat-bot users. Open the generated **CognitoUserPool** Link from outputs above i.e. `https://xxxxx.console.aws.amazon.com/cognito/v2/idp/user-pools/xxxxx_XXXXX/users?region=xxxxx`

**Step 7.** Add a user that will be used to log into the web interface.

**Step 8.** Open the `User Interface` Url for the outputs above, i.e. `dxxxxxxxxxxxxx.cloudfront.net`.

**Step 9.** Login with the user created in **Step 7** and follow the instructions.

### Deployment Errors

#### Could not unzip uploaded file...

If you encounter the error "*Could not unzip uploaded file. Please check your file, then try to upload again. (Service: Lambda, Status Code: 400*" during deployment, a possible reason could be that you ran cdk bootstrap with an older CDK version. Please delete the ``CDKToolkit`` stack and install again.

## Security

When you build systems on AWS infrastructure, security responsibilities are shared between you and AWS. This [shared responsibility](http://aws.amazon.com/compliance/shared-responsibility-model/) model reduces your operational burden because AWS operates, manages, and controls the components including the host operating system, virtualization layer, and physical security of the facilities in which the services operate. For more information about AWS security, visit [AWS Cloud Security](http://aws.amazon.com/security/).

## Supported AWS Regions

This solution uses multiple AWS services, which might not be currently available in all AWS Regions. You must launch this construct in an AWS Region where these services are available. For the most current availability of AWS services by Region, see the [AWS Regional Services List](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/).

## Quotas

Service quotas, also referred to as limits, are the maximum number of service resources or operations for your AWS account.

Make sure you have sufficient quota for each of the services implemented in this solution and the associated instance types. For more information, refer to [AWS service quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html).

To view the service quotas for all AWS services in the documentation without switching pages, view the information in the [Service endpoints and quotas](https://docs.aws.amazon.com/general/latest/gr/aws-general.pdf#aws-service-information) page in the PDF instead.

## Clean up

You can remove the stacks and all the associated resources created in your AWS account by running the following command:
```bash
cd chat-bot
pnpx cdk destroy
```
After deleting your stack, do not forget to delete the logs and content uploaded to the account.