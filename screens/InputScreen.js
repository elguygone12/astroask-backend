import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PanchangScreen = () => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPanchang = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) throw new Error('Missing birth data');

        const parsed = JSON.parse(userData);
        const res = await fetch('https://prokerala-backend.onrender.com/api/explain/daily', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: parsed,
            language: parsed.language,
          }),
        });

        const json = await res.json();
        if (json.explanation) setExplanation(json.explanation);
        else setError('No explanation received.');
      } catch (err) {
        console.error(err);
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchPanchang();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#9d4edd" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.text}>{explanation}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#10002b',
    flexGrow: 1,
    justifyContent: 'center',
  },
  text: {
    color: '#f0f8ff',
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PanchangScreen;







