import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import CabeProcess from '@app/pages/CabeProcess';
import CabeSave from '@app/pages/CabeSave';
import FinalizedCabeView from '@app/pages/FinalizedCabeView';
import Main from '@app/pages/Main';

const MainStack = createStackNavigator();

const MainNavigator = () => (
  <MainStack.Navigator headerMode="none">
    <MainStack.Screen name="Main" component={Main} />
    <MainStack.Screen name="CabeSave" component={CabeSave} />
    <MainStack.Screen name="CabeProcess" component={CabeProcess} />
    <MainStack.Screen name="FinalizedCabeView" component={FinalizedCabeView} />
  </MainStack.Navigator>
);

export default MainNavigator;
