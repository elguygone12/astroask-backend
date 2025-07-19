import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NumerologyScreen = () => {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNumerology = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (!stored) throw new Error('No saved user data found.');
        const userData = JSON.parse(stored);

        const response = await fetch('https://your-backend-url.com/api/numerology', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name || 'User', // fallback if name isn't saved
            dob: userData.dob,
            language: userData.language || 'en',
          }),
        });

        const data = await response.json();
        if (data.explanation) {
          setReport(data.explanation);
        } else {
          throw new Error('No report received.');
        }
      } catch (err) {
        console.error('❌ Numerology fetch error:', err);
        setError('Failed to fetch numerology report.');
      } finally {
        setLoading(false);
      }
    };

    fetchNumerology();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9d4edd" />
        <Text style={styles.loading}>Fetching Numerology Report...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.text}>{report}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10002b',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#f0f8ff',
    lineHeight: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10002b',
  },
  loading: {
    color: '#ccc',
    marginTop: 10,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default NumerologyScreen;
