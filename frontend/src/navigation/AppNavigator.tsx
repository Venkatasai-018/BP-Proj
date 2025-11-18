import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import BusListScreen from '../screens/BusListScreen';
import RoutesScreen from '../screens/RoutesScreen';
import BusTrackingScreen from '../screens/BusTrackingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BusStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BusList" 
        component={BusListScreen}
        options={{ title: 'Buses' }}
      />
      <Stack.Screen 
        name="BusTracking" 
        component={BusTrackingScreen}
        options={{ title: 'Bus Tracking' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'Buses') {
              iconName = 'directions-bus';
            } else if (route.name === 'Routes') {
              iconName = 'route';
            }

            return <MaterialIcons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Buses" component={BusStack} />
        <Tab.Screen name="Routes" component={RoutesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;