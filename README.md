
# Env-fetcher-service

This package is used to fetch configuration from AWS Stored parameters


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
        path: '<ssm-path>',
      },
      enrichmentOptions: {
        enrichResponse: true,
        trimPathVariableName: true,
      },
    };
    const response = app.extractEnv('AWS_SSM', options);
    return response;
  }
}

```

