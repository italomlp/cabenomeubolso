import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import { CabeItem } from 'models/CabeItem';

type CabeSaveContextType = {
  cabeValue: {
    name: string;
    value: number;
    items: CabeItem[];
  };
  addItem: (item: CabeItem) => void;
  editItem: (i: number, item: CabeItem) => void;
  removeItem: (i: number) => void;
  setName: (newName: string) => void;
  setValue: (newValue: number) => void;
  setItems: (newItems: CabeItem[]) => void;
};

const CabeSaveContext = createContext<CabeSaveContextType>(
  {} as CabeSaveContextType,
);

type Props = {
  children: React.ReactElement;
};

const CabeSaveProvider: React.FC<Props> = ({ children }: Props) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [items, setItems] = useState<CabeItem[]>([]);

  const addItem = useCallback(
    (item: CabeItem) => {
      setItems([...items, item]);
    },
    [items],
  );

  const editItem = useCallback(
    (i: number, item: CabeItem) => {
      if (i >= 0) {
        const itemsCopy = [...items];
        itemsCopy[i] = item;
        setItems(itemsCopy);
      }
    },
    [items],
  );

  const removeItem = useCallback(
    (i: number) => {
      if (i >= 0) {
        const itemsCopy = [...items];
        itemsCopy.splice(i, 1);
        setItems(itemsCopy);
      }
    },
    [items],
  );

  const contextValue = useMemo(
    () => ({
      cabeValue: {
        name,
        value,
        items,
      },
      addItem,
      removeItem,
      editItem,
      setName,
      setValue,
      setItems,
    }),
    [name, value, items, addItem, removeItem, editItem],
  );

  return (
    <CabeSaveContext.Provider value={contextValue}>
      {children}
    </CabeSaveContext.Provider>
  );
};

const useCabeSave = (): CabeSaveContextType => {
  const context = useContext(CabeSaveContext);

  if (!context) {
    throw new Error('useCabeSave must be used within a CabeSaveProvider');
  }

  return context;
};

export { CabeSaveProvider, useCabeSave };
