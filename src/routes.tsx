import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Main from 'pages/Main';
import CabeSave from 'pages/CabeSave';
import CabeProcess from 'pages/CabeProcess';
import FinalizedCabeView from 'pages/FinalizedCabeView';

const Routes = createAppContainer(
  createStackNavigator(
    {
      Main,
      CabeSave,
      CabeProcess,
      FinalizedCabeView,
    },
    {
      headerMode: 'none',
    }
  )
);

export default Routes;
