import { CabeItem } from '@app/models/CabeItem';
import { Cabe } from '@app/models/Cabe';
import Realm from 'realm';

import CabeItemSchema from './schemas/CabeItemSchema';
import CabeSchema from './schemas/CabeSchema';

class RealmAPI {
  realmInstance: Realm;

  constructor() {
    this.realmInstance = new Realm({
      schema: [CabeItemSchema, CabeSchema],
      schemaVersion: 2,
      migration: (oldRealm, newRealm) => {
        if (oldRealm.schemaVersion < 2) {
          const oldCabeItems = oldRealm.objects<CabeItem & { id: number }>(
            'CabeItem',
          );
          const newCabeItems = newRealm.objects<CabeItem>('CabeItem');

          for (let i = 0; i < oldCabeItems.length; i += 1) {
            newCabeItems[i].id = String(oldCabeItems[i].id);
          }

          const oldCabes = oldRealm.objects<Cabe & { id: number }>('Cabe');
          const newCabes = newRealm.objects<Cabe>('Cabe');

          for (let i = 0; i < oldCabes.length; i += 1) {
            newCabes[i].id = String(oldCabes[i].id);
          }
        }
      },
    });
    // console.tron.log('realm', this.realmInstance, this.realmInstance.path);
  }

  getAllCabes = () => {
    const list = this.realmInstance.objects<Cabe>('Cabe');
    return [
      ...list.map(
        ({
          id,
          name,
          items,
          value,
          createdAt,
          finalized,
          finalizedAt,
        }: Cabe) => ({
          id,
          name,
          items,
          value,
          createdAt,
          finalized,
          finalizedAt,
        }),
      ),
    ];
  };

  getCabeById = (idToSearch: string): Cabe => {
    const {
      id,
      name,
      items,
      value,
      createdAt,
      finalized,
      finalizedAt,
    } = this.realmInstance
      .objects<Cabe>('Cabe')
      .filtered(`id == "${idToSearch}"`)[0];
    return { id, name, items, value, createdAt, finalized, finalizedAt };
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
        finalizedAt,
      } = this.realmInstance.create('Cabe', c);
      returnCabe = {
        id,
        name,
        items,
        value,
        createdAt,
        finalized,
        finalizedAt,
      };
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
        finalizedAt,
      } = this.realmInstance.create('Cabe', c, Realm.UpdateMode.Modified);
      returnCabe = {
        id,
        name,
        items,
        value,
        createdAt,
        finalized,
        finalizedAt,
      };
    });
    return returnCabe;
  };

  deleteCabe = (id: string) => {
    const c = this.realmInstance
      .objects<Cabe>('Cabe')
      .filtered(`id == "${id}"`)[0];
    this.realmInstance.write(() => {
      this.realmInstance.delete(c);
    });
  };
}

export default new RealmAPI();
