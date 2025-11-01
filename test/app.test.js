const App = require('../src/app');
const Helper = require('../src/helper');

jest.mock('../src/helper');

describe('App', () => {
  let app;
  let mockHelper;

  beforeEach(() => {
    mockHelper = {
      process: jest.fn(),
    };
    Helper.mockImplementation(() => mockHelper);
    app = new App();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('version', () => {
    it('should return the package version', () => {
      const version = app.version();
      expect(version).toBe('2.0.0');
    });
  });

  describe('extractEnv', () => {
    it('should call helper.process with correct parameters', () => {
      const type = 'AWS_SSM';
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { path: '/test' },
        enrichmentOptions: { enrichResponse: true, trimPathVariableName: true },
      };
      const expectedResult = { key: 'value' };
      mockHelper.process.mockReturnValue(expectedResult);

      const result = app.extractEnv(type, options);

      expect(Helper).toHaveBeenCalledTimes(1);
      expect(mockHelper.process).toHaveBeenCalledWith(type, options);
      expect(result).toBe(expectedResult);
    });

    it('should handle async results from helper.process', async () => {
      const type = 'AWS_SECRET_MANAGER';
      const options = {
        credentials: { region: 'us-east-1' },
        metadata: { secretId: 'test-secret' },
        enrichmentOptions: { enrichResponse: true, trimPathVariableName: true },
      };
      const expectedResult = Promise.resolve({ secret: 'data' });
      mockHelper.process.mockReturnValue(expectedResult);

      const result = app.extractEnv(type, options);

      expect(mockHelper.process).toHaveBeenCalledWith(type, options);
      if (result instanceof Promise) {
        const resolvedResult = await result;
        expect(resolvedResult).toEqual({ secret: 'data' });
      } else {
        expect(result).toBe(expectedResult);
      }
    });
  });
});
