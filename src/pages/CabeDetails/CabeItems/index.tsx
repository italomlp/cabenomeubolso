import React from 'react';
import { View, Text, SectionList } from 'react-native';
import { CabeItem } from 'models/CabeItem';
import { TouchableOpacity } from 'react-native-gesture-handler';

// import { Container } from './styles';

const ITEMS = [
  {
    id: 1,
    name: 'Item 1',
    quantity: 3,
    done: false,
  },
  {
    id: 2,
    name: 'Item 2',
    quantity: 3,
    done: false,
  },
  {
    id: 3,
    name: 'Item 3',
    quantity: 2,
    done: false,
  },
  {
    id: 4,
    name: 'Item 4',
    quantity: 1,
    done: true,
  },
];

type Props = {
  onClickItem: (item: CabeItem) => void;
};

export default function CabeItems({ onClickItem }: Props) {
  const makeSections = () => [
    {
      title: 'Não finalizados',
      data: ITEMS.filter(i => i.done === false),
      lowOpacity: false,
    },
    {
      title: 'Finalizados',
      data: ITEMS.filter(i => i.done === true),
      lowOpacity: true,
    },
  ];

  return (
    <>
      <View>
        <Text>Quanto você pode gastar?</Text>
        <View>
          <Text>R$ 450,00</Text>
        </View>
      </View>
      <View>
        <Text>Quanto você já gastou?</Text>
        <View>
          <Text>R$ 400,00</Text>
        </View>
      </View>

      <SectionList
        data={ITEMS}
        keyExtractor={(item: any) => item.id}
        sections={makeSections()}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        renderItem={({ item, section: { lowOpacity } }) => (
          <TouchableOpacity
            onPress={() => onClickItem(item)}
            style={{ opacity: lowOpacity ? 0.2 : 1 }}
          >
            <Text>{item.quantity}x</Text>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
}
