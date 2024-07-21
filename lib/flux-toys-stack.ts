import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface FluxToysStackProps extends cdk.StackProps {
  readonly soracomAuthKeyId?: string;
  readonly soracomAuthKey?: string;
  readonly harvestFilesPath: string;
  readonly googleSecretname?: string;
}

export class FluxToysStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FluxToysStackProps) {
    super(scope, id, props);

    const api = new cdk.aws_apigateway.RestApi(this, "FluxToysCollection", {
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
      deployOptions: {
        stageName: "v1",
      },
    });

    const apiKey = api.addApiKey("FluxToysCollectionApiKey", {
      apiKeyName: "FluxToysCollectionApiKey",
    });
    const plan = api.addUsagePlan("FluxToysCollectionUsagePlan", {
      name: "FluxToysCollectionUsagePlan",
    });
    plan.addApiKey(apiKey);
    plan.addApiStage({ stage: api.deploymentStage });
    const sourceResource = api.root.addResource("source");
    const sinkResource = api.root.addResource("sink");

    const nodeJSFunctionProps = {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(60),
      environment: {
        HARVEST_FILES_PATH: props.harvestFilesPath,
      },
    };

    const functionsReferenceArray: cdk.aws_lambda.Function[] = [];
    const sourceFunctionReferenceArray: cdk.aws_lambda.Function[] = [];
    const sinkFunctionReferenceArray: cdk.aws_lambda.Function[] = [];

    const SoracamImageSourceFunction = new cdk.aws_lambda.Function(
      this,
      "soracamImageSourceFunction",
      {
        handler: "soracam-image-source.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...nodeJSFunctionProps,
      }
    );
    functionsReferenceArray.push(SoracamImageSourceFunction);

    const SoracomHarvestDataSourceFunction = new cdk.aws_lambda.Function(
      this,
      "SoracomHarvestDataSourceFunction",
      {
        handler: "soracom-harvest-data-source.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...nodeJSFunctionProps,
      }
    );
    functionsReferenceArray.push(SoracomHarvestDataSourceFunction);

    if (props.googleSecretname) {
      const GoogleSheetsSinkFunction = new cdk.aws_lambda.Function(
        this,
        "GoogleSheetsSinkFunction",
        {
          handler: "google-sheets-sink.handler",
          code: cdk.aws_lambda.Code.fromAsset("lambda"),
          ...nodeJSFunctionProps,
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

      sinkResource
        .addResource("googlesheets")
        .addMethod(
          "POST",
          new cdk.aws_apigateway.LambdaIntegration(GoogleSheetsSinkFunction)
        );

      functionsReferenceArray.push(GoogleSheetsSinkFunction);
      sinkFunctionReferenceArray.push(GoogleSheetsSinkFunction);
    }

    const soracomSecret = new cdk.aws_secretsmanager.Secret(
      this,
      "SoracomAPICredentials",
      {
        secretName: "SoracomAPICredentials",
        secretStringValue: new cdk.SecretValue(
          JSON.stringify({
            soracomAuthKeyId: props.soracomAuthKeyId,
            soracomAuthKey: props.soracomAuthKey,
          })
        ),
      }
    );

    functionsReferenceArray.forEach((fn: cdk.aws_lambda.Function) => {
      soracomSecret.grantRead(fn);
      fn.addEnvironment("SECRET_NAME", soracomSecret.secretName);
    });

    const soracamImageResource = sourceResource.addResource("soracam_image");
    soracamImageResource.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(SoracamImageSourceFunction)
    );

    const SoracomHarvestDataSourceRecourse = sourceResource.addResource(
      "soracom_harvest_data"
    );
    SoracomHarvestDataSourceRecourse.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(SoracomHarvestDataSourceFunction)
    );
  }
}
