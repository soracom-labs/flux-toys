import axios from "axios";
import dayjs from "dayjs";
import { getSoracomClient, setGetSoracomClient } from "./lib/utils";
export { setGetSoracomClient };

export const handler = async (event: any = {}): Promise<any> => {
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.sim_id ||
    !event.queryStringParameters.tag_name
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "sim_id and tag_name are required in querystring parameters",
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
  if (!data.tag_value) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body must contains tag_value.",
      }),
    };
  }

  const simId = event.queryStringParameters.sim_id;
  const tagName = event.queryStringParameters.tag_name;
  const tagValue = data.tag_value;

  const soracomClient = await getSoracomClient();

  //TODO: Add error handling
  await soracomClient.putSimTags(simId, tagName, tagValue).catch((e) => {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: e.message,
      }),
    };
  });

  return {
    statusCode: 200,
  };
};
