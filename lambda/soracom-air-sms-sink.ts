import { getSoracomClient, setGetSoracomClient } from "./lib/utils";
export { setGetSoracomClient };

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.queryStringParameters || !event.queryStringParameters.sim_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "sim_id is required in querystring parameters",
      }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body is required.",
      }),
    };
  }

  const data = JSON.parse(event.body);
  if (!data.text) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body must contains text.",
      }),
    };
  }

  const simId = event.queryStringParameters.sim_id;
  const text = data.text;

  const soracomClient = await getSoracomClient();

  const result = await soracomClient
    .sendSMStoSim(simId, text)
    .catch((error) => {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to send SMS",
        }),
      };
    });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
