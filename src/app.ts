import { Injectable } from '@nestjs/common';
import { Helper } from './helper';
const packageJson = require('../package.json');
@Injectable()
export class App {
  version(): string {
    return packageJson.version;
  }

  extractEnv(type, options): any {
    const logic = new Helper();
    return logic.process(type, options);
  }
}
