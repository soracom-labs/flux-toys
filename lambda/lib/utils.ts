import { SoracomClient } from "./soracom-client";
import { GoogleSheetsClient } from "./google-sheets-client";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { writeFileSync } from "fs";

export async function fetchAndParseSoracomSecrets(): Promise<{
  soracomAuthKeyId: string;
  soracomAuthKey: string;
}> {
  const secretName = process.env.SECRET_NAME!;
  const client = new SecretsManagerClient({});
  const command = new GetSecretValueCommand({ SecretId: secretName });

  const response = await client.send(command);
  if (response.SecretString) {
    const data = JSON.parse(response.SecretString);
    const secret = {
      soracomAuthKeyId: data.soracomAuthKeyId,
      soracomAuthKey: data.soracomAuthKey,
    };
    return secret;
  }
  throw new Error("Failed to fetch secrets");
}

export let getSoracomClient = async (
  coverageType: string = "jp"
): Promise<SoracomClient> => {
  const soracomSecrets = await fetchAndParseSoracomSecrets();
  return new SoracomClient(
    soracomSecrets.soracomAuthKeyId,
    soracomSecrets.soracomAuthKey,
    coverageType
  );
};

export let getGoogleSheetsClient = async (
  secreteName: string
): Promise<GoogleSheetsClient> => {
  const client = new SecretsManagerClient({});
  const command = new GetSecretValueCommand({ SecretId: secreteName });

  const response = await client.send(command);
  if (!response.SecretString) {
    throw new Error("Failed to fetch Google secrets");
  }
  await writeFileSync("/tmp/google-credentials.json", response.SecretString);

  return new GoogleSheetsClient("/tmp/google-credentials.json");
};

// テスト用にgetSoracomClientをエクスポート
export const setGetSoracomClient = (fn: typeof getSoracomClient) => {
  getSoracomClient = fn;
};

export const setGetGoogleSheetsClient = (fn: typeof getGoogleSheetsClient) => {
  getGoogleSheetsClient = fn;
};
