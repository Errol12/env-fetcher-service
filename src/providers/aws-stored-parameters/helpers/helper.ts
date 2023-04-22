import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class Helper {
  async auth(credentials) {
    return new AWS.SSM(credentials);
  }

  async fetchData(client: AWS.SSM, path: string, nextToken = null) {
    const getParameters = await client
      .getParametersByPath({
        Path: path,
        WithDecryption: true,
        NextToken: nextToken,
      })
      .promise();
    return getParameters;
  }

  enrichResponse(response, path = null, enrichmentOptions = null) {
    const payload = {};
    response
      .flat()
      .map(
        (_el) =>
          (payload[
            enrichmentOptions && enrichmentOptions.trimPathVariableName
              ? _el['Name'].replace(path, '')
              : _el['Name']
          ] = _el['Value']),
      );
    return payload;
  }
}
