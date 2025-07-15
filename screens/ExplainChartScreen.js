import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import COLORS from '../constants/colors';

const ExplainDashaScreen = ({ route }) => {
  const { dob, time, location, language } = route.params;
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        const response = await fetch('https://prokerala-backend.onrender.com/api/explain-dasha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dob,
            time,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
            language,
          }),
        });

        const data = await response.json();
        setExplanation(data.explanation);
      } catch (error) {
        console.error('Error fetching explanation:', error);
        setExplanation('❌ Failed to load explanation. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Getting AI explanation of Dasha...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Dasha Explanation by AI</Text>
      <Text style={styles.text}>{explanation}</Text>
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
  text: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ExplainDashaScreen;





