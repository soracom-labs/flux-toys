import axios from "axios";
import dayjs from "dayjs";
import { getSoracomClient, setGetSoracomClient } from "./lib/utils";
export { setGetSoracomClient };

export const handler = async (event: any = {}): Promise<any> => {
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.device_id ||
    !event.queryStringParameters.upload_directory
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "device_id and upload_directory are required in querystring parameters",
      }),
    };
  }

  const harvestfilesPath = process.env.HARVEST_FILES_PATH!;
  const deviceId = event.queryStringParameters.device_id;
  const uploadDirectory = event.queryStringParameters.upload_directory;
  const soracomClient = await getSoracomClient();

  const time = Date.now() - 1000 * 10;
  const exportResult = await soracomClient.exportSoraCamDeviceRecordedImage(
    deviceId,
    time
  );

  let buffer: Buffer;

  while (true) {
    const exportStatus = await soracomClient.getSoraCamDeviceExportedImage(
      deviceId,
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
  let path = `${harvestfilesPath}/${uploadDirectory}/${deviceId}-${dayjs().format(
    "YYYYMMDDHHmmss"
  )}.jpg`;

  try {
    await soracomClient.putFile(path, buffer, "image/jpeg");
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to upload image",
      }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Image uploaded.",
    }),
  };
};
