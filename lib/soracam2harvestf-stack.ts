import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface Soracam2HarvestfStackProps extends cdk.StackProps {
  readonly soracomAuthKeyId?: string;
  readonly soracomAuthKey?: string;
  readonly harvestFilesPath: string;
}

export class Soracam2HarvestfStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Soracam2HarvestfStackProps) {
    super(scope, id, props);

    const nodeJSFunctionProps = {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(60),
      environment: {
        SORACOM_AUTH_KEY_ID: props.soracomAuthKeyId!,
        HARVEST_FILES_PATH: props.harvestFilesPath,
      },
    };

    const functionsReferenceArray: cdk.aws_lambda.Function[] = [];

    const SoracamImageFetcherFunction = new cdk.aws_lambda.Function(
      this,
      "SoracamImageFetcherFunction",
      {
        handler: "soracam-image-fetcher.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...nodeJSFunctionProps,
      }
    );
    functionsReferenceArray.push(SoracamImageFetcherFunction);

    const HarvestDecoratorFunction = new cdk.aws_lambda.Function(
      this,
      "HarvestDecoratorFunction",
      {
        handler: "harvest-decorator.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...nodeJSFunctionProps,
      }
    );
    functionsReferenceArray.push(HarvestDecoratorFunction);

    const secret = new cdk.aws_secretsmanager.Secret(
      this,
      "Soracam2HarvestfSecret",
      {
        secretName: "Soracam2HarvestfSecret",
        secretStringValue: new cdk.SecretValue(
          JSON.stringify({
            soracomAuthKeyId: props.soracomAuthKeyId,
            soracomAuthKey: props.soracomAuthKey,
          })
        ),
      }
    );

    functionsReferenceArray.forEach((fn: cdk.aws_lambda.Function) => {
      secret.grantRead(fn);
      fn.addEnvironment("SECRET_NAME", secret.secretName);
    });

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

    const fetcherResource = api.root.addResource("fetcher");

    const soracamImageResource = fetcherResource.addResource("soracam_image");
    soracamImageResource.addMethod(
      "POST",
      new cdk.aws_apigateway.LambdaIntegration(SoracamImageFetcherFunction)
    );

    const decoratorResource = api.root.addResource("decorator");
    const harvestDocoratorResource = decoratorResource.addResource("harvest");
    harvestDocoratorResource.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(HarvestDecoratorFunction)
    );
  }
}
