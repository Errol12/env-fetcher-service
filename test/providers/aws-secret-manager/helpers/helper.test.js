const Helper = require('../../../../src/providers/aws-secret-manager/helpers/helper');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

jest.mock('@aws-sdk/client-secrets-manager');

describe('AWSSecretManagerService Helper', () => {
  let helper;
  let mockClient;
  let mockSend;

  beforeEach(() => {
    helper = new Helper();
    mockSend = jest.fn();
    mockClient = {
      send: mockSend,
    };
    SecretsManagerClient.mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auth', () => {
    it('should create and return a SecretsManagerClient with credentials', async () => {
      const credentials = {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
      };

      const result = await helper.auth(credentials);

      expect(SecretsManagerClient).toHaveBeenCalledWith(credentials);
      expect(result).toBe(mockClient);
    });

    it('should handle credentials with only region', async () => {
      const credentials = {
        region: 'us-west-2',
      };

      const result = await helper.auth(credentials);

      expect(SecretsManagerClient).toHaveBeenCalledWith(credentials);
      expect(result).toBe(mockClient);
    });
  });

  describe('fetchData', () => {
    it('should fetch secret data using GetSecretValueCommand', async () => {
      const secretName = 'my-secret';
      const mockResponse = {
        SecretString: JSON.stringify({ username: 'admin', password: 'secret' }),
      };
      mockSend.mockResolvedValue(mockResponse);

      const result = await helper.fetchData(mockClient, secretName);

      expect(GetSecretValueCommand).toHaveBeenCalledWith({
        SecretId: secretName,
      });
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
      expect(result).toEqual(mockResponse);
    });

    it('should handle different secret names', async () => {
      const secretName = 'another-secret';
      const mockResponse = { SecretString: '{"key": "value"}' };
      mockSend.mockResolvedValue(mockResponse);

      const result = await helper.fetchData(mockClient, secretName);

      expect(GetSecretValueCommand).toHaveBeenCalledWith({
        SecretId: secretName,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from client.send', async () => {
      const secretName = 'non-existent-secret';
      const error = new Error('Secret not found');
      mockSend.mockRejectedValue(error);

      await expect(helper.fetchData(mockClient, secretName)).rejects.toThrow(
        'Secret not found',
      );
    });
  });

  describe('enrichResponse', () => {
    it('should parse JSON SecretString', () => {
      const data = {
        SecretString: JSON.stringify({
          username: 'admin',
          password: 'secret123',
        }),
      };

      const result = helper.enrichResponse(data);

      expect(result).toEqual({ username: 'admin', password: 'secret123' });
    });

    it('should handle different JSON structures', () => {
      const data = {
        SecretString: JSON.stringify({
          database: {
            host: 'localhost',
            port: 5432,
          },
        }),
      };

      const result = helper.enrichResponse(data);

      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 5432,
        },
      });
    });

    it('should handle simple string values', () => {
      const data = {
        SecretString: JSON.stringify('simple-string-value'),
      };

      const result = helper.enrichResponse(data);

      expect(result).toBe('simple-string-value');
    });

    it('should handle array values', () => {
      const data = {
        SecretString: JSON.stringify(['item1', 'item2', 'item3']),
      };

      const result = helper.enrichResponse(data);

      expect(result).toEqual(['item1', 'item2', 'item3']);
    });
  });
});
