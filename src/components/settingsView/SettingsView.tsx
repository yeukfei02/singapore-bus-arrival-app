import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Settings from '../settings/Settings';
import SingaporeMrtMapPdf from '../singaporeMrtMapPdf/SingaporeMrtMapPdf';

const Stack = createStackNavigator();

function SettingsView(): JSX.Element {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="SingaporeMrtMapPdf" component={SingaporeMrtMapPdf} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default SettingsView;
