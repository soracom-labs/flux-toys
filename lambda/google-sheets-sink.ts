import { getGoogleSheetsClient, setGetGoogleSheetsClient } from "./lib/utils";
export { setGetGoogleSheetsClient };

const googleSecretName = process.env.GOOGLE_SECRET_NAME!;

export const handler = async (event: any = {}): Promise<any> => {
  //TODO: Improve validation implementation
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.sheet_id ||
    !event.queryStringParameters.sheet_name
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "sheet_id and sheet_name is required in querystring parameters",
      }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body is required",
      }),
    };
  }

  const data = JSON.parse(event.body);
  if (data.constructor !== Array) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body must be an array",
      }),
    };
  }

  const sheetId = event.queryStringParameters.sheet_id;
  const sheetName = event.queryStringParameters.sheet_name;
  const startPoint = "A1";

  const googleSheetsClient = await getGoogleSheetsClient(googleSecretName);

  const response = await googleSheetsClient.append(
    sheetId,
    sheetName,
    startPoint,
    data
  );

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
