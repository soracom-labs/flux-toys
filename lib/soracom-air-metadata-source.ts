import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SoracomAirMetadataSourceConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sourceResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
}

export class SoracomAirMetadataSourceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracomAirMetadataSourceConstructProps
  ) {
    super(scope, id);

    const SoracomAirMetadataSourceFunction = new cdk.aws_lambda.Function(
      this,
      "SoracomAirMetadataSourceFunction",
      {
        handler: "soracom-air-metadata-source.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        environment: {
          SORACOM_SECRET_NAME: props.soracomSecret.secretName,
        },
        ...props.nodeJSFunctionProps,
      }
    );

    props.soracomSecret.grantRead(SoracomAirMetadataSourceFunction);

    const sourceResource = props.sourceResource;
    const SoracomAirMetadataSourceResource = sourceResource.addResource(
      "soracom_air_metadata"
    );
    SoracomAirMetadataSourceResource.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(SoracomAirMetadataSourceFunction)
    );
  }
}
