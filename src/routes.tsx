import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Main from 'pages/Main';
import CabeSave from 'pages/CabeSave';
import CabeProcess from 'pages/CabeProcess';
import FinalizedCabeView from 'pages/FinalizedCabeView';

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
