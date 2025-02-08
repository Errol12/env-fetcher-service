import { BadRequestException, Injectable } from '@nestjs/common';
import { SupportedEnvTypes } from './constants/supported-env-types';
import { AWSSecretManagerService } from './providers/aws-secret-manager/aws-secret-manager.service';
import { AWSStoredParametersService } from './providers/aws-stored-parameters/aws-stored-parameters.service';
import { SchemaDto } from './validators/schema.dto';
import { JoiSchema } from './validators/schema.joi';
@Injectable()
export class Helper {
  process(type, options: SchemaDto): any {
    // Validate data using Joi
    const { error } = JoiSchema.validate(options, { abortEarly: false });

    // If validation fails, throw an error
    if (error) {
      throw new BadRequestException(error.details.map((detail) => detail.message));
    }
    let output = {};
    switch (type) {
      case SupportedEnvTypes.AWS_SSM:
        output = this.ssmProcess(options);
        break;
      case SupportedEnvTypes.AWS_SECRET_MANAGER:
        const awsSecretManagerData = new AWSSecretManagerService();
        output = awsSecretManagerData.get(options);
        break;
      default:
        throw new BadRequestException('Unsupported type !');
    }
    return output;
  }

  async ssmProcess(options): Promise<any> {
    let output = {};
    const awsStoredParams = new AWSStoredParametersService();
    if (options.metadata.path) { return awsStoredParams.get(options); }
    if (options.metadata.paths) {
        await Promise.all(options.metadata.paths.map(async (path) => {
            output[path] = await awsStoredParams.get({ ...options, metadata: { path } });
        }));
    }
    if (options.metadata.keys) {
        await Promise.all(options.metadata.keys.map(async (key) => {
            output[key] = await awsStoredParams.getByKey({ ...options, metadata: { key } });
        }));
    }
    return output;
  }
}
