import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LicenseScreen from './screens/LicenseScreen';
import InputScreen from './screens/InputScreen';
import ChartScreen from './screens/ChartScreen';
import DashaScreen from './screens/DashaScreen';
import ExplainChartScreen from './screens/ExplainChartScreen'; // ✅ Add this
import ExplainDashaScreen from './screens/ExplainDashaScreen'; // ✅ Add this
import ExplainYearlyScreen from './screens/ExplainYearlyScreen';

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
          component={ExplainYearlyScreen}
          options={{ title: 'Yearly Forecast (AI)' }}
        />
        <Stack.Screen
          name="ExplainChart"
          component={ExplainChartScreen}
          options={{ title: 'Chart Explanation (AI)' }}
        />
        <Stack.Screen
          name="ExplainDasha"
          component={ExplainDashaScreen}
          options={{ title: 'Dasha Explanation (AI)' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
