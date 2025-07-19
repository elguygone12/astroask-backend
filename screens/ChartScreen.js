import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import COLORS from '../constants/colors';

const ChartScreen = ({ route }) => {
  const { dob, time, location, language = 'en' } = route.params;
  const [chartData, setChartData] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

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

        const text = await response.text(); // fetch as text for debugging
        console.log('📦 Raw backend response:', text);

        const json = JSON.parse(text); // attempt to parse JSON

        if (json.data) {
          setChartData(json.data);
          fetchExplanation(json.data); // call ChatGPT after data
        } else {
          Alert.alert('Error', 'Chart data not available.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load chart data.');
        console.error('❌ Chart fetch error:', error);
      } finally {
        setLoadingChart(false);
      }
    };

    const fetchExplanation = async (data) => {
      setLoadingAI(true);
      try {
        const res = await fetch('https://prokerala-backend.onrender.com/api/explain/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, language }),
        });

        const json = await res.json();
        setExplanation(json.explanation || 'No explanation received.');
      } catch (err) {
        console.error('❌ Chart GPT error:', err);
        setExplanation('Failed to load explanation.');
      } finally {
        setLoadingAI(false);
      }
    };

    fetchChart();
  }, []);

  const { nakshatra_details, mangal_dosha, yoga_details } = chartData || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Astrology Chart</Text>

      {loadingChart ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      ) : (
        <>
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
              <Text key={index} style={styles.cardText}>
                - {yoga.name}: {yoga.description}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧠 AI Explanation</Text>
            {loadingAI ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.cardText}>{explanation}</Text>
            )}
          </View>
        </>
      )}
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
  center: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 10,
  },
});

export default ChartScreen;







