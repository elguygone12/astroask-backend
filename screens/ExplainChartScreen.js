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

const ExplainChartScreen = ({ route }) => {
  const { chartData, language = 'en' } = route.params || {};
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getExplanation = async () => {
      if (!chartData) {
        Alert.alert('Error', 'Chart data is missing.');
        return;
      }

      try {
        const response = await fetch(
          'https://prokerala-backend.onrender.com/api/explain/chart',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: chartData, language }),
          }
        );

        const json = await response.json();

        if (json.explanation) {
          setExplanation(json.explanation);
        } else if (json.error) {
          Alert.alert('Error', json.error);
        } else {
          Alert.alert('Error', 'Unexpected response from server.');
        }
      } catch (error) {
        console.error('❌ Error getting chart explanation:', error);
        Alert.alert('Error', 'Failed to get explanation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getExplanation();
  }, [chartData]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Chart Explanation</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating explanation...</Text>
        </View>
      ) : (
        <Text style={styles.explanation}>{explanation}</Text>
      )}
    </ScrollView>
  );
};

export default ExplainChartScreen;

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
  explanation: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
});




