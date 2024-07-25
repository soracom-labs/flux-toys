import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { FluxToysStack, FluxToysStackProps } from "../lib/flux-toys-stack";

describe("FluxToysStack", () => {
  const createStack = (props: FluxToysStackProps) => {
    const app = new cdk.App();
    return new FluxToysStack(app, "TestStack", props);
  };

  test("should create SoracamImageSourceConstruct when deploySoracamImageSource is true", () => {
    const props: FluxToysStackProps = {
      soracomAuthKeyId: "testKeyId",
      soracomAuthKey: "testKey",
      harvestFilesPath: "/test/path",
      deploySoracamImageSource: true,
    };

    const stack = createStack(props);
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "soracam-image-source.handler",
      Runtime: "nodejs20.x",
      Environment: {
        Variables: {
          HARVEST_FILES_PATH: "/test/path",
        },
      },
    });
  });

  test("should create PhoneCallSinkConstruct when deployPhoneCallSink is true", () => {
    const props: FluxToysStackProps = {
      soracomAuthKeyId: "testKeyId",
      soracomAuthKey: "testKey",
      twilioSecretname: "testTwilioSecret",
      deployPhoneCallSink: true,
    };

    const stack = createStack(props);
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "phone-call-sink.handler",
      FunctionName: "TestStack-phone-call-sink-function",
      Runtime: "nodejs20.x",
      Environment: {
        Variables: {
          TWILIO_SECRET_NAME: "testTwilioSecret",
        },
      },
    });

    template.hasResourceProperties("AWS::SecretsManager::Secret", {
      Name: "TestStack-soracom-api-credentials",
    });
  });

  test("should create GoogleSheetsSinkConstruct when deployGoogleSheetsSink is true", () => {
    const props: FluxToysStackProps = {
      soracomAuthKeyId: "testKeyId",
      soracomAuthKey: "testKey",
      googleSecretname: "testGoogleSecret",
      deployGoogleSheetsSink: true,
    };

    const stack = createStack(props);
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "google-sheets-sink.handler",
      FunctionName: "TestStack-google-sheets-sink-function",
      Runtime: "nodejs20.x",
      Environment: {
        Variables: {
          GOOGLE_SECRET_NAME: "testGoogleSecret",
        },
      },
    });

    template.hasResourceProperties("AWS::SecretsManager::Secret", {
      Name: "TestStack-soracom-api-credentials",
    });
  });

  test("should throw error when deploySoracamImageSource is true but harvestFilesPath is not provided", () => {
    const props: FluxToysStackProps = {
      soracomAuthKeyId: "testKeyId",
      soracomAuthKey: "testKey",
      deploySoracamImageSource: true,
    };

    expect(() => createStack(props)).toThrow(
      "harvestFilesPath is required for SoracamImageSourceConstruct"
    );
  });

  test("should throw error when deployPhoneCallSink is true but twilioSecretname is not provided", () => {
    const props: FluxToysStackProps = {
      soracomAuthKeyId: "testKeyId",
      soracomAuthKey: "testKey",
      deployPhoneCallSink: true,
    };

    expect(() => createStack(props)).toThrow(
      "twilioSecretname is required for PhoneCallSinkConstruct"
    );
  });
});
