import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

const ChartScreen = ({ route }) => {
  const { dob, time, location, language } = route.params;
  const [chartData, setChartData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const response = await fetch('https://prokerala-backend.onrender.com/api/kundli', {
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
        const json = JSON.parse(text);

        if (json.data) {
          setChartData(json.data);
        } else {
          setErrorMsg('Unexpected response format from server.');
        }
      } catch (error) {
        setErrorMsg('Network or parsing error. Please try again later.');
      }
    };

    fetchChart();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Chart...</Text>
      </View>
    );
  }

  const { nakshatra_details, mangal_dosha, yoga_details } = chartData;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Astrology Chart</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nakshatra</Text>
        <Text style={styles.cardText}>Name: {nakshatra_details?.nakshatra?.name}</Text>
        <Text style={styles.cardText}>Pada: {nakshatra_details?.nakshatra?.pada}</Text>
        <Text style={styles.cardText}>Rashi: {nakshatra_details?.chandra_rasi?.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mangal Dosha</Text>
        <Text style={styles.cardText}>{mangal_dosha?.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Yogas</Text>
        {yoga_details?.map((yoga, index) => (
          <Text key={index} style={styles.cardText}>- {yoga.name}: {yoga.description}</Text>
        ))}
      </View>
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ChartScreen;


