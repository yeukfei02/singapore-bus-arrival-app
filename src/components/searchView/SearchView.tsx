import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Search from '../search/Search';
import BusArrivalDetails from '../busArrivalDetails/BusArrivalDetails';
import BusMapView from '../busMapView/BusMapView';

const Stack = createStackNavigator();

function SearchView(): JSX.Element {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="BusArrivalDetails" component={BusArrivalDetails} />
        <Stack.Screen name="BusMapView" component={BusMapView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default SearchView;
