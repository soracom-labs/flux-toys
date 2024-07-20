import { handler, setGetGoogleSheetsClient } from "./google-sheets-sink"; // Lambda関数が定義されているファイルをインポート
import { mockClient } from "aws-sdk-client-mock";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { GoogleSheetsClient } from "./lib/google-sheets-client"; // GoogleSheetsClientのファイルをインポート

const secretsManagerMock = mockClient(SecretsManagerClient);

describe("Lambda handler", () => {
  let googleSheetsClient: GoogleSheetsClient;
  let googleSheetsAppendMock: jest.Mock;

  beforeAll(() => {
    // 環境変数を設定
    process.env.GOOGLE_SECRET_NAME = "testGoogleSecret";
  });

  beforeEach(() => {
    googleSheetsAppendMock = jest.fn().mockResolvedValue({ success: true });
    googleSheetsClient = new GoogleSheetsClient("dummy-path");
    googleSheetsClient.append = googleSheetsAppendMock;

    // Mocking getGoogleSheetsClient to return the mocked googleSheetsClient
    setGetGoogleSheetsClient(async () => googleSheetsClient);
  });

  afterEach(() => {
    secretsManagerMock.reset();
    jest.clearAllMocks();
  });

  it("should return 400 if sheet_id or sheet_name is not provided", async () => {
    const event = { queryStringParameters: {} };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      "sheet_id and sheet_name is required in querystring parameters"
    );
  });

  it("should return 400 if body is not provided", async () => {
    const event = {
      queryStringParameters: {
        sheet_id: "testSheetId",
        sheet_name: "testSheetName",
      },
    };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("body is required");
  });

  it("should return 400 if body is not an array", async () => {
    const event = {
      queryStringParameters: {
        sheet_id: "testSheetId",
        sheet_name: "testSheetName",
      },
      body: JSON.stringify({ key: "value" }),
    };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("body must be an array");
  });

  it("should successfully append data to Google Sheet", async () => {
    const event = {
      queryStringParameters: {
        sheet_id: "testSheetId",
        sheet_name: "testSheetName",
      },
      body: JSON.stringify([["data1", "data2"]]),
    };

    // Mock the Secrets Manager response
    secretsManagerMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify({ key: "value" }),
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ success: true });
    expect(googleSheetsAppendMock).toHaveBeenCalledWith(
      "testSheetId",
      "testSheetName",
      "A1",
      [["data1", "data2"]]
    );
  });
});
