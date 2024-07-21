import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { FluxToysStack, FluxToysStackProps } from "../lib/flux-toys-stack";

test("FluxToys Stack Test", () => {
  const app = new cdk.App();

  const props: FluxToysStackProps = {
    harvestFilesPath: "/test/path",
    soracomAuthKeyId: "testKeyId",
    soracomAuthKey: "testKey",
    googleSecretname: "testGoogleSecret",
  };

  const stack = new FluxToysStack(app, "TestStack", props);

  const template = Template.fromStack(stack);

  // API Gatewayのリソースが作成されていることを確認
  template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    Name: "FluxToysCollection",
  });

  // API Gatewayのキーが作成されていることを確認
  template.hasResourceProperties("AWS::ApiGateway::ApiKey", {
    Name: "FluxToysCollectionApiKey",
  });

  // Lambda関数が作成されていることを確認
  template.hasResourceProperties("AWS::Lambda::Function", {
    Handler: "soracam-image-source.handler",
    Runtime: "nodejs20.x",
    Environment: {
      Variables: {
        HARVEST_FILES_PATH: "/test/path",
      },
    },
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Handler: "soracom-harvest-data-source.handler",
    Runtime: "nodejs20.x",
    Environment: {
      Variables: {
        HARVEST_FILES_PATH: "/test/path",
      },
    },
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Handler: "googlesheets-sink.handler",
    Runtime: "nodejs20.x",
    Environment: {
      Variables: {
        HARVEST_FILES_PATH: "/test/path",
        GOOGLE_SECRET_NAME: "testGoogleSecret",
      },
    },
  });

  // Secrets Managerのシークレットが作成されていることを確認
  template.hasResourceProperties("AWS::SecretsManager::Secret", {
    Name: "SoracomAPICredentials",
  });
});
