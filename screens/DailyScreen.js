import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

const DailyScreen = ({ route }) => {
  const { dob, language } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dob) {
      setError('Date of Birth is missing.');
      setLoading(false);
      return;
    }

    const fetchDaily = async () => {
      try {
        const response = await fetch('https://prokerala-backend.onrender.com/api/daily', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dob, language }),
        });

        const json = await response.json();
        setDailyData(json);
      } catch (err) {
        console.error('Error fetching daily horoscope:', err);
        setError('Failed to load daily horoscope');
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
  }, [dob, language]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9d4edd" />
        <Text style={styles.loadingText}>Loading daily horoscope...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🗓️ Daily Horoscope</Text>
      <Text style={styles.section}>Sign: {dailyData?.sign || 'N/A'}</Text>
      <Text style={styles.horoscope}>{dailyData?.prediction || 'No prediction available.'}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10002b',
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    color: '#f0f8ff',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    color: '#f0f8ff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  horoscope: {
    fontSize: 16,
    color: '#f0f8ff',
    lineHeight: 24,
  },
  center: {
    flex: 1,
    backgroundColor: '#10002b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#ccc',
  },
});

export default DailyScreen;
