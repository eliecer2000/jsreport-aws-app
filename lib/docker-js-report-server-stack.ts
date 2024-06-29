import { StackProps, Stack, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";
import { CfnAutoScalingConfiguration } from "aws-cdk-lib/aws-apprunner";
import * as path from "path";

export interface DockerJsReportServerStackProps extends StackProps {
  bucketName: string;
}

export class DockerJsReportServerStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: DockerJsReportServerStackProps,
  ) {
    super(scope, id, props);
    const CURRENT_ENVIRONMENT = this.node.tryGetContext("env");

    /*  TODO: To optimize costs, an auto scaling configuration
      will be created with the minimum requirements,
      which must be changed manually after deployment.
    */

    new CfnAutoScalingConfiguration(
      this,
      "JsReportServerAutoScalingConf",
      /* all optional props */ {
        autoScalingConfigurationName: "JsReportServerAutoScalingConf",
        maxConcurrency: 1,
        maxSize: 1,
        minSize: 1,
      },
    );

    const asset = new DockerImageAsset(this, "DockerJsReportServerImage", {
      assetName: `js-report-server-image-${CURRENT_ENVIRONMENT}`,
      directory: path.join(__dirname, "../", "ImageServer"),
      invalidation: {
        buildArgs: false,
      },
    });
    const IAMAppRunner = new iam.Role(this, "IAMAppRunner", {
      roleName: `DockerJsReportServerIAMAppRunner-${CURRENT_ENVIRONMENT}`,
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });
    IAMAppRunner.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
        ],
        resources: [
          `arn:aws:apprunner:${this.region}:${this.account}:service/js-report-server-service-${CURRENT_ENVIRONMENT}/*`,
        ],
      }),
    );

    const IAMTaskAppRunner = new iam.Role(this, "IAMTaskAppRunner", {
      roleName: `DockerJsReportServerIAMTaskAppRunner-${CURRENT_ENVIRONMENT}`,
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });
    IAMTaskAppRunner.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:*"],
        resources: [`arn:aws:s3:::${props?.bucketName}`],
      }),
    );

    IAMTaskAppRunner.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sqs:*"],
        resources: [
          `arn:aws:sqs:${this.region}:${this.account}:jsreport-lock.fifo`,
        ],
      }),
    );

    const service = new apprunner.Service(this, "DockerJsReportServerService", {
      serviceName: `js-report-server-service-${CURRENT_ENVIRONMENT}`,
      autoDeploymentsEnabled: true,
      source: apprunner.Source.fromAsset({
        imageConfiguration: {
          port: 5488,
          environmentVariables: {
            extensions_awsS3Storage_bucket: props?.bucketName || "",
            extensions_fsStoreAwsS3Persistence_bucket: props?.bucketName || "",
            extensions_fsStoreAwsS3Persistence_prefix:
              process.env.FS_STORE_AWS_S3_PERSISTENCE_PREFIX || "samples",
          },
        },
        asset: asset,
      }),
      instanceRole: IAMTaskAppRunner,
      accessRole: IAMAppRunner,
    });

    new CfnOutput(this, "apprunner-url", {
      exportName: "apprunner-url",
      value: service.serviceUrl,
      description: "URL to access service",
    });
  }
}
