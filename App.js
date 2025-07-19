import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LicenseScreen from './screens/LicenseScreen';
import InputScreen from './screens/InputScreen';
import ChartScreen from './screens/ChartScreen';
import DashaScreen from './screens/DashaScreen';
import ExplainYearlyScreen from './screens/ExplainYearlyScreen';
import DailyScreen from './screens/DailyScreen';
import PanchangScreen from './screens/PanchangScreen';
import NumerologyScreen from './screens/NumerologyScreen';
import MarriageMatchScreen from './screens/MarriageMatchScreen';
import PDFReportScreen from './screens/PDFReportScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="License" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="License" component={LicenseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Input" component={InputScreen} options={{ title: 'Enter Birth Details' }} />
        <Stack.Screen name="Chart" component={ChartScreen} options={{ title: 'Your Chart' }} />
        <Stack.Screen name="Dasha" component={DashaScreen} options={{ title: 'Dasha Periods' }} />
        <Stack.Screen name="YearlyForecast" component={ExplainYearlyScreen} options={{ title: 'AI Yearly Forecast' }} />
        <Stack.Screen name="Daily" component={DailyScreen} options={{ title: 'Daily Horoscope' }} />
        <Stack.Screen name="Panchang" component={PanchangScreen} options={{ title: 'Panchang' }} />
        <Stack.Screen name="Numerology" component={NumerologyScreen} options={{ title: 'Numerology' }} />
        <Stack.Screen name="MarriageMatch" component={MarriageMatchScreen} options={{ title: 'Marriage Matching' }} />
        <Stack.Screen name="PDFReport" component={PDFReportScreen} options={{ title: 'Download PDF Report' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
