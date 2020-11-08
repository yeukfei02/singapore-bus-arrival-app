import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

import NearMe from '../nearMe/NearMe';
import Search from '../search/Search';
import Settings from '../settings/Settings';

const Tab = createBottomTabNavigator();

function MainView(): JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let icon = null;

            switch (route.name) {
              case 'NearMe':
                icon = focused ? (
                  <FontAwesome name="location-arrow" size={size} color={color} />
                ) : (
                  <FontAwesome name="location-arrow" size={size} color={color} />
                );
                break;
              case 'Search':
                icon = focused ? (
                  <FontAwesome name="search" size={size} color={color} />
                ) : (
                  <FontAwesome name="search" size={size} color={color} />
                );
                break;
              case 'Settings':
                icon = focused ? (
                  <MaterialIcons name="settings" size={size} color={color} />
                ) : (
                  <MaterialIcons name="settings" size={size} color={color} />
                );
                break;
              default:
                break;
            }

            return icon;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="NearMe" component={NearMe} />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default MainView;
