import { Injectable } from '@nestjs/common';
import { IBase } from '../../interfaces/base.interface';
import { Helper } from './helpers/helper';

@Injectable()
export class AWSSecretManagerService implements IBase {
  async get(options) {
    const { credentials, metadata } = options;
    const helper = new Helper();
    const client = await helper.auth(credentials);
    const secretManagerData = await helper.fetchData(client, metadata.secretId);
    return helper.enrichResponse(secretManagerData);
  }
}
