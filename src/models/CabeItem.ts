export interface CanonCabeItem {
  id: string;
  quantity: number;
  name: string;
}

export interface CabeItem extends CanonCabeItem {
  value: number;
  done: boolean;
}
