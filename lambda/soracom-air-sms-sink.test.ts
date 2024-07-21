import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { handler, setGetSoracomClient } from "./soracom-air-sms-sink";
import { mockClient } from "aws-sdk-client-mock";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { SoracomClient } from "./lib/soracom-client";

const secretsManagerMock = mockClient(SecretsManagerClient);

describe("Lambda handler", () => {
  let axiosMock: MockAdapter;
  let soracomHttpClientMock: MockAdapter;
  let soracomClient: SoracomClient;

  beforeEach(() => {
    axiosMock = new MockAdapter(axios);

    // Mocking SoracomClient's internal httpClient
    soracomClient = new SoracomClient("fakeAuthKeyId", "fakeAuthKey", "jp");
    soracomHttpClientMock = new MockAdapter(soracomClient["httpClient"]);

    setGetSoracomClient(async () => soracomClient);
  });

  afterEach(() => {
    axiosMock.reset();
    soracomHttpClientMock.reset();
    secretsManagerMock.reset();
  });

  it("should return 400 if sim_id is not provided", async () => {
    const event = { queryStringParameters: {} };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      "sim_id is required in querystring parameters"
    );
  });

  it("should return 400 if body is not present", async () => {
    const event = {
      queryStringParameters: {
        sim_id: "testSimId",
      },
    };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("body is required.");
  });

  it("should return 400 if body does not contain text", async () => {
    const event = {
      queryStringParameters: {
        sim_id: "testSimId",
      },
      body: JSON.stringify({
        wrong_parameter: "testText",
      }),
    };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("body must contains text.");
  });

  it("should successfully process the request", async () => {
    const event = {
      queryStringParameters: {
        sim_id: "testSimId",
      },
      body: JSON.stringify({
        text: "testText",
      }),
    };
    // Mock the Secrets Manager response
    secretsManagerMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify({
        soracomAuthKeyId: "fakeAuthKeyId",
        soracomAuthKey: "fakeAuthKey",
      }),
    });

    axiosMock.onPost("https://api.soracom.io/v1/auth").reply(200, {
      apiKey: "testApiKey",
      token: "testToken",
      operatorId: "testOperatorId",
    });

    soracomHttpClientMock
      .onPost("https://api.soracom.io/v1/sims/testSimId/send_sms")
      .reply(200, {
        messageId: "testMessageId",
      });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      messageId: "testMessageId",
    });
  });
});
