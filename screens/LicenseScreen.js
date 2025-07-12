import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as Device from 'expo-device';
import { CommonActions } from '@react-navigation/native';
import COLORS from '../constants/colors';

export default function LicenseScreen({ navigation }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const verifyLicense = async () => {
    const deviceId = Device.osInternalBuildId || Device.deviceName || 'unknown-device';
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('https://tarot-license-server.onrender.com/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, deviceId }),
      });

      const data = await res.json();

      if (data.status === 'activated' || data.status === 'valid') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Input' }],
          })
        );
      } else if (data.status === 'used-on-other-device') {
        setMessage('❌ Key used on another device');
      } else {
        setMessage('❌ Invalid license key');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Server unreachable');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Enter License Key</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your key"
        placeholderTextColor="#999"
        value={licenseKey}
        onChangeText={setLicenseKey}
      />
      <Button title="Verify" onPress={verifyLicense} color={COLORS.primary} disabled={loading} />
      {loading && <ActivityIndicator color={COLORS.secondary} style={{ marginTop: 10 }} />}
      <Text style={{ color: COLORS.primary, marginTop: 10 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background, padding: 20,
  },
  title: {
    fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20,
  },
  input: {
    borderColor: COLORS.primary, borderWidth: 1, borderRadius: 10,
    padding: 10, marginBottom: 20, width: '80%', color: COLORS.text, textAlign: 'center',
  },
});