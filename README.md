# FluxToys

![CI](https://github.com/github/docs/actions/workflows/ci.yml/badge.svg)

This project provides a series of sources, sinks and integrations those we can play around with SORACOM Flux, a low code IoT aplication builder.

## Sources

### SoraCam

A source webhook which uploads SorCam image to Soracom Harvest Files.

### SORACOM Harvest Data

A source webhook which returns a series of data entries from Soracom Harvest Data.

## Deploy

```
npm run installAll
npm run build
npm cdk deploy \
  --context soracomAuthKeyId=${SORACOM_AUTH_KEY_ID} \ 
  --context soracomAuthKey=${SORACOM_AUTH_KEY} \
  --context harvestFilesPath=${HARVEST_FILES_DIR_PATH}
```



