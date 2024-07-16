import axios from "axios";
import dayjs from "dayjs";
import { getSoracomClient, setGetSoracomClient } from "./lib/utils";
export { setGetSoracomClient };

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.queryStringParameters || !event.queryStringParameters.device) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "device is required in querystring parameters",
      }),
    };
  }

  const harvestfilesPath = process.env.HARVEST_FILES_PATH!;

  const device = event.queryStringParameters.device;
  const soracomClient = await getSoracomClient();

  const time = Date.now() - 1000 * 10;
  const exportResult = await soracomClient.exportSoraCamDeviceRecordedImage(
    device,
    time
  );

  let buffer: Buffer;

  while (true) {
    const exportStatus = await soracomClient.getSoraCamDeviceExportedImage(
      device,
      exportResult.exportId as string
    );

    if (exportStatus.status === "completed") {
      const response = await axios.get(exportStatus.url, {
        responseType: "arraybuffer",
      });
      buffer = Buffer.from(response.data, "binary");

      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  let path = `${harvestfilesPath}/${device}-${dayjs().format(
    "YYYYMMDDHHmmss"
  )}.jpg`;

  const uploadResult = await soracomClient.putFile(path, buffer, "image/jpeg");
  return {
    statusCode: 201,
  };
};
