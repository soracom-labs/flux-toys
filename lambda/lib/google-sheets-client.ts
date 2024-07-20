import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsClient {
  client: sheets_v4.Sheets;

  /*
   * Creates a Google Sheets client.
   * @param secretFilePath - the path to the secret file
   */
  constructor(secretFilePath: string) {
    const auth = new google.auth.GoogleAuth({
      keyFile: secretFilePath,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    this.client = google.sheets({ version: "v4", auth });
  }

  /*
   * Appends a record to the Google Sheet.
   * @param sheetId - the Google Sheet ID
   * @param sheetName - the Google Sheet name
   * @param startPoint - the starting point to append the record
   * @param record - the record to append
   * @returns the response from the Google Sheets API
   */
  async append(
    sheetId: string,
    sheetName: string,
    startPoint: string,
    record: any[]
  ): Promise<any> {
    const response = await this.client.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!${startPoint}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [record],
      },
    });
    if (!response.data)
      throw new Error("Failed in append call to Google Sheets");
    return response.data;
  }

  /*
   * Flushes rows to the Google Sheet.
   * @param sheetId - the Google Sheet ID
   * @param sheetName - the Google Sheet name
   * @param startPoint - the starting point to append the rows
   * @param rows - the rows to append
   * @returns the response from the Google Sheets API
   */
  async flushRowsToSheet(
    sheetId: string,
    sheetName: string,
    startPoint: string,
    rows: any[][]
  ) {
    rows.shift();
    const result = [];
    for await (const row of rows) {
      const response = await this.append(sheetId, sheetName, startPoint, row);
      await new Promise((resolve) => setTimeout(resolve, 300));
      result.push(response);
    }
    return result;
  }
}
