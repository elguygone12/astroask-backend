import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import COLORS from '../constants/colors';

const InputScreen = ({ navigation }) => {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [isAM, setIsAM] = useState(true); // Display-only toggle
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadSavedData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setDob(parsed.dob);
        setTime(parsed.time);
        setLocation(parsed.locationName || '');
        setLanguage(parsed.language || 'en');
      }
    };
    loadSavedData();
  }, []);

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
      navigation.navigate('Chart', userData);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      Alert.alert('Error', 'Failed to fetch coordinates.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>🔮 Enter Birth Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={dob}
          onChangeText={setDob}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Time of Birth (HH:MM)"
            placeholderTextColor="#999"
            value={time}
            onChangeText={setTime}
          />
          <TouchableOpacity
            style={[styles.toggle, isAM ? styles.toggleActive : styles.toggleInactive]}
            onPress={() => setIsAM(!isAM)}
          >
            <Text style={styles.toggleText}>{isAM ? 'AM' : 'PM'}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Place of Birth (e.g. Delhi)"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Language:</Text>
          <Picker
            selectedValue={language}
            onValueChange={(val) => setLanguage(val)}
            style={styles.picker}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Hindi" value="hi" />
          </Picker>
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10002b',
    padding: 20,
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
  },
  toggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#5a189a',
  },
  toggleInactive: {
    backgroundColor: '#3c096c',
  },
  toggleText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    color: '#f0f8ff',
    marginBottom: 6,
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#240046',
    color: '#f0f8ff',
    borderRadius: 10,
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



