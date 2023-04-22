import { BadRequestException, Injectable } from '@nestjs/common';
import { SupportedEnvTypes } from './constants/supported-env-types';
import { AWSStoredParametersService } from './providers/aws-stored-parameters/aws-stored-parameters.service';
@Injectable()
export class App {
  getHello(): string {
    return 'Hello World!';
  }

  extractEnv(type, options): any {
    let output = {};
    switch (type) {
      case SupportedEnvTypes.AWS_SSM:
        const awsStoredParams = new AWSStoredParametersService();
        output = awsStoredParams.get(options);
        break;
      default:
        throw new BadRequestException('Unsupported type !');
    }
    return output;
  }
}
