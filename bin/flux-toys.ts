#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { FluxToysStack, FluxToysStackProps } from "../lib/flux-toys-stack";

const app = new cdk.App();
const props: FluxToysStackProps = {
  soracomAuthKeyId: app.node.tryGetContext("soracomAuthKeyId"),
  soracomAuthKey: app.node.tryGetContext("soracomAuthKey"),
  harvestFilesPath: app.node.tryGetContext("harvestFilesPath"),
  googleSecretname: app.node.tryGetContext("googleSecretname"),
  twilioSecretname: app.node.tryGetContext("twilioSecretname"),
  deploySoracomAirMetadataSink: app.node.tryGetContext(
    "deploySoracomAirMetadataSink"
  )
    ? true
    : false,
  deploySoracomAirMetadataSource: app.node.tryGetContext(
    "deploySoracomAirMetadataSource"
  )
    ? true
    : false,
  deploySoracomAirSmsSink: app.node.tryGetContext("deploySoracomAirSmsSink")
    ? true
    : false,
  deploySoracomHarvestDataSource: app.node.tryGetContext(
    "deploySoracomHarvestDataSource"
  )
    ? true
    : false,
  deploySoracamImageSource: app.node.tryGetContext("deploySoracamImageSource")
    ? true
    : false,
  deployGoogleSheetsSink: app.node.tryGetContext("deployGoogleSheetsSink")
    ? true
    : false,
  deployPhoneCallSink: app.node.tryGetContext("deployPhoneCallSink")
    ? true
    : false,
};

const stackName = app.node.tryGetContext("stackName") + "-flux-toys-stack";

console.log("Stack Name: ", stackName);
console.log("Props: ", props);

new FluxToysStack(app, stackName, props);
