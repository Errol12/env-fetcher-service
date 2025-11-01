const App = require('../src/index');
const { App: AppNamed } = require('../src/index');

describe('index.js', () => {
  it('should export App as default export', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
    expect(App.name).toBe('App');
  });

  it('should export App as named export', () => {
    expect(AppNamed).toBeDefined();
    expect(typeof AppNamed).toBe('function');
    expect(AppNamed.name).toBe('App');
  });

  it('should allow instantiation via default export', () => {
    const app = new App();
    expect(app).toBeInstanceOf(App);
    expect(app.version).toBeDefined();
  });

  it('should allow instantiation via named export', () => {
    const app = new AppNamed();
    expect(app).toBeInstanceOf(AppNamed);
    expect(app.version).toBeDefined();
  });
});
