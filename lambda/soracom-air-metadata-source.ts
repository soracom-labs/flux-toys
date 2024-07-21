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

  const simId = event.queryStringParameters.sim_id;

  const soracomClient = await getSoracomClient();

  const simData = await soracomClient.getSim(simId).catch((e) => {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: e.message,
      }),
    };
  });

  const responseBody = simData.tags
    ? JSON.stringify(simData.tags)
    : JSON.stringify({});

  return {
    statusCode: 200,
    body: responseBody,
  };
};
