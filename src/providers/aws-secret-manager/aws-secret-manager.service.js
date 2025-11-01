const Helper = require('./helpers/helper');

class AWSSecretManagerService {
  async get(options) {
    const { credentials, metadata } = options;
    const helper = new Helper();
    const client = await helper.auth(credentials);
    const secretManagerData = await helper.fetchData(client, metadata.secretId);
    return helper.enrichResponse(secretManagerData);
  }
}

module.exports = AWSSecretManagerService;
