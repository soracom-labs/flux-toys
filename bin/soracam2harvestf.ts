#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import {
  Soracam2HarvestfStack,
  Soracam2HarvestfStackProps,
} from "../lib/soracam2harvestf-stack";

const app = new cdk.App();
const props: Soracam2HarvestfStackProps = {
  soracomAuthKeyId: app.node.tryGetContext("soracomAuthKeyId"),
  soracomAuthKey: app.node.tryGetContext("soracomAuthKey"),
  harvestFilesPath: app.node.tryGetContext("harvestFilesPath"),
};

new Soracam2HarvestfStack(app, "Soracam2HarvestfStack", props);
