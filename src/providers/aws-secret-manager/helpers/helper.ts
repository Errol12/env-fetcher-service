import { Injectable } from '@nestjs/common';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class Helper {
  async auth(credentials) {
    return new SecretsManagerClient(credentials);
  }

  async fetchData(client: any, secretName: string) {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    return await client.send(command);
  }

  enrichResponse(data: any) {
    return JSON.parse(data.SecretString);
  }
}
