# FluxToys

![CI](https://github.com/github/docs/actions/workflows/ci.yml/badge.svg)

This project provides a series of sources, sinks and integrations those we can play around with SORACOM Flux, a low code IoT aplication builder.

## Sources

### SoraCam

A source webhook which uploads SorCam image to Soracom Harvest Files.

### SORACOM Harvest Data

A source webhook which returns a series of data entries from Soracom Harvest Data.

## Sinks

Sinks are outlet components to send data from Soracom Flux.

### Google Sheets

This sink emits a row to Google Spreadsheet. Each rows should be consists of ordered items like CSV.

![demo](./asset/google-sheets-sink-demo.gif)

Usage

```
curl \
-XPOST \
-H 'Content-Type:application/json'
-d '[["${timestamp1}", "${data1}],["${timestamp2}", "${data2}]]' 
https://${hostname}/v1/sink/googlesheet?sheet_id=${sheetId}&sheet_name=${sheetName}
```

## Deploy

```
npm run installAll
npm run build
npm cdk deploy \
  --context soracomAuthKeyId=${SORACOM_AUTH_KEY_ID} \ 
  --context soracomAuthKey=${SORACOM_AUTH_KEY} \
  --context harvestFilesPath=${HARVEST_FILES_DIR_PATH}
```



