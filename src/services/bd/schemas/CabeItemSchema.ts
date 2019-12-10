import { ObjectSchema } from 'realm';

export default class CabeItemSchema {
  static schema: ObjectSchema = {
    name: 'CabeItem',
    primaryKey: 'id',
    properties: {
      id: { type: 'int', indexed: true },
      name: 'string',
      quantity: 'int',
      value: { type: 'float', default: 0 },
      done: { type: 'bool', default: false },
    },
  };
}
