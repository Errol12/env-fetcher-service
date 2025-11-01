const packageJson = require('../package.json');
const Helper = require('./helper');

class App {
  version() {
    return packageJson.version;
  }

  extractEnv(type, options) {
    const logic = new Helper();
    return logic.process(type, options);
  }
}

module.exports = App;
