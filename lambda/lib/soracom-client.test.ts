import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { SoracomClient } from "./soracom-client";

describe("SoracomClient", () => {
  let client: SoracomClient;
  let mock: any;
  let httpClientMock: any;

  beforeEach(() => {
    client = new SoracomClient("fakeAuthKeyId", "fakeAuthKey", "jp");
    mock = new MockAdapter(axios);
    httpClientMock = new MockAdapter(client["httpClient"]);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should authenticate successfully", async () => {
    const mockResponse = {
      apiKey: "testApiKey",
      token: "testToken",
      operatorId: "testOperatorId",
    };

    mock.onPost("https://api.soracom.io/v1/auth").reply(200, mockResponse);

    await client["authenticate"]();

    expect(client["apiKey"]).toBe(mockResponse.apiKey);
    expect(client["token"]).toBe(mockResponse.token);
    expect(client["operatorId"]).toBe(mockResponse.operatorId);
  });

  it("should call checkIfAuthenticated and authenticate if needed", async () => {
    const mockResponse = {
      apiKey: "testApiKey",
      token: "testToken",
      operatorId: "testOperatorId",
    };

    mock.onPost("https://api.soracom.io/v1/auth").reply(200, mockResponse);

    await client["checkIfAuthenticated"]();

    expect(client["apiKey"]).toBe(mockResponse.apiKey);
    expect(client["token"]).toBe(mockResponse.token);
  });

  it("should export SoraCam device recorded image", async () => {
    const mockResponse = { exportId: "exportId" };
    const deviceId = "device123";
    const time = 1622547800;

    client["apiKey"] = "fakeApiKey";
    client["token"] = "fakeToken";

    httpClientMock
      .onPost(
        `https://api.soracom.io/v1/sora_cam/devices/${deviceId}/images/exports`
      )
      .reply(200, mockResponse);

    const result = await client.exportSoraCamDeviceRecordedImage(
      deviceId,
      time
    );

    expect(result).toEqual(mockResponse);
  });

  it("should get exported image", async () => {
    const mockResponse = { status: "completed", url: "http://example.com" };
    const deviceId = "device123";
    const exportId = "exportId";

    client["apiKey"] = "fakeApiKey";
    client["token"] = "fakeToken";

    httpClientMock
      .onGet(
        `https://api.soracom.io/v1/sora_cam/devices/${deviceId}/images/exports/${exportId}`
      )
      .reply(200, mockResponse);

    const result = await client.getSoraCamDeviceExportedImage(
      deviceId,
      exportId
    );

    expect(result).toEqual(mockResponse);
  });

  it("should put file to Soracom Harvest Files", async () => {
    const mockResponse = {};
    const path = "path/to/file";
    const buffer = Buffer.from("test");
    const contentType = "image/jpeg";

    client["apiKey"] = "fakeApiKey";
    client["token"] = "fakeToken";

    httpClientMock
      .onPut(`https://api.soracom.io/v1/files/private/${path}`)
      .reply(200, mockResponse);

    const result = await client.putFile(path, buffer, contentType);

    expect(result).toEqual(mockResponse);
  });

  it("should get data entries from Soracom Harvest Data", async () => {
    const mockResponse = [
      {
        time: 1622547800,
        contentType: "application/json",
        content: '{"temperature": 25.5}',
      },
    ];

    const resourceType = "Subscriber";
    const resourceId = "imsi";
    const from = 1622547800;

    client["apiKey"] = "fakeApiKey";
    client["token"] = "fakeToken";

    httpClientMock
      .onGet(/https:\/\/api\.soracom\.io\/v1\/data\/Subscriber\/imsi/)
      .reply(200, mockResponse);

    const result = await client.getDataEntries(resourceId, resourceType, from);

    expect(result).toEqual(mockResponse);
  });
});
