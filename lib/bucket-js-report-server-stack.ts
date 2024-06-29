import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";

export class BucketJsReportServerStack extends cdk.Stack {
  public readonly bucketName;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const CURRENT_ENVIRONMENT = this.node.tryGetContext("env");

    const bucketResource = new Bucket(this, "BucketJsReportServer", {
      bucketName: `js-report-server-bucket-${this.account}-${CURRENT_ENVIRONMENT}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.bucketName = bucketResource.bucketName;

    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucketName,
    });
  }
}
