# FluxToys

A collective of webhooks those can be played around with Soracom Flux. Each webhook provides source function which fetch data from outside Soracom Flux, or sink function which emits data to outside of Soracom Flux.

Current features:
- Soracom Air Metadata source
- SoraCam Image source
- Soracom Harvest Data source
- Soracom Air Metadata sink
- Soracom Air SMS sink
- Phone call sink
- Google spreadsheet sink

## Sources

### Soracom Air Metadata

A source component to fetch metadata of Soracom Air Sim.

```
curl \
-XGET \
-H "x-api-key:${apikey}" \
"https://${hostname}/v1/source/soracom_air_metadata?sim_id=${sim_id}&tag_name=test&coverage_type=${coverage_type}"
```

Query parameters
* sim_id: Target SIM ID
* tag_name: Tag name in metadata.
* coverage_type: SORACOM coverage type. "g" or "jp".

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deploySoracomAirMetadataSource=1 \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}" 
```

* stackName - Stack name prefix
* deploySoracomAirMetadataSource - A flag to deploy a component
* 
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.

### SoraCam(Soracom Cloud Camera Service)

A source webhook which uploads SorCam image to Soracom Harvest Files.

```
curl \
-XGET \
-H "x-api-key:${apikey}" \
"https://${hostname}/v1/source/soracam_image?device_id=${device_id}&upload_directory=${directory}"
```

Query parameters
* device_id: Soracam ID
* upload_directory: Upload target directory under base path.

You will need SAM user with permissions below

```
{
    "statements": [
        {
            "effect": "allow",
            "api": [
                "SoraCam:getSoraCamDeviceExportedImage",
                "SoraCam:exportSoraCamDeviceRecordedImage",
                "FileEntry:putFile"
            ]
        }
    ]
}
```

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deploySoracamImageSourceSink=1 \
  --context harvestFilesPath="${HARVEST_FILES_DIR_PATH}" \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}" 
```

* stackName - Stack name prefix
* deploySoracamImageSourceSink - A flag to deploy a component
* 
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.

### SORACOM Harvest Data

A source webhook which returns a series of data entries from Soracom Harvest Data.

```
curl \
-XGET \
-H "x-api-key:${apikey}" \
"https://${hostname}/v1/source/soracom_harvest_data?resource_type=${reource_type}&resource_id=${resource_id}&coverage_type=${coverage_type}"
```

Query parameters
* resource_type: If you are using SORACOM SIM, please specify "Subscriber".
* resource_id: If you are using SORACOM SIM, please specify your SIM's IMSI.
* coverage_type: SORACOM coverage type. "g" or "jp".

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deploySoracomHarvestDataSource=1 \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}" 
```

* stackName - Stack name prefix
* deploySoracomHarvestDataSource - A flag to deploy a component
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.

## Sinks

Sinks are outlet components to send data from Soracom Flux.

### SORACOM Air metadata

This sink updates SORACOM SIM meta data with posted key and value.

Usage

```
curl \
-XPOST \
-H 'Content-Type:application/json' \
-H "x-api-key:${apikey}" \
-d '{"tag_value":"this is a test message."}' \
"https://${hostname}/v1/sink/soracom_air_metadata?sim_id=${sim_id}&tag_name=test&coverage_type=${coverage_type}"

```

Query parameters
* sim_id: Target SIM ID
* tag_name: Tag name in metadata.
* coverage_type: SORACOM coverage type. "g" or "jp".

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deploySoracomAirMetadataSink=1 \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}"
```

* deploySoracomAirMetadataSink - A flag to deploy a component
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.

### SORACOM SMS API

This sink sends a SMS with posted text.

Usage

```
curl \
-XPOST \
-H 'Content-Type:application/json' \
-H "x-api-key:${apikey}" \
-d '{"text":"this is a test message."}' \
"https://${hostname}/v1/sink/soracom_air_sms?sim_id=${sim_id}"
```

