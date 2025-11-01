const {
  SupportedEnvTypes,
} = require('../../src/constants/supported-env-types');

describe('SupportedEnvTypes', () => {
  it('should export AWS_SSM constant', () => {
    expect(SupportedEnvTypes.AWS_SSM).toBe('AWS_SSM');
  });

  it('should export AWS_SECRET_MANAGER constant', () => {
    expect(SupportedEnvTypes.AWS_SECRET_MANAGER).toBe('AWS_SECRET_MANAGER');
  });

  it('should have exactly two supported types', () => {
    const keys = Object.keys(SupportedEnvTypes);
    expect(keys.length).toBe(2);
    expect(keys).toContain('AWS_SSM');
    expect(keys).toContain('AWS_SECRET_MANAGER');
  });
});
