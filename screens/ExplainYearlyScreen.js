import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import COLORS from '../constants/colors';

const ExplainYearlyScreen = ({ route }) => {
  const {
    dob = '',
    time = '',
    location = { latitude: 28.6139, longitude: 77.2090, timezone: '+05:30' },
  } = route.params || {};

  const [language, setLanguage] = useState('en');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIExplanation();
  }, [language]);

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

    setLoading(true);

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        {language === 'hi' ? '🌟 AI वार्षिक भविष्यवाणी 🌟' : '🌟 AI Yearly Forecast 🌟'}
      </Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.languageButton, language === 'en' && styles.languageSelected]}
          onPress={() => setLanguage('en')}
        >
          <Text style={styles.languageText}>🇬🇧 English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.languageButton, language === 'hi' && styles.languageSelected]}
          onPress={() => setLanguage('hi')}
        >
          <Text style={styles.languageText}>🇮🇳 हिंदी</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {language === 'hi'
              ? 'वार्षिक भविष्यवाणी ला रहा है...'
              : 'Generating Yearly Forecast...'}
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {language === 'hi' ? '🔮 भविष्यवाणी विवरण' : '🔮 Forecast Details'}
          </Text>
          <Text style={styles.cardText}>{explanation}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#1F0033',
    borderWidth: 1,
    borderColor: '#7F00FF',
  },
  languageSelected: {
    backgroundColor: '#7F00FF',
  },
  languageText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
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

export default ExplainYearlyScreen;






