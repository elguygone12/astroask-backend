import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const PanchangScreen = ({ route }) => {
  const { dob, latitude, longitude, timezone, language } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [panchang, setPanchang] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dob || !latitude || !longitude || !timezone) {
      setError('Missing birth details');
      setLoading(false);
      return;
    }

    const fetchPanchang = async () => {
      try {
        const response = await fetch('https://prokerala-backend.onrender.com/api/panchang', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dob,
            latitude,
            longitude,
            timezone,
            language,
          }),
        });

        const data = await response.json();
        setPanchang(data);
      } catch (err) {
        console.error('Error fetching Panchang:', err);
        setError('Failed to fetch Panchang');
      } finally {
        setLoading(false);
      }
    };

    fetchPanchang();
  }, [dob, latitude, longitude, timezone, language]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9d4edd" />
        <Text style={styles.loadingText}>Loading Panchang...</Text>
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
      <Text style={styles.title}>📜 Daily Panchang</Text>
      <Text style={styles.label}>Sunrise:</Text>
      <Text style={styles.value}>{panchang?.sunrise || 'N/A'}</Text>

      <Text style={styles.label}>Sunset:</Text>
      <Text style={styles.value}>{panchang?.sunset || 'N/A'}</Text>

      <Text style={styles.label}>Tithi:</Text>
      <Text style={styles.value}>{panchang?.tithi?.name || 'N/A'}</Text>

      <Text style={styles.label}>Nakshatra:</Text>
      <Text style={styles.value}>{panchang?.nakshatra?.name || 'N/A'}</Text>

      <Text style={styles.label}>Yog:</Text>
      <Text style={styles.value}>{panchang?.yog?.name || 'N/A'}</Text>

      <Text style={styles.label}>Karan:</Text>
      <Text style={styles.value}>{panchang?.karan?.name || 'N/A'}</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#f0f8ff',
    marginTop: 12,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#f0f8ff',
    marginBottom: 8,
  },
  center: {
    flex: 1,
    backgroundColor: '#10002b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#ccc',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default PanchangScreen;
