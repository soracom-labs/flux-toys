import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SoracomAirSmsSinkConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sinkResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
}

export class SoracomAirSmsSinkConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracomAirSmsSinkConstructProps
  ) {
    super(scope, id);

    const SoracomAirSmsSinkFunction = new cdk.aws_lambda.Function(
      this,
      "SoracomAirSmsSinkFunction",
      {
        handler: "soracom-air-sms-sink.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        environment: {
          SORACOM_SECRET_NAME: props.soracomSecret.secretName,
        },
        ...props.nodeJSFunctionProps,
      }
    );

    props.soracomSecret.grantRead(SoracomAirSmsSinkFunction);

    const SoracomAirSmsSinkResource =
      props.sinkResource.addResource("soracom_air_sms");
    SoracomAirSmsSinkResource.addMethod(
      "POST",
      new cdk.aws_apigateway.LambdaIntegration(SoracomAirSmsSinkFunction)
    );
  }
}
