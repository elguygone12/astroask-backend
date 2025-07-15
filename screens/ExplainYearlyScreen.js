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
    const fetchAIExplanation = async () => {
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
        const res = await fetch('https://prokerala-backend.onrender.com/api/explain/yearly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { dob, time, location },
            language,
          }),
        });

        const json = await res.json();
        setExplanation(json.explanation || 'No explanation received.');
      } catch (error) {
        console.error('❌ Yearly AI error:', error);
        setExplanation(
          language === 'hi'
            ? 'वार्षिक भविष्यवाणी लोड करने में विफल।'
            : 'Failed to load yearly forecast.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAIExplanation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {language === 'hi'
            ? 'वार्षिक भविष्यवाणी ला रहा है...'
            : 'Generating Yearly Forecast...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        {language === 'hi' ? 'AI वार्षिक भविष्यवाणी' : 'AI Yearly Forecast'}
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





