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

const ExplainYearlyScreen = ({ route }) => {
  const {
    dob = '',
    time = '',
    location = { latitude: 28.6139, longitude: 77.2090, timezone: '+05:30' },
    language = 'en',
  } = route.params || {};

  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYearlyExplanation = async () => {
      if (!dob || !time) {
        Alert.alert(
          language === 'hi' ? 'जानकारी अधूरी है' : 'Missing Info',
          language === 'hi'
            ? 'कृपया जन्म तिथि और समय दर्ज करें।'
            : 'Please enter DOB and time.'
        );
        setLoading(false);
        return;
      }

      try {
        // Step 1: Get raw yearly forecast data
        const yearlyRes = await fetch('https://prokerala-backend.onrender.com/api/yearly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datetime: `${dob}T${time}`,
            coordinates: `${location.latitude},${location.longitude}`,
            timezone: location.timezone,
            language,
          }),
        });

        const yearlyJson = await yearlyRes.json();
        const forecastData = yearlyJson.data;

        if (!forecastData) {
          throw new Error('No forecast data returned');
        }

        // Step 2: Ask GPT to explain it
        const gptRes = await fetch('https://prokerala-backend.onrender.com/api/explain/yearly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: forecastData,
            language,
          }),
        });

        const gptJson = await gptRes.json();

        if (gptJson.explanation) {
          setExplanation(gptJson.explanation);
        } else {
          throw new Error('No explanation received');
        }
      } catch (error) {
        console.error('❌ Yearly GPT error:', error);
        setExplanation(
          language === 'hi'
            ? 'वार्षिक भविष्यवाणी लोड करने में विफल।'
            : 'Failed to load yearly forecast.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyExplanation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {language === 'hi'
            ? 'वार्षिक भविष्यवाणी ला रहा है...'
            : 'Explaining Yearly Forecast...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        {language === 'hi'
          ? 'वार्षिक भविष्यवाणी की व्याख्या'
          : 'Yearly Forecast Explanation'}
      </Text>
      <Text style={styles.explanation}>{explanation}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    textAlign: 'left',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default ExplainYearlyScreen;


