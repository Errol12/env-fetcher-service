const AWSSecretManagerService = require('../../../src/providers/aws-secret-manager/aws-secret-manager.service');
const Helper = require('../../../src/providers/aws-secret-manager/helpers/helper');

jest.mock('../../../src/providers/aws-secret-manager/helpers/helper');

describe('AWSSecretManagerService', () => {
  let service;
  let mockHelper;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      send: jest.fn(),
    };
    mockHelper = {
      auth: jest.fn(),
      fetchData: jest.fn(),
      enrichResponse: jest.fn(),
    };
    Helper.mockImplementation(() => mockHelper);
    service = new AWSSecretManagerService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should fetch and enrich secret manager data', async () => {
      const options = {
        credentials: {
          region: 'us-east-1',
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret',
          },
        },
        metadata: {
          secretId: 'my-secret-id',
        },
      };
      const mockSecretData = {
        SecretString: JSON.stringify({
          username: 'admin',
          password: 'secret123',
        }),
      };
      const enrichedData = { username: 'admin', password: 'secret123' };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchData.mockResolvedValue(mockSecretData);
      mockHelper.enrichResponse.mockReturnValue(enrichedData);

      const result = await service.get(options);

      expect(mockHelper.auth).toHaveBeenCalledWith(options.credentials);
      expect(mockHelper.fetchData).toHaveBeenCalledWith(
        mockClient,
        options.metadata.secretId,
      );
      expect(mockHelper.enrichResponse).toHaveBeenCalledWith(mockSecretData);
      expect(result).toEqual(enrichedData);
    });

    it('should handle different secret IDs', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { secretId: 'another-secret-id' },
      };
      const mockSecretData = { SecretString: '{"key": "value"}' };
      const enrichedData = { key: 'value' };

      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchData.mockResolvedValue(mockSecretData);
      mockHelper.enrichResponse.mockReturnValue(enrichedData);

      const result = await service.get(options);

      expect(mockHelper.fetchData).toHaveBeenCalledWith(
        mockClient,
        'another-secret-id',
      );
      expect(result).toEqual(enrichedData);
    });

    it('should handle errors from auth', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { secretId: 'test-secret' },
      };
      const error = new Error('Authentication failed');
      mockHelper.auth.mockRejectedValue(error);

      await expect(service.get(options)).rejects.toThrow(
        'Authentication failed',
      );
      expect(mockHelper.fetchData).not.toHaveBeenCalled();
      expect(mockHelper.enrichResponse).not.toHaveBeenCalled();
    });

    it('should handle errors from fetchData', async () => {
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { secretId: 'test-secret' },
      };
      const error = new Error('Failed to fetch secret');
      mockHelper.auth.mockResolvedValue(mockClient);
      mockHelper.fetchData.mockRejectedValue(error);

      await expect(service.get(options)).rejects.toThrow(
        'Failed to fetch secret',
      );
      expect(mockHelper.enrichResponse).not.toHaveBeenCalled();
    });
  });
});
