import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import NearMe from '../nearMe/NearMe';
import BusArrivalDetails from '../busArrivalDetails/BusArrivalDetails';

const Stack = createStackNavigator();

function NearMeView(): JSX.Element {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NearMe" component={NearMe} />
        <Stack.Screen name="BusArrivalDetails" component={BusArrivalDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default NearMeView;
