import { Cabe } from 'models/Cabe';
import realm, { UpdateMode } from 'realm';

import CabeItemSchema from './schemas/CabeItemSchema';
import CabeSchema from './schemas/CabeSchema';

export function getRealm() {
  return realm.open({ schema: [CabeItemSchema, CabeSchema] });
}

class RealmAPI {
  // @ts-ignore
  realmInstance: realm;

  constructor() {
    this.initRealm();
  }

  initRealm = async () => {
    this.realmInstance = await getRealm();
    console.tron.log('realm path', this.realmInstance.path);
  };

  getAllCabes = () => {
    const list = this.realmInstance.objects<Cabe>('Cabe');
    return [
      ...list.map(({ id, name, items, value }) => ({
        id,
        name,
        items,
        value,
      })),
    ];
  };

  getCabeById = (idToSearch: number): Cabe => {
    const { id, name, items, value } = this.realmInstance
      .objects<Cabe>('Cabe')
      .filtered(`id == ${idToSearch}`)[0];
    return { id, name, items, value };
  };

  createCabe = (c: Cabe) => {
    let returnCabe;
    this.realmInstance.write(() => {
      const { id, name, items, value } = this.realmInstance.create('Cabe', c);
      returnCabe = { id, name, items, value };
    });
    return returnCabe;
  };

  updateCabe = (c: Cabe) => {
    let returnCabe;
    this.realmInstance.write(() => {
      const { id, name, items, value } = this.realmInstance.create(
        'Cabe',
        c,
        UpdateMode.Modified
      );
      returnCabe = { id, name, items, value };
    });
    return returnCabe;
  };

  deleteCabe = (c: Cabe) => {
    this.realmInstance.write(() => {
      this.realmInstance.delete(c);
    });
  };
}

export default new RealmAPI();
