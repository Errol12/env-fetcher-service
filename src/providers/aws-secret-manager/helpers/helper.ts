import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class Helper {
  async auth(credentials) {
    return new AWS.SecretsManager(credentials);
  }

  async fetchData(client: AWS.SecretsManager, secretName: string) {
    return await client
      .getSecretValue({
        SecretId: secretName,
      })
      .promise();
  }

  enrichResponse(data: AWS.SecretsManager.GetSecretValueResponse) {
    return JSON.parse(data.SecretString);
  }
}
