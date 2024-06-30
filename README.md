# JSReport on AWS (WIP)

This repository provides the necessary resources and deployment scripts to set up JSReport Studio and report generation capabilities using AWS Lambda. The project aims to simplify the deployment process, ensuring that you can quickly get up and running with JSReport on AWS.

This project is inspired by the jsreport documentation, where it is specified how to work with lambdas functions and/or EC2 instances.

After some searching I could not find a project that combined the functionality that exists for AWS, persistence of the template in S3, persistence of the output report in S3, and of course a lambda for the requesting of reports, in this project apart from this also integrated the possibility of having a container is JSReport Studio already configured to create or modify new templates.

**Referencias**

- [JSReport documentation](https://jsreport.net/learn)

- [Template stores](https://jsreport.net/learn/template-stores)

- [Blob storage](https://jsreport.net/learn/blob-storages)

- [Reports extension](https://jsreport.net/learn/reports)

## Features

- Automated deployment of JSReport Studio on AWS
- Serverless report generation using AWS Lambda
- Integration with AWS services such as S3, Lambda, App Rummer, and CloudFormation
- Scalable and cost-efficient architecture

## Requirements

- AWS account with necessary permissions
- AWS CLI configured
- Node.js and npm installed locally

## Getting Started

1. **Clone the repository**:

```sh

git clone https://github.com/eliecer2000/jsreport-aws-app.git
```

2. **Navigate to the project directory**:

```sh

cd jsreport-aws-app
npm install

```

3. **Configure your AWS credentials**:

Make sure your AWS CLI is configured with the necessary permissions to deploy resources.

```sh
aws configure
# or in case of using SSO
aws configure sso
```

4. **Environmental Variables**:

You must create from the sample .env.local file a file containing your project data.

```sh
ENV_REGION_ID=us-east-1
# this will be the aws account number where the project is going to be deployed
ENV_ACCOUNT_ID=000000000000


# this will be the folder where the report tempates will be stored
FS_STORE_AWS_S3_PERSISTENCE_PREFIX=testReports


FS_AUTHENTICATION_ADMIN_USERNAME=admin
FS_AUTHENTICATION_ADMIN_PASSWORD=password

```

5. **Deploy the infrastructure**:

Use the provided CloudFormation template or deployment scripts to set up the infrastructure on AWS.

```sh
# recommend using the flag --require-approval=never
cdk deploy --all --require-approval=never

```

6. **Access JSReport Studio**:

Once the deployment is complete, you can access JSReport Studio through the provided endpoint.

```sh

...
...


✅  DockerJsReportServerStack-xxx

✨  Deployment time: 1.13s

Outputs:
DockerJsReportServerStack-xxx.app-runner-url = https://XXXXXXXXXXX.us-east-1.awsapprunner.com # this is the endpoint
Stack ARN:
arn:aws:cloudformation:us-xxxx-x:XXXXXXXXXXXX:stack/DockerJsReportServerStack-xxx

...
...


```

## Usage

JSReport Studio

Access the JSReport Studio through the deployed endpoint to create and manage your reports.

## Report Generation

Invoke the AWS Lambda function with the required parameters to generate reports dynamically.

## Contributions are welcome!

Please fork this repository and submit pull requests with your improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
