import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { handler, setGetSoracomClient } from "./soracom-harvest-data-source";
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

  beforeAll(() => {
    process.env.SECRET_NAME = "testSecret";
    process.env.HARVEST_FILES_PATH = "test/path";
  });

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

  it("should return 400 if device is not provided", async () => {
    const event = { queryStringParameters: {} };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      "resource_id and resource_type are required in querystring parameters"
    );
  });

  it("should successfully process the request", async () => {
    const event = {
      queryStringParameters: {
        resource_id: "testDevice",
        resource_type: "device",
      },
    };

    // Mock the Secrets Manager response
    secretsManagerMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify({
        soracomAuthKeyId: "fakeAuthKeyId",
        soracomAuthKey: "fakeAuthKey",
      }),
    });

    // Mock SoracomClient responses
    axiosMock.onPost("https://api.soracom.io/v1/auth").reply(200, {
      apiKey: "testApiKey",
      token: "testToken",
      operatorId: "testOperatorId",
    });

    const mockResult = [
      {
        time: 1622547800,
        contentType: "application/json",
        content: '{"temperature": 25.5}',
      },
    ];

    soracomHttpClientMock
      .onGet(/https:\/\/api\.soracom\.io\/v1\/data.+/)
      .reply(200, mockResult);

    const result = await handler(event);
    expect(JSON.parse(result.body).data).toEqual([
      {
        time: 1622547800,
        content: { temperature: 25.5 },
      },
    ]);
  });
});
