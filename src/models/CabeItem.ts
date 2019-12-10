export interface CanonCabeItem {
  id: number;
  quantity: number;
  name: string;
}

export interface CabeItem extends CanonCabeItem {
  value: number;
  done: boolean;
}
