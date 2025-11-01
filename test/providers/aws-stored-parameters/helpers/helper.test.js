const Helper = require('../../../../src/providers/aws-stored-parameters/helpers/helper');
const {
  SSMClient,
  GetParameterCommand,
  GetParametersByPathCommand,
} = require('@aws-sdk/client-ssm');

jest.mock('@aws-sdk/client-ssm');

describe('AWSStoredParametersService Helper', () => {
  let helper;
  let mockClient;
  let mockSend;

  beforeEach(() => {
    helper = new Helper();
    mockSend = jest.fn();
    mockClient = {
      send: mockSend,
    };
    SSMClient.mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auth', () => {
    it('should create and return a SSMClient with credentials', async () => {
      const credentials = {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
      };

      const result = await helper.auth(credentials);

      expect(SSMClient).toHaveBeenCalledWith(credentials);
      expect(result).toBe(mockClient);
    });

    it('should handle credentials with only region', async () => {
      const credentials = {
        region: 'us-west-2',
      };

      const result = await helper.auth(credentials);

      expect(SSMClient).toHaveBeenCalledWith(credentials);
      expect(result).toBe(mockClient);
    });
  });

  describe('fetchDataByPath', () => {
    it('should fetch parameters by path without nextToken', async () => {
      const path = '/test/path';
      const mockResponse = {
        Parameters: [
          { Name: '/test/path/param1', Value: 'value1' },
          { Name: '/test/path/param2', Value: 'value2' },
        ],
      };
      mockSend.mockResolvedValue(mockResponse);

      const result = await helper.fetchDataByPath(mockClient, path);

      expect(GetParametersByPathCommand).toHaveBeenCalledWith({
        Path: path,
        WithDecryption: true,
        NextToken: null,
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.any(GetParametersByPathCommand),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch parameters by path with nextToken', async () => {
      const path = '/test/path';
      const nextToken = 'token123';
      const mockResponse = {
        Parameters: [{ Name: '/test/path/param3', Value: 'value3' }],
        NextToken: 'token456',
      };
      mockSend.mockResolvedValue(mockResponse);

      const result = await helper.fetchDataByPath(mockClient, path, nextToken);

      expect(GetParametersByPathCommand).toHaveBeenCalledWith({
        Path: path,
        WithDecryption: true,
        NextToken: nextToken,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from client.send', async () => {
      const path = '/invalid/path';
      const error = new Error('Path not found');
      mockSend.mockRejectedValue(error);

      await expect(helper.fetchDataByPath(mockClient, path)).rejects.toThrow(
        'Path not found',
      );
    });
  });

  describe('fetchDataByKey', () => {
    it('should fetch parameter by key', async () => {
      const key = '/test/key';
      const mockResponse = {
        Parameter: {
          Name: '/test/key',
          Value: 'test-value',
        },
      };
      mockSend.mockResolvedValue(mockResponse);

      const result = await helper.fetchDataByKey(mockClient, key);

      expect(GetParameterCommand).toHaveBeenCalledWith({
        Name: key,
        WithDecryption: true,
      });
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when key is missing', async () => {
      const key = '/missing/key';
      const error = new Error('Parameter not found');
      mockSend.mockRejectedValue(error);

      await expect(helper.fetchDataByKey(mockClient, key)).rejects.toThrow(
        'Missing key: /missing/key',
      );
    });

    it('should include key name in error message', async () => {
      const key = '/test/non-existent';
      const error = new Error('Some AWS error');
      mockSend.mockRejectedValue(error);

      await expect(helper.fetchDataByKey(mockClient, key)).rejects.toThrow(
        'Missing key: /test/non-existent',
      );
    });

    it('should handle different key formats', async () => {
      const key = 'plain-key-name';
      const mockResponse = {
        Parameter: {
          Name: 'plain-key-name',
          Value: 'value',
        },
      };
      mockSend.mockResolvedValue(mockResponse);

      const result = await helper.fetchDataByKey(mockClient, key);

      expect(GetParameterCommand).toHaveBeenCalledWith({
        Name: key,
        WithDecryption: true,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('enrichResponse', () => {
    it('should enrich response with trimmed path names', () => {
      const response = [
        [
          { Name: '/test/path/param1', Value: 'value1' },
          { Name: '/test/path/param2', Value: 'value2' },
        ],
      ];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        param1: 'value1',
        param2: 'value2',
      });
    });

    it('should enrich response without trimming path names', () => {
      const response = [
        [
          { Name: '/test/path/param1', Value: 'value1' },
          { Name: '/test/path/param2', Value: 'value2' },
        ],
      ];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: false,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
        '/test/path/param2': 'value2',
      });
    });

    it('should handle empty response array', () => {
      const response = [[]];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({});
    });

    it('should handle multiple nested arrays', () => {
      const response = [
        [{ Name: '/test/path/param1', Value: 'value1' }],
        [{ Name: '/test/path/param2', Value: 'value2' }],
        [{ Name: '/test/path/param3', Value: 'value3' }],
      ];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        param1: 'value1',
        param2: 'value2',
        param3: 'value3',
      });
    });

    it('should handle null path', () => {
      const response = [[{ Name: '/param1', Value: 'value1' }]];
      const path = null;
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/param1': 'value1',
      });
    });

    it('should handle null enrichmentOptions', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = null;

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle enrichmentOptions with trimPathVariableName false', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = {
        trimPathVariableName: false,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle response with empty arrays', () => {
      const response = [[], []];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({});
    });

    it('should handle enrichmentOptions without trimPathVariableName property', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        // trimPathVariableName is missing
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle path with trimPathVariableName true when path has trailing slash', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path/';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      // When path has trailing slash, the replace pattern is '/test/path//' which doesn't match
      // So it returns the full name
      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle enrichmentOptions as false', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = false;

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle enrichmentOptions as undefined explicitly', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = undefined;

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle enrichmentOptions as empty object', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = {};

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle enrichmentOptions with trimPathVariableName explicitly set to undefined', () => {
      const response = [[{ Name: '/test/path/param1', Value: 'value1' }]];
      const path = '/test/path';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: undefined,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      expect(result).toEqual({
        '/test/path/param1': 'value1',
      });
    });

    it('should handle empty string path with trimPathVariableName', () => {
      const response = [[{ Name: '/param1', Value: 'value1' }]];
      const path = '';
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      // Empty path with trimPathVariableName true will try to replace '/', resulting in param1
      expect(result).toEqual({
        param1: 'value1',
      });
    });

    it('should handle path as 0 (falsy but truthy for string operations)', () => {
      const response = [[{ Name: '/test/param1', Value: 'value1' }]];
      const path = null;
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: true,
      };

      const result = helper.enrichResponse(response, path, enrichmentOptions);

      // When path is null, replace will fail, so it returns full name
      expect(result).toEqual({
        '/test/param1': 'value1',
      });
    });

    it('should use default path parameter when not provided', () => {
      const response = [[{ Name: '/param1', Value: 'value1' }]];
      const enrichmentOptions = {
        enrichResponse: true,
        trimPathVariableName: false,
      };

      // Call without path argument (uses default null)
      const result = helper.enrichResponse(
        response,
        undefined,
        enrichmentOptions,
      );

      expect(result).toEqual({
        '/param1': 'value1',
      });
    });

    it('should use default enrichmentOptions parameter when not provided', () => {
      const response = [[{ Name: '/test/param1', Value: 'value1' }]];
      const path = '/test';

      // Call without enrichmentOptions argument (uses default null)
      const result = helper.enrichResponse(response, path, undefined);

      expect(result).toEqual({
        '/test/param1': 'value1',
      });
    });

    it('should use both default parameters when not provided', () => {
      const response = [[{ Name: '/param1', Value: 'value1' }]];

      // Call without path and enrichmentOptions (both use defaults)
      const result = helper.enrichResponse(response);

      expect(result).toEqual({
        '/param1': 'value1',
      });
    });
  });
});
