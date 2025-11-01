const Helper = require('../src/helper');
const { SupportedEnvTypes } = require('../src/constants/supported-env-types');
const AWSSecretManagerService = require('../src/providers/aws-secret-manager/aws-secret-manager.service');
const AWSStoredParametersService = require('../src/providers/aws-stored-parameters/aws-stored-parameters.service');
const { JoiSchema } = require('../src/validators/schema.joi');

jest.mock('../src/providers/aws-secret-manager/aws-secret-manager.service');
jest.mock(
  '../src/providers/aws-stored-parameters/aws-stored-parameters.service',
);
jest.mock('../src/validators/schema.joi');

describe('Helper', () => {
  let helper;
  let mockAWSSecretManagerService;
  let mockAWSStoredParametersService;

  beforeEach(() => {
    helper = new Helper();
    mockAWSSecretManagerService = {
      get: jest.fn(),
    };
    mockAWSStoredParametersService = {
      get: jest.fn(),
      getByKey: jest.fn(),
    };
    AWSSecretManagerService.mockImplementation(
      () => mockAWSSecretManagerService,
    );
    AWSStoredParametersService.mockImplementation(
      () => mockAWSStoredParametersService,
    );
    JoiSchema.validate = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
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

    it('should throw error when validation fails', () => {
      const error = {
        details: [
          { message: 'credentials.region is required' },
          { message: 'metadata is required' },
        ],
      };
      JoiSchema.validate.mockReturnValue({ error });

      expect(() => helper.process(SupportedEnvTypes.AWS_SSM, {})).toThrow();
      expect(JoiSchema.validate).toHaveBeenCalledWith(
        {},
        { abortEarly: false },
      );
    });

    it('should process AWS_SSM type with path', async () => {
      JoiSchema.validate.mockReturnValue({ error: null });
      const expectedResult = { param1: 'value1', param2: 'value2' };
      mockAWSStoredParametersService.get.mockResolvedValue(expectedResult);

      const result = helper.process(SupportedEnvTypes.AWS_SSM, validOptions);
      const resolvedResult = await result;

      expect(JoiSchema.validate).toHaveBeenCalledWith(validOptions, {
        abortEarly: false,
      });
      expect(mockAWSStoredParametersService.get).toHaveBeenCalledWith(
        validOptions,
      );
      expect(resolvedResult).toEqual(expectedResult);
    });

    it('should process AWS_SSM type with paths array', async () => {
      JoiSchema.validate.mockReturnValue({ error: null });
      const optionsWithPaths = {
        ...validOptions,
        metadata: {
          paths: ['/path1', '/path2'],
        },
      };
      mockAWSStoredParametersService.get
        .mockResolvedValueOnce({ path1: 'value1' })
        .mockResolvedValueOnce({ path2: 'value2' });

      const result = helper.process(
        SupportedEnvTypes.AWS_SSM,
        optionsWithPaths,
      );
      const resolvedResult = await result;

      expect(mockAWSStoredParametersService.get).toHaveBeenCalledTimes(2);
      expect(resolvedResult).toEqual({
        '/path1': { path1: 'value1' },
        '/path2': { path2: 'value2' },
      });
    });

    it('should process AWS_SSM type with keys array', async () => {
      JoiSchema.validate.mockReturnValue({ error: null });
      const optionsWithKeys = {
        ...validOptions,
        metadata: {
          keys: ['/key1', '/key2'],
        },
      };
      mockAWSStoredParametersService.getByKey
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2');

      const result = helper.process(SupportedEnvTypes.AWS_SSM, optionsWithKeys);
      const resolvedResult = await result;

      expect(mockAWSStoredParametersService.getByKey).toHaveBeenCalledTimes(2);
      expect(resolvedResult).toEqual({
        '/key1': 'value1',
        '/key2': 'value2',
      });
    });

    it('should process AWS_SECRET_MANAGER type', async () => {
      JoiSchema.validate.mockReturnValue({ error: null });
      const optionsWithSecret = {
        ...validOptions,
        metadata: {
          secretId: 'test-secret-id',
        },
      };
      const expectedResult = { username: 'admin', password: 'secret123' };
      mockAWSSecretManagerService.get.mockResolvedValue(expectedResult);

      const result = helper.process(
        SupportedEnvTypes.AWS_SECRET_MANAGER,
        optionsWithSecret,
      );
      const resolvedResult = await result;

      expect(mockAWSSecretManagerService.get).toHaveBeenCalledWith(
        optionsWithSecret,
      );
      expect(resolvedResult).toBe(expectedResult);
    });

    it('should throw error for unsupported type', () => {
      JoiSchema.validate.mockReturnValue({ error: null });

      expect(() => helper.process('UNSUPPORTED_TYPE', validOptions)).toThrow(
        'Unsupported type !',
      );
    });

    it('should include all error messages when validation fails', () => {
      const error = {
        details: [
          { message: 'Error 1' },
          { message: 'Error 2' },
          { message: 'Error 3' },
        ],
      };
      JoiSchema.validate.mockReturnValue({ error });

      expect(() => helper.process(SupportedEnvTypes.AWS_SSM, {})).toThrow(
        /Error 1.*Error 2.*Error 3/,
      );
    });
  });

  describe('ssmProcess', () => {
    const validOptions = {
      credentials: { region: 'us-east-1' },
      metadata: { path: '/test/path' },
      enrichmentOptions: { enrichResponse: true, trimPathVariableName: true },
    };

    it('should process single path', async () => {
      const expectedResult = { param: 'value' };
      mockAWSStoredParametersService.get.mockResolvedValue(expectedResult);

      const result = await helper.ssmProcess(validOptions);

      expect(mockAWSStoredParametersService.get).toHaveBeenCalledWith(
        validOptions,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should process multiple paths', async () => {
      const optionsWithPaths = {
        ...validOptions,
        metadata: { paths: ['/path1', '/path2', '/path3'] },
      };
      mockAWSStoredParametersService.get
        .mockResolvedValueOnce({ key1: 'value1' })
        .mockResolvedValueOnce({ key2: 'value2' })
        .mockResolvedValueOnce({ key3: 'value3' });

      const result = await helper.ssmProcess(optionsWithPaths);

      expect(mockAWSStoredParametersService.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        '/path1': { key1: 'value1' },
        '/path2': { key2: 'value2' },
        '/path3': { key3: 'value3' },
      });
    });

    it('should process multiple keys', async () => {
      const optionsWithKeys = {
        ...validOptions,
        metadata: { keys: ['/key1', '/key2'] },
      };
      mockAWSStoredParametersService.getByKey
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2');

      const result = await helper.ssmProcess(optionsWithKeys);

      expect(mockAWSStoredParametersService.getByKey).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        '/key1': 'value1',
        '/key2': 'value2',
      });
    });

    it('should return empty object when no path, paths, or keys provided', async () => {
      const optionsWithoutPaths = {
        ...validOptions,
        metadata: {},
      };

      const result = await helper.ssmProcess(optionsWithoutPaths);

      expect(result).toEqual({});
    });

    it('should handle empty paths array', async () => {
      const optionsWithEmptyPaths = {
        ...validOptions,
        metadata: { paths: [] },
      };

      const result = await helper.ssmProcess(optionsWithEmptyPaths);

      expect(result).toEqual({});
    });

    it('should handle empty keys array', async () => {
      const optionsWithEmptyKeys = {
        ...validOptions,
        metadata: { keys: [] },
      };

      const result = await helper.ssmProcess(optionsWithEmptyKeys);

      expect(result).toEqual({});
    });
  });
});
