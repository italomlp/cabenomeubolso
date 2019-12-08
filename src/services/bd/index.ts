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
    return list;
  };

  getCabeById = (id: number): Cabe => {
    const cabe = this.realmInstance
      .objects<Cabe>('Cabe')
      .filtered(`id == ${id}`)[0];
    return cabe;
  };

  createCabe = (c: Cabe) => {
    let returnCabe;
    this.realmInstance.write(() => {
      returnCabe = this.realmInstance.create('Cabe', c);
    });
    return returnCabe;
  };

  updateCabe = (c: Cabe) => {
    let returnCabe;
    this.realmInstance.write(() => {
      returnCabe = this.realmInstance.create('Cabe', c, UpdateMode.Modified);
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
