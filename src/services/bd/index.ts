import { Cabe } from 'models/Cabe';
import Realm from 'realm';

import CabeItemSchema from './schemas/CabeItemSchema';
import CabeSchema from './schemas/CabeSchema';

class RealmAPI {
  realmInstance: Realm;

  constructor() {
    this.realmInstance = new Realm({ schema: [CabeItemSchema, CabeSchema] });
    console.tron.log('realm', this.realmInstance, this.realmInstance.path);
  }

  getAllCabes = () => {
    const list = this.realmInstance.objects<Cabe>('Cabe');
    return [
      ...list.map(({ id, name, items, value, createdAt, finalized }: Cabe) => ({
        id,
        name,
        items,
        value,
        createdAt,
        finalized,
      })),
    ];
  };

  getCabeById = (idToSearch: number): Cabe => {
    const {
      id,
      name,
      items,
      value,
      createdAt,
      finalized,
    } = this.realmInstance
      .objects<Cabe>('Cabe')
      .filtered(`id == ${idToSearch}`)[0];
    return { id, name, items, value, createdAt, finalized };
  };

  createCabe = (c: Cabe) => {
    let returnCabe;
    this.realmInstance.write(() => {
      const {
        id,
        name,
        items,
        value,
        createdAt,
        finalized,
      } = this.realmInstance.create('Cabe', c);
      returnCabe = { id, name, items, value, createdAt, finalized };
    });
    return returnCabe;
  };

  updateCabe = (c: Cabe) => {
    let returnCabe;
    this.realmInstance.write(() => {
      const {
        id,
        name,
        items,
        value,
        createdAt,
        finalized,
      } = this.realmInstance.create('Cabe', c, Realm.UpdateMode.Modified);
      returnCabe = { id, name, items, value, createdAt, finalized };
    });
    return returnCabe;
  };

  deleteCabe = (id: number) => {
    const c = this.realmInstance
      .objects<Cabe>('Cabe')
      .filtered(`id == ${id}`)[0];
    this.realmInstance.write(() => {
      this.realmInstance.delete(c);
    });
  };
}

export default new RealmAPI();
