import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const InputScreen = ({ navigation }) => {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [selectedChart, setSelectedChart] = useState('Chart');

  // Always using Delhi coordinates for chart generation
  const latitude = 28.6139;
  const longitude = 77.2090;
  const timezone = '+05:30';

  const handleSubmit = () => {
    if (!dob || !time || !place) {
      Alert.alert('Missing Fields', 'Please fill all the details');
      return;
    }

    const datetime = `${dob}T${time}:00${timezone}`;

    const screenMap = {
      Chart: 'Chart',
      Dasha: 'Dasha',
      Yearly: 'YearlyForecast',
    };

    navigation.navigate(screenMap[selectedChart], {
      dob,
      time,
      place,
      location: { latitude, longitude, timezone },
      datetime,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔮 Enter Birth Details</Text>

      <TextInput
        style={styles.input}
        placeholder="📅 Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={dob}
        onChangeText={setDob}
      />

      <TextInput
        style={styles.input}
        placeholder="⏰ Time (24hr format, e.g. 14:13)"
        placeholderTextColor="#aaa"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        style={styles.input}
        placeholder="📍 Place of Birth"
        placeholderTextColor="#aaa"
        value={place}
        onChangeText={setPlace}
      />

      <View style={styles.segmentContainer}>
        {['Chart', 'Dasha', 'Yearly'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setSelectedChart(item)}
            style={[
              styles.segmentButton,
              selectedChart === item && styles.segmentSelected,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                selectedChart === item && styles.segmentTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
        <Text style={styles.buttonText}>🚀 Generate {selectedChart} Chart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0016',
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B266FF',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1F0033',
    color: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#7F00FF',
    borderWidth: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1F0033',
    padding: 6,
    borderRadius: 10,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  segmentSelected: {
    backgroundColor: '#7F00FF',
  },
  segmentText: {
    color: '#B266FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  segmentTextSelected: {
    color: '#FFF',
  },
  buttonPrimary: {
    backgroundColor: '#7F00FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default InputScreen;















