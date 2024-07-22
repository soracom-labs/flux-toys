import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SoracamImageSourceConstruct } from "./soracam-image-source";
import { SoracomAirMetadataSourceConstruct } from "./soracom-air-metadata-source";
import { SoracomAirMetadataSinkConstruct } from "./soracom-air-metadata-sink";
import { SoracomHarvestDataSourceConstruct } from "./soracom-harvest-data-source";
import { SoracomAirSmsSinkConstruct } from "./soracom-air-sms-sink";
import { PhoneCallSinkConstruct } from "./phone-call-sink";
import { GoogleSheetsSinkConstruct } from "./google-sheets-sink";

export interface FluxToysStackProps extends cdk.StackProps {
  readonly deploySoracomHarvestDataSource?: boolean;
  readonly deploySoracomAirMetadataSource?: boolean;
  readonly deploySoracomAirMetadataSink?: boolean;
  readonly deploySoracomAirSmsSink?: boolean;
  readonly deploySoracamImageSource?: boolean;
  readonly deployPhoneCallSink?: boolean;
  readonly deployGoogleSheetsSink?: boolean;
  readonly soracomAuthKeyId: string;
  readonly soracomAuthKey: string;
  readonly harvestFilesPath?: string;
  readonly googleSecretname?: string;
  readonly twilioSecretname?: string;
}

export class FluxToysStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FluxToysStackProps) {
    super(scope, id, props);

    console.log("props", props);

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

    const nodeJSFunctionProps = {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(60),
    };

    if (props.deploySoracamImageSource) {
      if (!props.harvestFilesPath) {
        throw new Error(
          "harvestFilesPath is required for SoracamImageSourceConstruct"
        );
      }

      new SoracamImageSourceConstruct(this, "SoracamImageSourceConstruct", {
        nodeJSFunctionProps,
        sourceResource,
        soracomSecret,
        harvestFilesPath: props.harvestFilesPath,
      });
    }

    if (props.deploySoracomAirMetadataSource) {
      new SoracomAirMetadataSourceConstruct(
        this,
        "SoracomAirMetadataSourceConstruct",
        {
          nodeJSFunctionProps,
          sourceResource,
          soracomSecret,
        }
      );
    }

    if (props.deploySoracomAirMetadataSink) {
      new SoracomAirMetadataSinkConstruct(
        this,
        "SoracomAirMetadataSinkConstruct",
        {
          nodeJSFunctionProps,
          sinkResource,
          soracomSecret,
        }
      );
    }

    if (props.deploySoracomAirSmsSink) {
      new SoracomAirSmsSinkConstruct(this, "SoracomAirSmsSinkConstruct", {
        nodeJSFunctionProps,
        sinkResource,
        soracomSecret,
      });
    }

    if (props.deploySoracomHarvestDataSource) {
      new SoracomHarvestDataSourceConstruct(
        this,
        "SoracomHarvestDataSourceConstruct",
        {
          nodeJSFunctionProps,
          sourceResource,
          soracomSecret,
        }
      );
    }

    if (props.deployPhoneCallSink) {
      if (!props.twilioSecretname) {
        throw new Error(
          "twilioSecretname is required for PhoneCallSinkConstruct"
        );
      }
      new PhoneCallSinkConstruct(this, "PhoneCallSinkConstruct", {
        nodeJSFunctionProps,
        sinkResource,
        twilioSecretname: props.twilioSecretname,
      });
    }

    if (props.deployGoogleSheetsSink) {
      if (!props.googleSecretname) {
        throw new Error(
          "googleSecretname is required for GoogleSheetsSinkConstruct"
        );
      }
      new GoogleSheetsSinkConstruct(this, "GoogleSheetsSinkConstruct", {
        nodeJSFunctionProps,
        sinkResource,
        googleSecretname: props.googleSecretname,
      });
    }
  }
}
