import { BadRequestException, Injectable } from '@nestjs/common';
import { SupportedEnvTypes } from './constants/supported-env-types';
import { AWSSecretManagerService } from './providers/aws-secret-manager/aws-secret-manager.service';
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
      case SupportedEnvTypes.AWS_SECRET_MANAGER:
        const awsSecretManagerData = new AWSSecretManagerService();
        output = awsSecretManagerData.get(options);
        break;
      default:
        throw new BadRequestException('Unsupported type!');
    }
    return output;
  }
}
