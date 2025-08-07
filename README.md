# env-fetcher-service

A lightweight utility to seamlessly fetch configuration data from **AWS Systems Manager (SSM) Parameter Store** and **AWS Secrets Manager**.

---

## ✨ Features

- Fetches environment configuration from **AWS SSM Parameter Store**
- Supports secrets retrieval from **AWS Secrets Manager**
- Supports response enrichment and trimming for easy use
- Designed for Node.js/NestJS environments

---

## 📦 Installation

Install via [npm](https://www.npmjs.com/package/env-fetcher-service):

```bash
npm install env-fetcher-service
```

---

## 🚀 Usage

Here’s a basic example of how to use `env-fetcher-service`:

```ts
import { App } from 'env-fetcher-service';

export class MainService {
  fetchConfig() {
    const app = new App();

    const options = {
      credentials: {
        region: '<region>',
        credentials: {
          accessKeyId: '<access-key-id>',
          secretAccessKey: '<secret-access-key>',
        },
      },
      metadata: {
        secretId: '<secret-ID>',        // For AWS Secrets Manager
        paths: ['<ssm-path>'],          // Optional: SSM parameter paths
        keys: ['<ssm-key>'],            // Optional: SSM parameter keys
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

---

## 🧪 Supported Options

| Option                  | Description                                          |
|-------------------------|------------------------------------------------------|
| `region`                | AWS region                                           |
| `accessKeyId`           | AWS access key ID                                    |
| `secretAccessKey`       | AWS secret access key                                |
| `secretId`              | Secret ID from AWS Secrets Manager                   |
| `paths`                 | List of AWS SSM parameter paths                      |
| `keys`                  | List of individual SSM parameter keys                |
| `enrichResponse`        | If `true`, enriches the response with metadata       |
| `trimPathVariableName`  | If `true`, trims variable names from paths           |

---

## 👤 Author

- [@errol12](https://github.com/errol12)

---

## 📄 License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

---

## 🏷️ Tags

- [NestJS](https://www.npmjs.com/search?q=keywords:NestJS)
- AWS
- SSM
- Secrets Manager
- Environment Variables