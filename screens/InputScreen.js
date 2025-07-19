import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import COLORS from '../constants/colors';

const InputScreen = ({ navigation }) => {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [isAM, setIsAM] = useState(true);
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadSavedData = async () => {
      const data = await AsyncStorage.getItem('userData');
      try {
        if (data) {
          const parsed = JSON.parse(data);
          setDob(parsed.dob || '');
          setTime(parsed.time || '');
          setLocation(parsed.locationName || '');
          setLanguage(parsed.language || 'en');
        }
      } catch (err) {
        console.log('Invalid JSON in storage:', data);
      }
    };
    loadSavedData();
  }, []);

  const handleSubmit = async (screenName) => {
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
        Alert.alert('Invalid Location', 'Could not find coordinates.');
        return;
      }

      const { lat, lng } = data.results[0].geometry;
      const timezone = data.results[0].annotations.timezone.offset_string;

      const userData = {
        dob,
        time,
        location: {
          latitude: lat,
          longitude: lng,
          timezone,
        },
        locationName: location,
        language,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      navigation.navigate(screenName, userData);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch coordinates.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔮 Enter Birth Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={dob}
        onChangeText={setDob}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Time of Birth (HH:MM)"
          placeholderTextColor="#aaa"
          value={time}
          onChangeText={setTime}
        />
        <TouchableOpacity
          style={[styles.toggle, isAM ? styles.am : styles.pm]}
          onPress={() => setIsAM(!isAM)}
        >
          <Text style={styles.toggleText}>{isAM ? 'AM' : 'PM'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Place of Birth (e.g. Delhi)"
        placeholderTextColor="#aaa"
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Language:</Text>
        <Picker
          selectedValue={language}
          onValueChange={(val) => setLanguage(val)}
          style={styles.picker}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Hindi" value="hi" />
        </Picker>
      </View>

      {[
        { title: 'View Chart', screen: 'Chart' },
        { title: 'View Dasha', screen: 'Dasha' },
        { title: 'Yearly Forecast', screen: 'YearlyForecast' },
        { title: '🗓 Daily Horoscope', screen: 'Daily' },
        { title: '📜 Panchang', screen: 'Panchang' },
        { title: '🔢 Numerology', screen: 'Numerology' },
        { title: '💖 Marriage Match', screen: 'MarriageMatch' },
        { title: '📄 PDF Report', screen: 'PDFReport' },
      ].map(({ title, screen }) => (
        <TouchableOpacity key={screen} style={styles.button} onPress={() => handleSubmit(screen)}>
          <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10002b',
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#f0f8ff',
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#9d4edd',
    backgroundColor: '#240046',
    borderRadius: 10,
    padding: 14,
    color: '#f0f8ff',
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggle: {
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  am: {
    backgroundColor: '#5a189a',
  },
  pm: {
    backgroundColor: '#3c096c',
  },
  toggleText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#f0f8ff',
    marginBottom: 6,
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#240046',
    color: '#f0f8ff',
  },
  button: {
    backgroundColor: '#5a189a',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#f0f8ff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default InputScreen;








