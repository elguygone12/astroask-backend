import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

const ChartScreen = ({ route }) => {
  const { dob, time, location, language } = route.params;
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      console.log('📤 Sending fetch to backend...');
      console.log('📡 Sending chart request...');
      try {
        const response = await fetch('https://astroask-backend.onrender.com/api/kundli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dob,
            time,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
          }),
        });

        const text = await response.text();
        console.log('📥 RAW response:', text);

        const json = JSON.parse(text);
        setChartData(json.data);
      } catch (error) {
        console.error('❌ Error fetching chart:', error);
      }
    };

    fetchChart();
  }, []);

  // 🔁 Show loading screen while waiting
  if (!chartData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Chart...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Astrology Chart</Text>
      {Object.entries(chartData).map(([key, value], index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{key}</Text>
          <Text style={styles.cardText}>{String(value)}</Text>
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
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.text,
  },
});

export default ChartScreen;
