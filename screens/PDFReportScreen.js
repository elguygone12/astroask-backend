import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';

const PDFReportScreen = () => {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [language, setLanguage] = useState('en');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!dob || !time || !place) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return;
    }

    setLoading(true);
    setPdfUrl('');

    try {
      const res = await fetch('https://your-backend-url.com/api/pdf-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dob, time, place, language }),
      });

      const data = await res.json();
      if (data.url) {
        setPdfUrl(data.url);
      } else {
        Alert.alert('Failed', 'PDF not generated.');
      }
    } catch (err) {
      console.error('PDF error:', err);
      Alert.alert('Error', 'Failed to generate report.');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📄 Get PDF Report</Text>

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={dob}
        onChangeText={setDob}
      />

      <TextInput
        style={styles.input}
        placeholder="Time of Birth (HH:MM)"
        placeholderTextColor="#aaa"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        style={styles.input}
        placeholder="Place of Birth"
        placeholderTextColor="#aaa"
        value={place}
        onChangeText={setPlace}
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerate}>
        <Text style={styles.buttonText}>Generate PDF</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color="#fff" size="large" style={{ marginTop: 20 }} />}

      {pdfUrl ? (
        <TouchableOpacity
          onPress={() => Linking.openURL(pdfUrl)}
          style={styles.downloadBox}
        >
          <Text style={styles.downloadText}>📥 Download Your PDF Report</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10002b',
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    color: '#f0f8ff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
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
  downloadBox: {
    marginTop: 30,
    backgroundColor: '#3c096c',
    padding: 14,
    borderRadius: 10,
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PDFReportScreen;
