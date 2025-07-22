import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import COLORS from '../constants/colors';

const ChartScreen = ({ route }) => {
  const { dob, time, location } = route.params;
  const [language, setLanguage] = useState('en');
  const [chartData, setChartData] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchChart();
  }, [language]);

  const fetchChart = async () => {
    try {
      const response = await fetch('https://astroask-backend.onrender.com/api/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob,
          time,
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: '+05:30',
        }),
      });

      const text = await response.text();
      console.log('📦 Raw backend response:', text);

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error('❌ JSON parse error:', e, '\nRaw:', text);
        Alert.alert('Error', 'Invalid response from server.');
        return;
      }

      if (json.data?.data) {
        setChartData(json.data.data);
        fetchExplanation(json.data.data);
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
      const res = await fetch('https://astroask-backend.onrender.com/api/explain/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, language }),
      });

      const json = await res.json();
      console.log('🌐 AI response:', json);
      setExplanation(json.explanation || 'No explanation received.');
    } catch (err) {
      console.error('❌ Chart GPT error:', err);
      setExplanation('Failed to load explanation.');
    } finally {
      setLoadingAI(false);
    }
  };

  const { nakshatra, chandra_rasi, soorya_rasi, additional_info } = chartData || {};

  return (
    <ImageBackground
      source={require('../assets/backgrounds/kundli.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>✨ Your Astrology Chart ✨</Text>

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

        {loadingChart ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🌟 Nakshatra Details</Text>
              <Text style={styles.cardText}>Name: {nakshatra?.name}</Text>
              <Text style={styles.cardText}>Pada: {nakshatra?.pada}</Text>
              <Text style={styles.cardText}>Rashi: {chandra_rasi?.name}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔮 Rashi</Text>
              <Text style={styles.cardText}>Moon Sign: {chandra_rasi?.name}</Text>
              <Text style={styles.cardText}>Sun Sign: {soorya_rasi?.name}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>✨ Additional Info</Text>
              <Text style={styles.cardText}>Deity: {additional_info?.deity}</Text>
              <Text style={styles.cardText}>Animal: {additional_info?.animal_sign}</Text>
              <Text style={styles.cardText}>Color: {additional_info?.color}</Text>
              <Text style={styles.cardText}>Syllables: {additional_info?.syllables}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🧠 AI Explanation ({language === 'hi' ? 'हिंदी' : 'English'})</Text>
              {loadingAI ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.cardText}>{explanation}</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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

export default ChartScreen;











