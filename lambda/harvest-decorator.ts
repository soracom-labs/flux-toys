import { getSoracomClient, setGetSoracomClient } from "./lib/utils";
export { setGetSoracomClient };

export interface HarvestRecord {
  time: number;
  content: any;
  contentType: string;
}

export interface ParsedHarvestRecord {
  time: number;
  content: any;
}

export interface HarvestDecoratorResult {
  resource_id: string;
  resource_type: string;
  from_unixtime: number;
  data: ParsedHarvestRecord[];
  num_records: number;
}

export const parseHarvestRecords = (
  record: HarvestRecord[]
): ParsedHarvestRecord[] => {
  return record.map((r) => {
    return {
      time: r.time,
      content:
        r.contentType === "application/json"
          ? JSON.parse(r.content)
          : r.content,
    };
  });
};

export const handler = async (event: any = {}): Promise<any> => {
  //TODO: Improve validation implementation
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.resource_id ||
    !event.queryStringParameters.resource_type
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "resource_id and resource_type is required in querystring parameters",
      }),
    };
  }

  const coverageType = event.queryStringParameters.coverage_type
    ? event.queryStringParameters.coverage_type
    : "jp";
  const resourceId = event.queryStringParameters.resource_id;
  const resourceType = event.queryStringParameters.resource_type;
  const fromUnixTime = event.queryStringParameters.from_unixtime
    ? event.queryStringParameters.from_unixtime
    : Date.now() - 1000 * 60 * 60 * 24;

  const soracomClient = await getSoracomClient(coverageType);

  const dataEntries = await soracomClient.getDataEntries(
    resourceId,
    resourceType,
    fromUnixTime
  );

  const harvestDecoratorResult: HarvestDecoratorResult = {
    resource_id: resourceId,
    resource_type: resourceType,
    from_unixtime: fromUnixTime,
    data: parseHarvestRecords(dataEntries),
    num_records: dataEntries.length,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(harvestDecoratorResult),
  };
};
