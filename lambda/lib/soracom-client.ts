import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HarvestRecord } from "./model/soracom-harvest-data";

export class SoracomClient {
  private soracomAuthKeyId: string;
  private soracomAuthKey: string;
  private apiKey: string;
  private token: string;
  private operatorId: string;
  public coverageType: string;
  private httpClient: AxiosInstance;

  constructor(
    soracomAuthKeyId: string,
    soracomAuthKey: string,
    coverageType: string = "g"
  ) {
    this.soracomAuthKeyId = soracomAuthKeyId;
    this.soracomAuthKey = soracomAuthKey;
    this.coverageType = coverageType;
    const httpClient = axios.create();

    httpClient.interceptors.request.use(async (request: any) => {
      await this.checkIfAuthenticated();
      request.url = this.url(request.url);
      request.headers["X-Soracom-API-Key"] = this.apiKey;
      request.headers["X-Soracom-Token"] = this.token;
      return request;
    });

    this.httpClient = httpClient;
  }

  private baseUrl(): string {
    return this.coverageType === "g"
      ? `https://g.api.soracom.io/v1`
      : `https://api.soracom.io/v1`;
  }

  private url(path: string): string {
    return `${this.baseUrl()}${path}`;
  }

  private async authenticate(): Promise<void> {
    const credential = await axios.post(this.url("/auth"), {
      authKeyId: this.soracomAuthKeyId,
      authKey: this.soracomAuthKey,
    });

    this.apiKey = credential.data.apiKey;
    this.token = credential.data.token;
    this.operatorId = credential.data.operatorId;
  }

  private async checkIfAuthenticated(): Promise<void> {
    if (!this.apiKey || !this.token) {
      await this.authenticate();
    }
  }

  /**
   *
   * @param deviceId
   * @param time
   * @returns {Promise<any>}
   */
  public async exportSoraCamDeviceRecordedImage(
    deviceId: string,
    time: number
  ): Promise<any> {
    const result = await this.httpClient.post(
      `/sora_cam/devices/${deviceId}/images/exports`,
      {
        time,
      }
    );
    return result.data;
  }

  /**
   *
   * @param deviceId
   * @param exportId
   * @returns {Promise<any>}
   */
  public async getSoraCamDeviceExportedImage(
    deviceId: string,
    exportId: string
  ): Promise<any> {
    const result = await this.httpClient.get(
      `/sora_cam/devices/${deviceId}/images/exports/${exportId}`
    );
    return result.data;
  }

  /**
   *
   * @param deviceId
   * @param exportId
   * @returns {Promise<any>}
   */
  public async putFile(
    path: string,
    data: Buffer,
    contentType: string
  ): Promise<void> {
    const response = await this.httpClient.put(`/files/private/${path}`, data, {
      headers: {
        "Content-Type": contentType,
      },
    });
    return response.data;
  }

  /**
   * getDataEntries
   * @param resourceId
   * @param resourceType
   * @param fromUnixTime
   * @param limit
   */
  public async getDataEntries(
    resourceId: string,
    resourceType: string,
    fromUnixTimeInMilliseconds: number,
    limit: number = 100
  ): Promise<HarvestRecord[]> {
    const result = await this.httpClient.get(
      `/data/${resourceType}/${resourceId}`,
      {
        params: {
          from: fromUnixTimeInMilliseconds,
          limit,
          sort: "desc",
        },
      }
    );

    if (!result.data) {
      throw new Error("Failed to fetch data entries");
    }

    return result.data as HarvestRecord[];
  }
}
