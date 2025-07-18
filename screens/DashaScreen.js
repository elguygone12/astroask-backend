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

const DashaScreen = ({ route }) => {
  const { dob, time, location, language = 'en' } = route.params;
  const [dashaData, setDashaData] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

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
            language,
          }),
        });

        const json = await response.json();
        console.log('👉 Dasha API Response:', json);

        if (json.data) {
          setDashaData(json.data);
          fetchAIExplanation(json.data); // Trigger ChatGPT
        } else {
          Alert.alert('Error', 'No Dasha data received.');
        }
      } catch (error) {
        console.error('❌ Dasha fetch error:', error);
        Alert.alert('Error', 'Failed to fetch Dasha.');
      } finally {
        setLoadingData(false);
      }
    };

    const fetchAIExplanation = async (data) => {
      setLoadingAI(true);
      try {
        const res = await fetch('https://prokerala-backend.onrender.com/api/explain/dasha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, language }),
        });

        const json = await res.json();
        console.log('👉 Dasha ChatGPT Response:', json);
        setExplanation(json.explanation || 'No explanation received.');
      } catch (err) {
        console.error('❌ Dasha AI error:', err);
        setExplanation('Failed to load Dasha explanation.');
      } finally {
        setLoadingAI(false);
      }
    };

    fetchDasha();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Dasha Periods</Text>

      {loadingData ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Dasha periods...</Text>
        </View>
      ) : dashaData && dashaData.length > 0 ? (
        <>
          {dashaData.map((dasha, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{dasha.planet?.name || 'Unknown Planet'}</Text>
              <Text style={styles.cardText}>From: {dasha.start}</Text>
              <Text style={styles.cardText}>To: {dasha.end}</Text>
            </View>
          ))}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧠 AI Explanation</Text>
            {loadingAI ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.cardText}>{explanation}</Text>
            )}
          </View>
        </>
      ) : (
        <Text style={styles.cardText}>No Dasha data available.</Text>
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
    marginTop: 10,
    color: COLORS.text,
  },
});

export default DashaScreen;






