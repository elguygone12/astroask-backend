import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Button } from 'react-native';
import COLORS from '../constants/colors';

const ChartScreen = ({ route, navigation }) => {
  const { dob, time, location, language } = route.params;
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
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
            language: language || 'en',
          }),
        });

        const json = await response.json();
        setChartData(json.data);
      } catch (error) {
        console.error('Error fetching kundli:', error);
      }
    };

    fetchChart();
  }, []);

  if (!chartData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Kundli Chart...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Kundli Chart</Text>

      {chartData.planets.map((planet, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{planet.name}</Text>
          <Text style={styles.cardText}>Sign: {planet.sign.name}</Text>
          <Text style={styles.cardText}>Degree: {planet.degree.toFixed(2)}</Text>
          <Text style={styles.cardText}>House: {planet.house}</Text>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Birth Details</Text>

        <Text style={styles.detailText}>
          Ascendant (Lagna): {chartData.ascendant.sign.name}
        </Text>

        <Text style={styles.detailText}>
          Moon Sign: {chartData.moon.sign.name}
        </Text>

        <Text style={styles.detailText}>
          Nakshatra: {chartData.moon.nakshatra.name}
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="View Dasha Periods"
          color={COLORS.primary}
          onPress={() =>
            navigation.navigate('Dasha', {
              dob,
              time,
              location,
              language,
            })
          }
        />
        <View style={{ height: 12 }} />
        <Button
          title="View Yearly Forecast"
          color={COLORS.primary}
          onPress={() =>
            navigation.navigate('YearlyForecast', {
              dob,
              time,
              location,
              language,
            })
          }
        />
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
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  cardTitle: {
    color: COLORS.primary,
    fontSize: 18,
    marginBottom: 6,
  },
  cardText: {
    color: COLORS.text,
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 24,
  },
});

export default ChartScreen;