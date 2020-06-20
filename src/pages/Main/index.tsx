import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootStore } from '@app/store/modules/rootReducer';
import Intro from '@app/pages/Intro';
import CabesList from '@app/pages/CabesList';
import RNBootSplash from 'react-native-bootsplash';

// import { Container } from './styles';

export default function Main() {
  const introViewed = useSelector((state: RootStore) => state.meta.introViewed);

  useEffect(() => {
    RNBootSplash.hide({ duration: 250 });
  }, []);

  if (introViewed) {
    return <CabesList />;
  }

  return <Intro />;
}
