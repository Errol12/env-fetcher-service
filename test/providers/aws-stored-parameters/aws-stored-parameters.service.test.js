const AWSStoredParametersService = require('../../../src/providers/aws-stored-parameters/aws-stored-parameters.service');
const Helper = require('../../../src/providers/aws-stored-parameters/helpers/helper');

jest.mock('../../../src/providers/aws-stored-parameters/helpers/helper');

describe('AWSStoredParametersService', () => {
  let service;
  let mockHelper;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      send: jest.fn(),
    };
    mockHelper = {
      auth: jest.fn(),
      fetchDataByPath: jest.fn(),
      fetchDataByKey: jest.fn(),
      enrichResponse: jest.fn(),
    };
    Helper.mockImplementation(() => mockHelper);
    service = new AWSStoredParametersService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should fetch parameters by path without pagination', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const mockResponse = {
        Parameters: [
          { Name: '/test/path/param1', Value: 'value1' },
          { Name: '/test/path/param2', Value: 'value2' },
        ],
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath.mockResolvedValue(mockResponse);

      const result = await service.get(options);

      expect(mockHelper.auth).toHaveBeenCalledWith(options.credentials);
      expect(mockHelper.fetchDataByPath).toHaveBeenCalledWith(
        mockClient,
        options.metadata.path,
        null,
      );
      expect(result).toEqual(mockResponse.Parameters);
    });

    it('should fetch parameters by path with pagination', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const firstResponse = {
        Parameters: [{ Name: '/test/path/param1', Value: 'value1' }],
        NextToken: 'token123',
      };
      const secondResponse = {
        Parameters: [{ Name: '/test/path/param2', Value: 'value2' }],
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const result = await service.get(options);

      expect(mockHelper.fetchDataByPath).toHaveBeenCalledTimes(2);
      expect(mockHelper.fetchDataByPath).toHaveBeenNthCalledWith(
        1,
        mockClient,
        '/test/path',
        null,
      );
      expect(mockHelper.fetchDataByPath).toHaveBeenNthCalledWith(
        2,
        mockClient,
        '/test/path',
        'token123',
      );
      expect(result).toEqual([
        ...firstResponse.Parameters,
        ...secondResponse.Parameters,
      ]);
    });

    it('should enrich response when enrichResponse is true', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: { enrichResponse: true, trimPathVariableName: true },
      };
      const mockResponse = {
        Parameters: [{ Name: '/test/path/param1', Value: 'value1' }],
      };
      const enrichedData = { param1: 'value1' };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath.mockResolvedValue(mockResponse);
      mockHelper.enrichResponse.mockReturnValue(enrichedData);

      const result = await service.get(options);

      expect(mockHelper.enrichResponse).toHaveBeenCalledWith(
        [mockResponse.Parameters],
        options.metadata.path,
        options.enrichmentOptions,
      );
      expect(result).toEqual(enrichedData);
    });

    it('should handle multiple pagination iterations', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const responses = [
        {
          Parameters: [{ Name: 'param1', Value: 'value1' }],
          NextToken: 'token1',
        },
        {
          Parameters: [{ Name: 'param2', Value: 'value2' }],
          NextToken: 'token2',
        },
        { Parameters: [{ Name: 'param3', Value: 'value3' }] },
      ];

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2]);

      const result = await service.get(options);

      expect(mockHelper.fetchDataByPath).toHaveBeenCalledTimes(3);
      expect(result).toEqual([
        ...responses[0].Parameters,
        ...responses[1].Parameters,
        ...responses[2].Parameters,
      ]);
    });

    it('should handle response without NextToken property', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const mockResponse = {
        Parameters: [{ Name: '/test/path/param1', Value: 'value1' }],
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath.mockResolvedValue(mockResponse);

      const result = await service.get(options);

      expect(mockHelper.fetchDataByPath).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.Parameters);
    });

    it('should handle storedParams with null Parameters', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const mockResponse = {
        Parameters: null,
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath.mockResolvedValue(mockResponse);

      const result = await service.get(options);

      expect(mockHelper.fetchDataByPath).toHaveBeenCalledTimes(1);
      expect(result).toEqual([null]);
    });

    it('should handle storedParams with undefined NextToken', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const mockResponse = {
        Parameters: [{ Name: '/test/path/param1', Value: 'value1' }],
        NextToken: undefined,
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath.mockResolvedValue(mockResponse);

      const result = await service.get(options);

      expect(mockHelper.fetchDataByPath).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.Parameters);
    });

    it('should handle empty Parameters array', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test/path' },
        enrichmentOptions: {
          enrichResponse: false,
          trimPathVariableName: false,
        },
      };
      const mockResponse = {
        Parameters: [],
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByPath.mockResolvedValue(mockResponse);

      const result = await service.get(options);

      expect(result).toEqual([]);
    });
  });

  describe('getByKey', () => {
    it('should fetch parameter value by key', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { key: '/test/key' },
      };
      const mockResponse = {
        Parameter: {
          Name: '/test/key',
          Value: 'test-value',
        },
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByKey.mockResolvedValue(mockResponse);

      const result = await service.getByKey(options);

      expect(mockHelper.auth).toHaveBeenCalledWith(options.credentials);
      expect(mockHelper.fetchDataByKey).toHaveBeenCalledWith(
        mockClient,
        options.metadata.key,
      );
      expect(result).toBe('test-value');
    });

    it('should return null when Parameter is missing', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { key: '/test/key' },
      };
      const mockResponse = {};

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByKey.mockResolvedValue(mockResponse);

      const result = await service.getByKey(options);

      expect(result).toBeNull();
    });

    it('should return null when Parameter.Value is missing', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { key: '/test/key' },
      };
      const mockResponse = {
        Parameter: {
          Name: '/test/key',
        },
      };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByKey.mockResolvedValue(mockResponse);

      const result = await service.getByKey(options);

      expect(result).toBeNull();
    });

    it('should handle errors from fetchDataByKey', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { key: '/test/key' },
      };
      const error = new Error('Missing key: /test/key');
      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchDataByKey.mockRejectedValue(error);

      await expect(service.getByKey(options)).rejects.toThrow(
        'Missing key: /test/key',
      );
    });
  });
});
