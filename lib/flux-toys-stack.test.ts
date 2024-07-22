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
    deploySoracamImageSource: true,
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

  // Secrets Managerのシークレットが作成されていることを確認
  template.hasResourceProperties("AWS::SecretsManager::Secret", {
    Name: "SoracomAPICredentials",
  });
});
