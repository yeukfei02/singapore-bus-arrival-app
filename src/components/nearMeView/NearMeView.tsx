import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import NearMe from '../nearMe/NearMe';
import BusArrivalDetails from '../busArrivalDetails/BusArrivalDetails';
import BusServiceRoutes from '../busServiceRoutes/BusServiceRoutes';

const Stack = createStackNavigator();

function NearMeView(): JSX.Element {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NearMe" component={NearMe} />
        <Stack.Screen name="BusArrivalDetails" component={BusArrivalDetails} />
        <Stack.Screen name="BusServiceRoutes" component={BusServiceRoutes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default NearMeView;
