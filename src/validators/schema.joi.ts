import * as Joi from 'joi';

export const AwsCredentialsSchema = Joi.object({
  accessKeyId: Joi.string().required(),
  secretAccessKey: Joi.string().required(),
});

export const CredentialsSchema = Joi.object({
  region: Joi.string().required(),
  credentials: AwsCredentialsSchema.optional(),
});

export const MetadataSchema = Joi.object({
  path: Joi.string().allow(null, ''), // Optional or empty string
  secretId: Joi.string().allow(null, ''), // Optional or empty string
  paths: Joi.alternatives().conditional('path', {
    is: Joi.exist(),
    then: Joi.forbidden(), // If path is present, paths must not be sent
    otherwise: Joi.array().items(Joi.string()).max(3).optional(),
  }),
  keys: Joi.alternatives().conditional('path', {
    is: Joi.exist(),
    then: Joi.forbidden(), // If path is present, keys must not be sent
    otherwise: Joi.array().items(Joi.string()).max(10).optional(),
  }),
});

export const EnrichmentOptionsSchema = Joi.object({
  enrichResponse: Joi.boolean().required(),
  trimPathVariableName: Joi.boolean().required(),
});

export const JoiSchema = Joi.object({
  credentials: CredentialsSchema.required(),
  metadata: MetadataSchema.required(),
  enrichmentOptions: EnrichmentOptionsSchema.required(),
});
