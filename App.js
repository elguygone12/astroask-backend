import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LicenseScreen from './screens/LicenseScreen';
import InputScreen from './screens/InputScreen';
import ChartScreen from './screens/ChartScreen';
import DashaScreen from './screens/DashaScreen';
import YearlyForecastScreen from './screens/YearlyForecastScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="License" screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="License"
          component={LicenseScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Input"
          component={InputScreen}
          options={{ title: 'Enter Birth Details' }}
        />
        <Stack.Screen
          name="Chart"
          component={ChartScreen}
          options={{ title: 'Your Chart' }}
        />
        <Stack.Screen
          name="Dasha"
          component={DashaScreen}
          options={{ title: 'Dasha Periods' }}
        />
        <Stack.Screen
          name="YearlyForecast"
          component={YearlyForecastScreen}
          options={{ title: 'Yearly Forecast' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
