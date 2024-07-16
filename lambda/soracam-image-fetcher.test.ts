import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { handler, setGetSoracomClient } from "./soracam-image-fetcher"; // Lambda関数が定義されているファイルをインポート
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
      "device is required in querystring parameters"
    );
  });

  it("should successfully process the request", async () => {
    const event = { queryStringParameters: { device: "testDevice" } };

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

    soracomHttpClientMock
      .onPost(
        "https://api.soracom.io/v1/sora_cam/devices/testDevice/images/exports"
      )
      .reply(200, {
        exportId: "testExportId",
      });

    soracomHttpClientMock
      .onGet(
        "https://api.soracom.io/v1/sora_cam/devices/testDevice/images/exports/testExportId"
      )
      .reply(200, {
        status: "completed",
        url: "https://example.com/test.jpg",
      });

    axiosMock
      .onGet("https://example.com/test.jpg", { responseType: "arraybuffer" })
      .reply(200, new ArrayBuffer(8));

    soracomHttpClientMock
      .onPut(
        /https:\/\/api.soracom.io\/v1\/files\/private\/test\/path\/testDevice-\d{14}.jpg/
      )
      .reply(201);

    const result = await handler(event);

    expect(result.statusCode).toBe(201);
  });
});
