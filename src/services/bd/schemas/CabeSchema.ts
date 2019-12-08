import { ObjectSchema } from 'realm';

export default class CabeSchema {
  static schema: ObjectSchema = {
    name: 'Cabe',
    primaryKey: 'id',
    properties: {
      id: { type: 'int', indexed: true },
      name: 'string',
      value: 'float',
      items: 'CabeItem[]',
    },
  };
}
