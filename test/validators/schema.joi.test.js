const { JoiSchema } = require('../../src/validators/schema.joi');

describe('JoiSchema', () => {
  const validOptions = {
    credentials: {
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
    },
    metadata: {
      path: '/test/path',
    },
    enrichmentOptions: {
      enrichResponse: true,
      trimPathVariableName: true,
    },
  };

  describe('valid input', () => {
    it('should validate valid options with path', () => {
      const { error } = JoiSchema.validate(validOptions);
      expect(error).toBeUndefined();
    });

    it('should validate valid options with secretId', () => {
      const options = {
        ...validOptions,
        metadata: {
          secretId: 'test-secret-id',
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeUndefined();
    });

    it('should validate valid options with paths array', () => {
      const options = {
        ...validOptions,
        metadata: {
          paths: ['/path1', '/path2'],
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeUndefined();
    });

    it('should validate valid options with keys array', () => {
      const options = {
        ...validOptions,
        metadata: {
          keys: ['/key1', '/key2'],
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeUndefined();
    });

    it('should validate options without credentials object', () => {
      const options = {
        credentials: {
          region: 'us-east-1',
        },
        metadata: {
          path: '/test/path',
        },
        enrichmentOptions: {
          enrichResponse: true,
          trimPathVariableName: true,
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeUndefined();
    });

    it('should validate empty path string', () => {
      const options = {
        ...validOptions,
        metadata: {
          path: '',
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeUndefined();
    });

    it('should validate null path', () => {
      const options = {
        ...validOptions,
        metadata: {
          path: null,
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeUndefined();
    });
  });

  describe('invalid input', () => {
    it('should reject missing credentials', () => {
      const options = {
        metadata: validOptions.metadata,
        enrichmentOptions: validOptions.enrichmentOptions,
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('credentials');
    });

    it('should reject missing region', () => {
      const options = {
        credentials: {
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret',
          },
        },
        metadata: validOptions.metadata,
        enrichmentOptions: validOptions.enrichmentOptions,
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('region');
    });

    it('should reject missing metadata', () => {
      const options = {
        credentials: validOptions.credentials,
        enrichmentOptions: validOptions.enrichmentOptions,
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('metadata');
    });

    it('should reject missing enrichmentOptions', () => {
      const options = {
        credentials: validOptions.credentials,
        metadata: validOptions.metadata,
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('enrichmentOptions');
    });

    it('should reject invalid credentials.accessKeyId', () => {
      const options = {
        ...validOptions,
        credentials: {
          ...validOptions.credentials,
          credentials: {
            accessKeyId: '',
            secretAccessKey: 'test-secret',
          },
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject invalid credentials.secretAccessKey', () => {
      const options = {
        ...validOptions,
        credentials: {
          ...validOptions.credentials,
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: '',
          },
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject paths when path is present', () => {
      const options = {
        ...validOptions,
        metadata: {
          path: '/test/path',
          paths: ['/path1'],
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject keys when path is present', () => {
      const options = {
        ...validOptions,
        metadata: {
          path: '/test/path',
          keys: ['/key1'],
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject paths array with more than 3 items', () => {
      const options = {
        ...validOptions,
        metadata: {
          paths: ['/path1', '/path2', '/path3', '/path4'],
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject keys array with more than 500 items', () => {
      const keys = Array.from({ length: 501 }, (_, i) => `/key${i}`);
      const options = {
        ...validOptions,
        metadata: {
          keys,
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject invalid enrichResponse type', () => {
      const options = {
        ...validOptions,
        enrichmentOptions: {
          enrichResponse: 'not-a-boolean',
          trimPathVariableName: true,
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });

    it('should reject invalid trimPathVariableName type', () => {
      const options = {
        ...validOptions,
        enrichmentOptions: {
          enrichResponse: true,
          trimPathVariableName: 'not-a-boolean',
        },
      };
      const { error } = JoiSchema.validate(options);
      expect(error).toBeDefined();
    });
  });
});
