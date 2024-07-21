#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FluxToysStack, FluxToysStackProps } from "../lib/flux-toys-stack";

const app = new cdk.App();
const props: FluxToysStackProps = {
  soracomAuthKeyId: app.node.tryGetContext("soracomAuthKeyId"),
  soracomAuthKey: app.node.tryGetContext("soracomAuthKey"),
  harvestFilesPath: app.node.tryGetContext("harvestFilesPath"),
  googleSecretname: app.node.tryGetContext("googleSecretname"),
  twilioSecretname: app.node.tryGetContext("twilioSecretname"),
};

new FluxToysStack(app, "FluxToysStack", props);
