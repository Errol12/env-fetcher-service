import { Injectable } from '@nestjs/common';
import { IBase } from '../../interfaces/base.interface';
import { Helper } from './helpers/helper';

@Injectable()
export class AWSStoredParametersService implements IBase {
  async get(options) {
    const { credentials, metadata, enrichmentOptions } = options;
    const paramList = [];
    const helper = new Helper();
    const client = await helper.auth(credentials);
    let nextToken = null;
    let nextIteration = false;
    do {
      const storedParams = await helper.fetchData(
        client,
        metadata.path,
        nextToken,
      );
      nextIteration = storedParams && storedParams.NextToken ? true : false;
      nextToken = storedParams.NextToken;
      paramList.push(storedParams.Parameters);
    } while (nextIteration);
    return enrichmentOptions && enrichmentOptions.enrichResponse
      ? helper.enrichResponse(paramList, metadata.path, enrichmentOptions)
      : paramList.flat();
  }
}
