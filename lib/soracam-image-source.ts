import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SoracamImageSourceConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sourceResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
  readonly harvestFilesPath: string;
}

export class SoracamImageSourceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracamImageSourceConstructProps
  ) {
    super(scope, id);

    const SoracamImageSourceFunction = new cdk.aws_lambda.Function(
      this,
      "soracamImageSourceFunction",
      {
        handler: "soracam-image-source.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        environment: {
          SORACOM_SECRET_NAME: props.soracomSecret.secretName,
          HARVEST_FILES_PATH: props.harvestFilesPath,
        },
        ...props.nodeJSFunctionProps,
      }
    );

    props.soracomSecret.grantRead(SoracamImageSourceFunction);

    const sourceResource = props.sourceResource;
    const soracamImageSourceResource =
      sourceResource.addResource("soracam_image");
    soracamImageSourceResource.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(SoracamImageSourceFunction)
    );
  }
}
