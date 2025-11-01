const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

class Helper {
  async auth(credentials) {
    return new SecretsManagerClient(credentials);
  }

  async fetchData(client, secretName) {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    return await client.send(command);
  }

  enrichResponse(data) {
    return JSON.parse(data.SecretString);
  }
}

module.exports = Helper;
