import { Injectable } from '@nestjs/common';
import { Helper } from './helper';
import { SchemaDto } from './validators/schema.dto';
@Injectable()
export class App {
  getHello(): string {
    return 'v1.1';
  }

  extractEnv(type, options: SchemaDto): any {
    const logic = new Helper();
    return logic.process(type, options);
  }
}
