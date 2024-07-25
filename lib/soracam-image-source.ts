import * as cdk from "aws-cdk-lib";
import { BaseConstruct } from "./base-construct";
import { Construct } from "constructs";

export interface SoracamImageSourceConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sourceResource: cdk.aws_apigateway.IResource;
  readonly soracomSecret: cdk.aws_secretsmanager.Secret;
  readonly harvestFilesPath: string;
}

export class SoracamImageSourceConstruct extends BaseConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: SoracamImageSourceConstructProps
  ) {
    super(scope, id);
    const functionId = this.functionName();
    const SoracamImageSourceFunction = new cdk.aws_lambda.Function(
      this,
      functionId,
      {
        handler: "soracam-image-source.handler",
        functionName: functionId,
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
