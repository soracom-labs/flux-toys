import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SoracomHarvestDataSourceConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sourceResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
}

export class SoracomHarvestDataSourceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracomHarvestDataSourceConstructProps
  ) {
    super(scope, id);

    const SoracomHarvestDataSourceFunction = new cdk.aws_lambda.Function(
      this,
      "SoracomHarvestDataSourceFunction",
      {
        handler: "soracom-harvest-data-source.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        environment: {
          SORACOM_SECRET_NAME: props.soracomSecret.secretName,
        },
        ...props.nodeJSFunctionProps,
      }
    );

    props.soracomSecret.grantRead(SoracomHarvestDataSourceFunction);

    const SoracomHarvestDataSourceRecourse = props.sourceResource.addResource(
      "soracom_harvest_data"
    );
    SoracomHarvestDataSourceRecourse.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(SoracomHarvestDataSourceFunction)
    );
  }
}