import * as cdk from "aws-cdk-lib";
import { BaseConstruct } from "./base-construct";
import { Construct } from "constructs";

export interface SoracomAirMetadataSourceConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sourceResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
}

export class SoracomAirMetadataSourceConstruct extends BaseConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracomAirMetadataSourceConstructProps
  ) {
    super(scope, id);

    const functionId = this.functionName();
    const SoracomAirMetadataSourceFunction = new cdk.aws_lambda.Function(
      this,
      functionId,
      {
        handler: "soracom-air-metadata-source.handler",
        functionName: functionId,
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
