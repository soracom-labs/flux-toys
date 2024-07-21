import { getTwilioClient } from "./lib/utils";
export { setGetTwilioClient } from "./lib/utils";

const twilioSecretName = process.env.TWILIO_SECRET_NAME!;

export const handler = async (event: any = {}): Promise<any> => {
  //TODO: Improve validation implementation
  if (!event.queryStringParameters || !event.queryStringParameters.to_number) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "to_number is required in querystring parameters",
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
  if (!data.text) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "text is required in body",
      }),
    };
  }

  const toNumber = event.queryStringParameters.to_number;
  const text = data.text;

  const twilioClient = await getTwilioClient(twilioSecretName);

  await twilioClient.makeCall(toNumber, text).catch((err) => {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to make a call",
      }),
    };
  });

  return {
    statusCode: 201,
  };
};
