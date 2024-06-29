#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";

import { BucketJsReportServerStack } from "../lib/bucket-js-report-server-stack";
import { LambdaJsReportServerStack } from "../lib/lambda-js-report-server-stack";
import { DockerJsReportServerStack } from "../lib/docker-js-report-server-stack";

const CURRENT_ENVIRONMENT = process.env.ENV_SUFFIX_NAME || "dev";

dotenv.config();

const app = new cdk.App({
  autoSynth: true,
  analyticsReporting: true,
  context: {
    env: CURRENT_ENVIRONMENT,
  },
});

/**
 * CDK Environment
 */
const environment = {
  region: process.env.ENV_REGION_ID,
  account: process.env.ENV_ACCOUNT_ID,
};
const defaultStackProps = {
  env: environment,
};

const bucketStack = new BucketJsReportServerStack(
  app,
  `BucketJsReportServerStack-${CURRENT_ENVIRONMENT}`,
  defaultStackProps,
);

const lambdaStack = new LambdaJsReportServerStack(
  app,
  `LambdaJsReportServerStack-${CURRENT_ENVIRONMENT}`,
  { ...defaultStackProps, bucketName: bucketStack.bucketName },
);

lambdaStack.addDependency(bucketStack);

const dockerStack = new DockerJsReportServerStack(
  app,
  `DockerJsReportServerStack-${CURRENT_ENVIRONMENT}`,
  { ...defaultStackProps, bucketName: bucketStack.bucketName },
);

dockerStack.addDependency(bucketStack);

/**
 * cdk.Tags creation
 */
cdk.Tags.of(app).add("user:Application", "js-report");
cdk.Tags.of(app).add("app", "js-report");
