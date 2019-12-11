import React from 'react';
import { View, Text, SectionList } from 'react-native';
import { CabeItem } from 'models/CabeItem';
import { ListItem } from 'react-native-elements';

// import { Container } from './styles';

type Props = {
  items: CabeItem[];
  maxValue: number;
  currentValue: number;
  onClickItem: (item: CabeItem) => void;
};

export default function CabeItems({
  onClickItem,
  items,
  maxValue,
  currentValue,
}: Props) {
  const makeSections = () => [
    {
      title: 'Não finalizados',
      data: items.filter(i => i.done === false),
      done: false,
    },
    {
      title: 'Finalizados',
      data: items.filter(i => i.done === true),
      done: true,
    },
  ];

  return (
    <>
      <View>
        <Text>Quanto você pode gastar?</Text>
        <View>
          <Text>R$ {maxValue}</Text>
        </View>
      </View>
      <View>
        <Text>Quanto você já gastou?</Text>
        <View>
          <Text>R$ {currentValue}</Text>
        </View>
      </View>

      <SectionList
        data={items}
        keyExtractor={(item: any) => item.id}
        sections={makeSections()}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        renderItem={({ item, section: { done } }) => (
          <ListItem
            onPress={() => onClickItem(item)}
            style={{ opacity: done ? 0.2 : 1 }}
            title={
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text>
                  <Text>{item.quantity}x </Text>
                  <Text>{item.name}</Text>
                </Text>
                {done && <Text>{item.value}</Text>}
              </View>
            }
          />
        )}
      />
    </>
  );
}
