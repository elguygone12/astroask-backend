import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const MarriageMatchScreen = () => {
  const [boyDob, setBoyDob] = useState('');
  const [boyTime, setBoyTime] = useState('');
  const [boyPlace, setBoyPlace] = useState('');
  const [girlDob, setGirlDob] = useState('');
  const [girlTime, setGirlTime] = useState('');
  const [girlPlace, setGirlPlace] = useState('');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!boyDob || !boyTime || !boyPlace || !girlDob || !girlTime || !girlPlace) {
      Alert.alert('Missing Fields', 'Please enter all required details.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('https://your-backend-url.com/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boy: { dob: boyDob, time: boyTime, place: boyPlace },
          girl: { dob: girlDob, time: girlTime, place: girlPlace },
          language,
        }),
      });

      const data = await res.json();
      setResult(data.explanation || 'No result from AI.');
    } catch (err) {
      console.error('Match error:', err);
      Alert.alert('Error', 'Failed to get compatibility result.');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💑 Marriage Match</Text>

      <Text style={styles.section}>👦 Boy's Details</Text>
      <TextInput style={styles.input} placeholder="DOB (YYYY-MM-DD)" value={boyDob} onChangeText={setBoyDob} />
      <TextInput style={styles.input} placeholder="Time (HH:MM)" value={boyTime} onChangeText={setBoyTime} />
      <TextInput style={styles.input} placeholder="Place of Birth" value={boyPlace} onChangeText={setBoyPlace} />

      <Text style={styles.section}>👧 Girl's Details</Text>
      <TextInput style={styles.input} placeholder="DOB (YYYY-MM-DD)" value={girlDob} onChangeText={setGirlDob} />
      <TextInput style={styles.input} placeholder="Time (HH:MM)" value={girlTime} onChangeText={setGirlTime} />
      <TextInput style={styles.input} placeholder="Place of Birth" value={girlPlace} onChangeText={setGirlPlace} />

      <TouchableOpacity style={styles.button} onPress={handleMatch}>
        <Text style={styles.buttonText}>Match Now</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color="#fff" size="large" style={{ marginTop: 20 }} />}

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10002b',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#f0f8ff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    fontSize: 18,
    color: '#c77dff',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#9d4edd',
    backgroundColor: '#240046',
    borderRadius: 10,
    padding: 14,
    color: '#f0f8ff',
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#5a189a',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#f0f8ff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 30,
    backgroundColor: '#3c096c',
    padding: 16,
    borderRadius: 10,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default MarriageMatchScreen;
