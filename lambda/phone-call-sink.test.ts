import { handler, setGetTwilioClient } from "./phone-call-sink";
import { mockClient } from "aws-sdk-client-mock";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { TwilioClient } from "./lib/twilio-client";

const secretsManagerMock = mockClient(SecretsManagerClient);

describe("Lambda handler", () => {
  let twilioClient: TwilioClient;
  let twilioClientMakeCallMock: jest.Mock;

  beforeAll(() => {
    // 環境変数を設定
    process.env.TWILIO_SECRETE_NAME = "testTwilioSecret";
  });

  beforeEach(() => {
    twilioClientMakeCallMock = jest.fn().mockResolvedValue({});
    twilioClient = new TwilioClient(
      "ACfakeAccountSid",
      "fakeAuthToken",
      "fakeFromNumber"
    );
    twilioClient.makeCall = twilioClientMakeCallMock;

    setGetTwilioClient(async () => twilioClient);
  });

  afterEach(() => {
    secretsManagerMock.reset();
    jest.clearAllMocks();
  });

  it("should return 400 if to_number is not provided", async () => {
    const event = { queryStringParameters: {} };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      "to_number is required in querystring parameters"
    );
  });

  it("should return 400 if body is not provided", async () => {
    const event = {
      queryStringParameters: {
        to_number: "testToNumber",
      },
    };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("body is required");
  });

  it("should return 400 if body is not an array", async () => {
    const event = {
      queryStringParameters: {
        to_number: "testToNumber",
      },
      body: JSON.stringify({ key: "value" }),
    };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("text is required in body");
  });

  it("should successfully make a phone call", async () => {
    const event = {
      queryStringParameters: {
        to_number: "testToNumber",
      },
      body: JSON.stringify({ text: "value" }),
    };

    // Mock the Secrets Manager response
    secretsManagerMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify({
        accountSid: "ACfakeAccountSid",
        authToken: "fakeAuthToken",
        fromNumber: "fakeFromNumber",
      }),
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(201);
    expect(twilioClientMakeCallMock).toHaveBeenCalledWith(
      "testToNumber",
      "value"
    );
  });
});
