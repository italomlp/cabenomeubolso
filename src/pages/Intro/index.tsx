import React from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useDispatch } from 'react-redux';
import { markIntroAsViewed } from '@app/store/modules/meta/actions';
import colors from '@app/styles/colors';

import { Icon } from 'react-native-elements';
import { StatusBar } from 'react-native';
import {
  SlideContainer,
  SlideContent,
  SlideTitle,
  SlideSubtitle,
  SlideDescription,
} from './styles';

const slides = [
  {
    key: 'buylist',
    title: 'Listas de Compras',
    subtitle: 'Faça e organize suas listas de compras',
    text:
      'Desde feira de casa a uma lista de roupas, tenha tudo em mãos facilmente',
    icon: 'format-list-bulleted',
    colors: [colors.c200, colors.c100],
  },
  {
    key: 'buytotal',
    title: 'Quanto está gastando',
    subtitle: 'Acompanhe o quanto está gastando no momento da compra',
    text:
      'Insira os valores ao marcar itens como concluídos e tenha o total de gastos instantaneamente',
    icon: 'monetization-on',
    colors: [colors.c400, colors.c300],
  },
  {
    key: 'buysurprise',
    title: 'Sem surpresas',
    subtitle: 'Não tenha surpresas na hora do caixa',
    text:
      'Com o total sendo exibido no app, você sabe o que esperar na hora do caixa, e ainda pode escolher adicionar ou remover alguns itens',
    icon: 'local-atm',
    colors: [colors.c500, colors.c400],
  },
];

export default function Intro() {
  const dispatch = useDispatch();
  const onDone = () => {
    dispatch(markIntroAsViewed());
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <AppIntroSlider
        renderItem={({ item }) => (
          <SlideContainer
            colors={item.colors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0, y: 0.5 }}
          >
            <SlideContent>
              <Icon name={item.icon} color={colors.n100} size={200} />
              <SlideTitle>{item.title}</SlideTitle>
              <SlideSubtitle>{item.subtitle}</SlideSubtitle>
              <SlideDescription>{item.text}</SlideDescription>
            </SlideContent>
          </SlideContainer>
        )}
        slides={slides}
        onDone={onDone}
        nextLabel="Próximo"
        prevLabel="Anterior"
        doneLabel="Concluir"
        skipLabel="Pular"
        showPrevButton
        showSkipButton
      />
    </>
  );
}
