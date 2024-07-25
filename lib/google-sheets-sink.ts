import * as cdk from "aws-cdk-lib";
import { BaseConstruct } from "./base-construct";
import { Construct } from "constructs";

export interface GoogleSheetsSinkConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sinkResource: cdk.aws_apigateway.IResource;
  readonly googleSecretname: string;
}

export class GoogleSheetsSinkConstruct extends BaseConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: GoogleSheetsSinkConstructProps
  ) {
    super(scope, id);

    const functionId = this.functionName();
    const GoogleSheetsSinkFunction = new cdk.aws_lambda.Function(
      this,
      functionId,
      {
        handler: "google-sheets-sink.handler",
        functionName: functionId,
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...props.nodeJSFunctionProps,
      }
    );

    const googleSecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      this.addPrefixToId("google-secret"),
      props.googleSecretname
    );

    googleSecret.grantRead(GoogleSheetsSinkFunction);

    GoogleSheetsSinkFunction.addEnvironment(
      "GOOGLE_SECRET_NAME",
      googleSecret.secretName
    );

    props.sinkResource
      .addResource("google_sheets")
      .addMethod(
        "POST",
        new cdk.aws_apigateway.LambdaIntegration(GoogleSheetsSinkFunction)
      );
  }
}
