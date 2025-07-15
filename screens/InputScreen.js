import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constants/colors';

const InputScreen = ({ navigation }) => {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async () => {
    if (!dob || !time || !location) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return;
    }

    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=46faf81b36274dcdae05a3031fa8afca`
      );
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        Alert.alert('Invalid Location', 'Could not find coordinates for the entered location.');
        return;
      }

      const { lat, lng } = data.results[0].geometry;
      const offsetSeconds = data.results[0].annotations.timezone.offset_sec;
      const sign = offsetSeconds >= 0 ? '+' : '-';
      const absOffset = Math.abs(offsetSeconds);
      const hours = Math.floor(absOffset / 3600)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((absOffset % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const timezone = `${sign}${hours}:${minutes}`;

      const userData = {
        dob,
        time,
        location: {
          latitude: lat,
          longitude: lng,
          timezone,
        },
        language: 'en',
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      if (navigation && navigation.navigate) {
        navigation.navigate('Chart', userData);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      Alert.alert('Error', 'Failed to fetch coordinates. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Birth Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (e.g. 2001-04-23)"
        value={dob}
        onChangeText={setDob}
      />
      <TextInput
        style={styles.input}
        placeholder="Time of Birth (e.g. 12:53)"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Place of Birth (e.g. Delhi)"
        value={location}
        onChangeText={setLocation}
      />

      <Button title="Continue" onPress={handleSubmit} color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.text,
  },
});

export default InputScreen;

