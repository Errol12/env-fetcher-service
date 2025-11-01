const { SupportedEnvTypes } = require('./constants/supported-env-types');
const AWSSecretManagerService = require('./providers/aws-secret-manager/aws-secret-manager.service');
const AWSStoredParametersService = require('./providers/aws-stored-parameters/aws-stored-parameters.service');
const { JoiSchema } = require('./validators/schema.joi');

class Helper {
  process(type, options) {
    // Validate data using Joi
    const { error } = JoiSchema.validate(options, { abortEarly: false });

    // If validation fails, throw an error
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new Error(errorMessages.join(', '));
    }
    let output = {};
    switch (type) {
      case SupportedEnvTypes.AWS_SSM:
        output = this.ssmProcess(options);
        break;
      case SupportedEnvTypes.AWS_SECRET_MANAGER: {
        const awsSecretManagerData = new AWSSecretManagerService();
        output = awsSecretManagerData.get(options);
        break;
      }
      default:
        throw new Error('Unsupported type !');
    }
    return output;
  }

  async ssmProcess(options) {
    let output = {};
    const awsStoredParams = new AWSStoredParametersService();
    if (options.metadata.path) {
      return awsStoredParams.get(options);
    }
    if (options.metadata.paths) {
      await Promise.all(
        options.metadata.paths.map(async (path) => {
          output[path] = await awsStoredParams.get({
            ...options,
            metadata: { path },
          });
        }),
      );
    }
    if (options.metadata.keys) {
      await Promise.all(
        options.metadata.keys.map(async (key) => {
          output[key] = await awsStoredParams.getByKey({
            ...options,
            metadata: { key },
          });
        }),
      );
    }
    return output;
  }
}

module.exports = Helper;
