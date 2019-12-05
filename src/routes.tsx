import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Main from 'pages/Main';
import CabeInfo from 'pages/CabeInfo';

const Routes = createAppContainer(
  createStackNavigator(
    {
      Main,
      CabeInfo,
    },
    {
      headerMode: 'none',
    }
  )
);

export default Routes;
