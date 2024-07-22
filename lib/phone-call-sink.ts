import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface PhoneCallSinkConstructProps {
  readonly nodeJSFunctionProps: any;
  readonly sinkResource: cdk.aws_apigateway.IResource;
  readonly twilioSecretname: string;
}

export class PhoneCallSinkConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: PhoneCallSinkConstructProps
  ) {
    super(scope, id);

    const PhoneCallSinkFunction = new cdk.aws_lambda.Function(
      this,
      "PhoneCallSinkFunction",
      {
        handler: "phone-call-sink.handler",
        code: cdk.aws_lambda.Code.fromAsset("lambda"),
        ...props.nodeJSFunctionProps,
      }
    );

    const twilioSecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      "TwilioSecret",
      props.twilioSecretname
    );
    twilioSecret.grantRead(PhoneCallSinkFunction);

    PhoneCallSinkFunction.addEnvironment(
      "TWILIO_SECRET_NAME",
      props.twilioSecretname
    );

    props.sinkResource
      .addResource("phonecall")
      .addMethod(
        "POST",
        new cdk.aws_apigateway.LambdaIntegration(PhoneCallSinkFunction)
      );
  }
}
