# env-fetcher-service

A lightweight utility to seamlessly fetch configuration data from **AWS Systems Manager (SSM) Parameter Store** and **AWS Secrets Manager**.

![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Tests](https://img.shields.io/badge/tests-95%20passed-success)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue)

---

## ✨ Features

- Fetches environment configuration from **AWS SSM Parameter Store**
- Supports secrets retrieval from **AWS Secrets Manager**
- Supports response enrichment and trimming for easy use
- Designed for Node.js environments

---

## 📦 Installation

Install via [npm](https://www.npmjs.com/package/env-fetcher-service):

```bash
npm install env-fetcher-service
```

---

## 🚀 Usage

Here’s a basic example of how to use `env-fetcher-service`:

```js
const { App } = require('env-fetcher-service');
// or
// const App = require('env-fetcher-service');

class MainService {
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

const service = new MainService();
service.fetchConfig();
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

## ✅ Testing

This package maintains **100% code coverage** with comprehensive test suites:

- **Statements:** 100%
- **Branches:** 100%
- **Functions:** 100%
- **Lines:** 100%

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

All 95+ test cases ensure the reliability and correctness of the package across all supported AWS services and edge cases.

---

## 👤 Author

- [@errol12](https://github.com/errol12)

---

## 📄 License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

---

## 🏷️ Tags

- Node.js
- AWS
- SSM
- Secrets Manager
- Environment Variables