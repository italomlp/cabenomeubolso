import React from 'react';
import { SectionList } from 'react-native';
import { MaskService } from 'react-native-masked-text';

import { CabeItem } from '@app/models/CabeItem';

import {
  ValueItemContainer,
  ValueItemText,
  ValueItemTitle,
  ValuesContainer,
  SectionHeader,
  ItemRow,
  ItemText,
  ListItem,
  ValueRestText,
  ListHeaderContainer,
} from './styles';

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

  const getRestText = () => {
    const diff = maxValue - currentValue;
    if (diff > 0) {
      return `Restam: ${MaskService.toMask('money', diff.toFixed(2))}`;
    }

    if (diff === 0) {
      return 'Você gastou exatamente o valor previsto';
    }

    return `Você gastou ${MaskService.toMask(
      'money',
      diff.toFixed(2),
    )} a mais que o previsto`;
  };

  return (
    <>
      <SectionList
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <ListHeaderContainer>
            <ValuesContainer>
              <ValueItemContainer>
                <ValueItemTitle>Pode Gastar</ValueItemTitle>
                <ValueItemText healthy>
                  {MaskService.toMask('money', maxValue.toFixed(2))}
                </ValueItemText>
              </ValueItemContainer>
              <ValueItemContainer>
                <ValueItemTitle>Já gastou</ValueItemTitle>
                <ValueItemText healthy={currentValue <= maxValue}>
                  {MaskService.toMask('money', currentValue.toFixed(2))}
                </ValueItemText>
              </ValueItemContainer>
            </ValuesContainer>
            <ValueRestText>{getRestText()}</ValueRestText>
          </ListHeaderContainer>
        }
        data={items}
        keyExtractor={(item: any) => item.id}
        sections={makeSections()}
        renderSectionHeader={({ section: { title, data } }) =>
          data && data.length ? <SectionHeader>{title}</SectionHeader> : null
        }
        renderItem={({ item, section: { done } }) => (
          <ListItem
            onPress={() => onClickItem(item)}
            done={done}
            title={
              <ItemRow>
                <ItemText>
                  {item.quantity}x {item.name}
                </ItemText>
                {done && (
                  <ItemText>
                    {MaskService.toMask('money', item.value.toFixed(2))}
                  </ItemText>
                )}
              </ItemRow>
            }
          />
        )}
      />
    </>
  );
}
