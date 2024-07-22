import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface GoogleSheetsSinkConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sinkResource: cdk.aws_apigateway.IResource;
  readonly googleSecretname: string;
}

export class GoogleSheetsSinkConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: GoogleSheetsSinkConstructProps
  ) {
    super(scope, id);

    const GoogleSheetsSinkFunction = new cdk.aws_lambda.Function(
      this,
      "GoogleSheetsSinkFunction",
      {
        handler: "google-sheets-sink.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...props.nodeJSFunctionProps,
      }
    );

    const googleSecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      "GoogleSecret",
      props.googleSecretname
    );

    googleSecret.grantRead(GoogleSheetsSinkFunction);

    GoogleSheetsSinkFunction.addEnvironment(
      "GOOGLE_SECRET_NAME",
      googleSecret.secretName
    );

    props.sinkResource
      .addResource("googlesheets")
      .addMethod(
        "POST",
        new cdk.aws_apigateway.LambdaIntegration(GoogleSheetsSinkFunction)
      );
  }
}
