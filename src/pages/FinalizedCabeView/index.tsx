import React, { useEffect } from 'react';
import { SectionList, Alert } from 'react-native';
import { MaskService } from 'react-native-masked-text';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigationParam, useNavigation } from 'react-navigation-hooks';
import { format } from 'date-fns';

import { getCabeRequest, removeCabeRequest } from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';
import { Header, Button } from 'components';

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
  FinalizedAtText,
} from './styles';

export default function FinalizedCabeView() {
  const dispatch = useDispatch();
  const cabeId = useNavigationParam('cabeId');
  const { goBack } = useNavigation();
  const cabe = useSelector((state: RootStore) => state.cabes.current);

  useEffect(() => {
    dispatch(getCabeRequest(cabeId));
  }, []);

  const makeSections = () => {
    if (cabe) {
      return [
        {
          title: 'Finalizados',
          data: cabe.items.filter(i => i.done === true),
          done: true,
        },
        {
          title: 'Não finalizados',
          data: cabe.items.filter(i => i.done === false),
          done: false,
        },
      ];
    }

    return [];
  };

  const removeCabe = () => {
    if (cabe) {
      Alert.alert(
        'Remover Cabe?',
        `Deseja remover o Cabe ${cabe.name}? Esta ação não pode ser desfeita.`,
        [
          { text: 'Não' },
          {
            text: 'Sim',
            onPress: () => {
              dispatch(removeCabeRequest(cabe.id));
              goBack();
            },
          },
        ]
      );
    }
  };

  const getMaxValue = () => (cabe ? cabe.value : 0);
  const getCurrentValue = () =>
    cabe
      ? cabe.items.reduce(
          (previousValue, currentValue) =>
            currentValue.value * currentValue.quantity + previousValue,
          0
        )
      : 0;

  return (
    <>
      <Header
        leftIcon={{ name: 'arrow-back', onPress: goBack }}
        title={cabe ? cabe.name : 'Ver Cabe'}
      />
      <SectionList
        ListHeaderComponent={
          <ListHeaderContainer>
            {!!cabe && cabe.finalizedAt && (
              <FinalizedAtText>
                Finalizado em: {format(cabe.finalizedAt, 'dd/MM/yyyy')}
              </FinalizedAtText>
            )}
            <ValuesContainer>
              <ValueItemContainer>
                <ValueItemTitle>Podia Gastar</ValueItemTitle>
                <ValueItemText healthy>
                  {MaskService.toMask('money', getMaxValue().toFixed(2))}
                </ValueItemText>
              </ValueItemContainer>
              <ValueItemContainer>
                <ValueItemTitle>Gastou</ValueItemTitle>
                <ValueItemText healthy={getCurrentValue() <= getMaxValue()}>
                  {MaskService.toMask('money', getCurrentValue().toFixed(2))}
                </ValueItemText>
              </ValueItemContainer>
            </ValuesContainer>
            <ValueRestText>
              Quanto restou:{' '}
              {MaskService.toMask(
                'money',
                (getMaxValue() - getCurrentValue()).toFixed(2)
              )}
            </ValueRestText>
          </ListHeaderContainer>
        }
        ListFooterComponent={
          <Button
            title="Excluir"
            gradient="primary"
            onPress={() => removeCabe()}
            containerStyle={{ marginVertical: 20, marginHorizontal: 10 }}
          />
        }
        data={cabe ? cabe.items : []}
        keyExtractor={(item: any) => item.id}
        sections={makeSections()}
        renderSectionHeader={({ section: { title, data } }) =>
          data && data.length ? <SectionHeader>{title}</SectionHeader> : null
        }
        renderItem={({ item, section: { done } }) => (
          <ListItem
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
