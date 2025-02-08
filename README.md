
# Env-fetcher-service

This package is used to fetch configuration from AWS Stored Parameters and AWS Secret Manager


## Installation

Install env-fetcher-service with npm

```bash
  npm i env-fetcher-service
```
    
## License

[MIT](https://choosealicense.com/licenses/mit/)


## Authors

- [@errol12](https://www.github.com/Errol12)


## Usage/Examples

```javascript
import { App } from 'env-fetcher-service';

export class MainService {
  fetchConfig() {
    const app = new App();
    const options = {
      credentials: {
        region: '<region>',
        credentials: {
          accessKeyId: '<access-key-id>',
          secretAccessKey: '<secret-access-key-id>',
        },
      },
      metadata: {
        secretId: '<secret-ID>', // required for AWS Secret Manager,
        path: '<ssm-path>',  //required for AWS Stored parameter
        paths: [],
        keys: [],
      },
      enrichmentOptions: {
        enrichResponse: true,
        trimPathVariableName: true,
      },
    };

    const extractorType = 'AWS_SSM' || 'AWS_SECRET_MANAGER';
    const response = app.extractEnv(extractorType, options);
    return response;
  }
}

```

## Tags

 - [NestJs](https://www.npmjs.com/search?q=keywords:NestJS)