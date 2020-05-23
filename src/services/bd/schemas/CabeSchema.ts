import { ObjectSchema } from 'realm';

export default class CabeSchema {
  static schema: ObjectSchema = {
    name: 'Cabe',
    primaryKey: 'id',
    properties: {
      id: { type: 'string', indexed: true },
      createdAt: { type: 'date', default: new Date() },
      name: 'string',
      value: 'float',
      usedValue: { type: 'float', default: 0 },
      items: 'CabeItem[]',
      finalized: { type: 'bool', default: false },
      finalizedAt: { type: 'date', optional: true },
    },
  };
}