Query parameters
* sim_id: Target SIM ID

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deploySoracomAirSmsSink=1 \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}" 
```

* stackName - Stack name prefix
* deploySoracomAirSmsSink - A flag to deploy a component
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.


### Phone call

This sink makes a phone call with posted text.

Usage

```
curl \
-XPOST \
-H 'Content-Type:application/json' \
-H "x-api-key:${apikey}" \
-d '{"text":"Hello, this is Flux app!"}' \
"https://${hostname}/v1/sink/phonecall?to_number=${phone_number}"
```

Query Parameters
* to_number: URL encoded phone number with country code. For example, when you call to U.S. number, you have to start with '%2B1' while %2B represents '+' in url safe characters, which means '+1'.

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deployPhoneCallSink=1 \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}" \
  --context twilioSecretname="${AWS_SECRETS_MANAGER_NAME_FOR_TWILIO}"
```

* stackName - Stack name prefix
* deployPhoneCallSink - A flag to deploy a component
* twilioSecretname - A secret name of AWS Secrets Manager. The value should be like
    ```
    {"accountSid":"YOUR TWILIO ACCOUNT SID STARTING FROM 'AC'","authToken":"YOUR AUTH TOKEN","myPhoneNumber":"YOUR FROM PHONE NUMBER"}
    ```
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.

### Google Sheets

This sink emits a row to Google Spreadsheet. Each rows should be consists of ordered items like CSV.

![demo](./asset/google-sheets-sink-demo.gif)

Usage

```
curl \
-XPOST \
-H 'Content-Type:application/json' \
-H "x-api-key:${apikey}" \
-d '["${column1}", "${column2}", "${column3}", "${column4}"]' \
"https://${hostname}/v1/sink/googlesheets?sheet_id=${sheet_id}&sheet_name=${sheet_name}"
```

Query parameters
* sheed_id: Google Sheet ID. It is included in the URL of your sheet.
* sheet_name: Sheet name in the spread sheet.

Deploy

```
npm run installAll
npm run build
npx cdk deploy \
  --context stackName=${myName} \
  --context deployGoogleSheetsSink=1 \
  --context soracomAuthKeyId="${SORACOM_AUTH_KEY_ID}" \
  --context soracomAuthKey="${SORACOM_AUTH_KEY}" \
  --context googleSecretname="${AWS_SECRETS_MANAGER_NAME_FOR_GOOGLE}"
```

* stackName - Stack name prefix
* deployGoogleSheetsSink - A flag to deploy a component
* googleSecretname - A secret name of AWS Secrets Manager. The value should be like below. It's a Goole service account's credentials.
    ```
    {
      "type": "service_account",
      "project_id": "factory-personal",
      "private_key_id": "xxxx",
      "private_key": "-----BEGIN PRIVATE KEY-----\nxxxx----\n",
      "client_email": "xxxx",
      "client_id": "xxxx",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/xxx",
      "universe_domain": "googleapis.com"
  }
    ```
* soracomAuthKeyId - Your Soracom credentials AuthKeyId. It is required everywhere as of now.
* soracomAuthKey - Your Soracom credentials AuthKeyId. It is required everywhere as of now.


### You will need IAM permission below

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ValidateTemplate",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:SetStackPolicy"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "apigateway:POST",
        "apigateway:PUT",
        "apigateway:PATCH",
        "apigateway:DELETE",
        "apigateway:GET"
      ],
      "Resource": [
        "arn:aws:apigateway:*::/restapis",
        "arn:aws:apigateway:*::/restapis/*",
        "arn:aws:apigateway:*::/restapis/*/stages",
        "arn:aws:apigateway:*::/restapis/*/deployments",
        "arn:aws:apigateway:*::/apikeys",
        "arn:aws:apigateway:*::/usageplans",
        "arn:aws:apigateway:*::/usageplans/*/keys"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:InvokeFunction",
        "lambda:GetFunction",
        "lambda:ListFunctions"
      ],
      "Resource": "arn:aws:lambda:*:*:function:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::*:role/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:DeleteSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:UpdateSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:*"
    }
  ]
}
```
