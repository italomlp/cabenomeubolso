import { CabeItem } from './CabeItem';

export interface CanonCabe {
  name: string;
  id: number;
  value: number;
  items: CabeItem[];
}

export interface Cabe extends CanonCabe {
  createdAt: Date;
  finalized: boolean;
  finalizedAt?: Date;
}
