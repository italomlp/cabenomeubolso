import { CabeItem } from './CabeItem';

export interface Cabe {
  name: string;
  id: number;
  value: number;
  items: CabeItem[];
}
