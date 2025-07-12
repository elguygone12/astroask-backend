import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from '../constants/colors';

const YearlyForecastScreen = ({ route }) => {
  const { dob, time, location, language } = route.params;
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await fetch('https://astroask-backend.onrender.com/api/yearly', {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dob,
            time,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
            language: language || 'en',
          }),
        });

        const text = await response.text();
        console.log('🌐 RAW response:', text);

        try {
          const json = JSON.parse(text);
          setForecastData(json.data);
        } catch (e) {
          console.error('❌ Failed to parse forecast:', e);
        }
      } catch (error) {
        console.error('Error fetching forecast:', error);
      }
    };

    fetchForecast();
  }, []);

  if (!forecastData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Yearly Forecast...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Yearly Forecast</Text>
      {forecastData.map((month, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{month.month}</Text>
          <Text style={styles.cardText}>{month.summary}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    color: COLORS.text,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default YearlyForecastScreen;
