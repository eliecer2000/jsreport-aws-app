import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Architecture,
  DockerImageFunction,
  DockerImageCode,
} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";

export interface LambdaJsReportServerStackProps extends StackProps {
  bucketName: string;
}
export class LambdaJsReportServerStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: LambdaJsReportServerStackProps,
  ) {
    super(scope, id, props);
    const CURRENT_ENVIRONMENT = this.node.tryGetContext("env");

    const IAMLambda = new iam.Role(this, "IAMAppRunner", {
      roleName: `LambdaJsReportServerRole-${CURRENT_ENVIRONMENT}`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    IAMLambda.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:*"],
        resources: [
          `arn:aws:s3:::${props?.bucketName}`,
          `arn:aws:s3:::${props?.bucketName}/*`,
        ],
      }),
    );

    IAMLambda.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sqs:*"],
        resources: [
          `arn:aws:sqs:${this.region}:${this.account}:jsreport*`,
          `arn:aws:sqs:${this.region}:${this.account}:jsreport*/*`,
        ],
      }),
    );

    IAMLambda.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: [
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/JsReportServerLambda-${CURRENT_ENVIRONMENT}:log-stream:*`,
        ],
      }),
    );

    new DockerImageFunction(
      this,
      `JsReportServerLambda-${CURRENT_ENVIRONMENT}`,
      {
        functionName: `JsReportServerLambda-${CURRENT_ENVIRONMENT}`,
        code: DockerImageCode.fromImageAsset(
          path.join(__dirname, "./../functions/JsReportServerLambda/src"),
          {
            cmd: ["index.handler"],
            entrypoint: ["/lambda-entrypoint.sh"],
          },
        ),
        timeout: Duration.minutes(15),
        memorySize: 1024,
        architecture: Architecture.X86_64,
        environment: {
          extensions_awsS3Storage_bucket: props?.bucketName || "",
          extensions_fsStoreAwsS3Persistence_bucket: props?.bucketName || "",
          extensions_fsStoreAwsS3Persistence_prefix:
            process.env.FS_STORE_AWS_S3_PERSISTENCE_PREFIX || "samples",
        },
        role: IAMLambda,
      },
    );
  }
}
