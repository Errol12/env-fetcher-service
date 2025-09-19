import { Injectable, NotFoundException } from '@nestjs/common';
const { SSMClient, GetParameterCommand, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');

@Injectable()
export class Helper {
  async auth(credentials) {
    return new SSMClient(credentials);

  }

  async fetchDataByPath(client: any, path: string, nextToken = null) {
    const getParameters = new GetParametersByPathCommand({
      Path: path,
      WithDecryption: true,
      NextToken: nextToken,
    });
    return await client.send(getParameters);
  }

  async fetchDataByKey(client: any, path: string) {
    try {
      const getParameters = new GetParameterCommand({
        Name: path,
        WithDecryption: true
      });
      return await client.send(getParameters);
    } catch(error) {
      throw new NotFoundException(`Error in fetching value for key: ${path}`) ;
    }
    
  }

  enrichResponse(response, path = null, enrichmentOptions = null) {
    const payload = {};
    response
      .flat()
      .map(
        (_el) =>
          (payload[
            enrichmentOptions && enrichmentOptions.trimPathVariableName
              ? _el['Name'].replace(`${path}/`, '')
              : _el['Name']
          ] = _el['Value']),
      );
    return payload;
  }
}
