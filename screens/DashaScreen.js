import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from '../constants/colors';

const DashaScreen = ({ route }) => {
  const { dob, time, location, language } = route.params;
  const [dashaData, setDashaData] = useState(null);

  useEffect(() => {
    const fetchDasha = async () => {
      try {
        const response = await fetch('https://prokerala-backend.onrender.com/api/dasha', {
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
        setDashaData(json.data);
      } catch (error) {
        console.error('❌ Dasha fetch error:', error);
      }
    };

    fetchDasha();
  }, []);

  if (!dashaData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dasha Periods...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Dasha Periods</Text>
      {dashaData.map((dasha, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{dasha.planet?.name || 'Unknown Planet'}</Text>
          <Text style={styles.cardText}>From: {dasha.start}</Text>
          <Text style={styles.cardText}>To: {dasha.end}</Text>
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
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    color: COLORS.text,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default DashaScreen;

