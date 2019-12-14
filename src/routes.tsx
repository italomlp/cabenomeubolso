import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Main from 'pages/Main';
import CabeInfo from 'pages/CabeInfo';
import CabeDetails from 'pages/CabeDetails';
import FinalizedCabeView from 'pages/FinalizedCabeView';

const Routes = createAppContainer(
  createStackNavigator(
    {
      Main,
      CabeInfo,
      CabeDetails,
      FinalizedCabeView,
    },
    {
      headerMode: 'none',
    }
  )
);

export default Routes;
