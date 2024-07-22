import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SoracomAirMetadataSinkConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sinkResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
}

export class SoracomAirMetadataSinkConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracomAirMetadataSinkConstructProps
  ) {
    super(scope, id);

    const SoracomAirMetadataSinkFunction = new cdk.aws_lambda.Function(
      this,
      "SoracomAirMetadataSinkFunction",
      {
        handler: "soracom-air-metadata-sink.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        environment: {
          SORACOM_SECRET_NAME: props.soracomSecret.secretName,
        },
        ...props.nodeJSFunctionProps,
      }
    );

    props.soracomSecret.grantRead(SoracomAirMetadataSinkFunction);

    const sinkResource = props.sinkResource;
    const SoracomAirMetadataSinkFunctionResource = sinkResource.addResource(
      "soracom_air_metadata"
    );
    SoracomAirMetadataSinkFunctionResource.addMethod(
      "POST",
      new cdk.aws_apigateway.LambdaIntegration(SoracomAirMetadataSinkFunction)
    );
  }
}
