import { CabeItem } from './CabeItem';

export interface CanonCabe {
  name: string;
  id: string;
  value: number;
  items: CabeItem[];
}

export interface Cabe extends CanonCabe {
  createdAt: Date;
  finalized: boolean;
  finalizedAt?: Date;
}
