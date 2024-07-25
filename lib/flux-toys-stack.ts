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
  private addPrefixToId(id: string): string {
    return `${this.stackName}-${id}`;
  }

  constructor(scope: Construct, id: string, props: FluxToysStackProps) {
    super(scope, id, props);

    const api = new cdk.aws_apigateway.RestApi(
      this,
      this.addPrefixToId("flux-toys-api"),
      {
        defaultMethodOptions: {
          apiKeyRequired: true,
        },
        deployOptions: {
          stageName: "v1",
        },
      }
    );

    const apiKey = api.addApiKey(this.addPrefixToId("flux-toys-api-key"), {
      apiKeyName: this.addPrefixToId("flux-toys-api-key"),
    });
    const plan = api.addUsagePlan(this.addPrefixToId("flux-toys-usage-plan"), {
      name: this.addPrefixToId("flux-toys-usage-plan"),
    });
    plan.addApiKey(apiKey);
    plan.addApiStage({ stage: api.deploymentStage });
    const sourceResource = api.root.addResource("source");
    const sinkResource = api.root.addResource("sink");

    const soracomSecretName = this.addPrefixToId("soracom-api-credentials");
    const soracomSecret = new cdk.aws_secretsmanager.Secret(
      this,
      this.addPrefixToId("soracom-api-credentials"),
      {
        secretName: soracomSecretName,
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

      new SoracamImageSourceConstruct(
        this,
        this.addPrefixToId("soracam-image-source"),
        {
          nodeJSFunctionProps,
          sourceResource,
          soracomSecret,
          harvestFilesPath: props.harvestFilesPath,
        }
      );
    }

    if (props.deploySoracomAirMetadataSource) {
      new SoracomAirMetadataSourceConstruct(
        this,
        this.addPrefixToId("soracom-air-metadata-source"),
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
        this.addPrefixToId("soracom-air-metadata-sink"),
        {
          nodeJSFunctionProps,
          sinkResource,
          soracomSecret,
        }
      );
    }

    if (props.deploySoracomAirSmsSink) {
      new SoracomAirSmsSinkConstruct(
        this,
        this.addPrefixToId("soracom-air-sms-sink"),
        {
          nodeJSFunctionProps,
          sinkResource,
          soracomSecret,
        }
      );
    }

    if (props.deploySoracomHarvestDataSource) {
      new SoracomHarvestDataSourceConstruct(
        this,
        this.addPrefixToId("soracom-harvest-data-source"),
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
      new PhoneCallSinkConstruct(this, this.addPrefixToId("phone-call-sink"), {
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
      new GoogleSheetsSinkConstruct(
        this,
        this.addPrefixToId("google-sheets-sink"),
        {
          nodeJSFunctionProps,
          sinkResource,
          googleSecretname: props.googleSecretname,
        }
      );
    }
  }
}
