import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Appbar, Card, Text, Button } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function ScanDeviceScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request Camera Permission
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to scan QR codes.');
      }
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle QR Code Scan
  const handleScan = async ({ data }) => {
    setScanned(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://192.168.1.55:5000/device/${data}`);
      // const response = await fetch(`http://192.168.1.4:5000/device/${data}`);//home
      if (!response.ok) throw new Error('Device not found');

      const result = await response.json();
      if (result.status === 'success') {
        setDevice(result.device);
      } else {
        throw new Error('Device not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setScanned(false);
    setDevice(null);
    setError(null);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.Content title="Scan Device" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      {/* QR Scanner */}
      {!device && !loading && !scanned && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleScan}
            focusMode={BarCodeScanner.Constants.FocusMode.auto}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="black" style={styles.loader} />}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Button mode="contained" onPress={handleRetry} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      )}

      {/* Device Details */}
      {device && (
        <Card style={styles.card}>
          <Card.Cover source={{ uri: device.image }} style={styles.image} />
          <Card.Title title={device.devicename} subtitle={`ID: ${device.deviceid}`} />
          <Card.Content>
            <Text>Status: {device.status}</Text>
          </Card.Content>
          <Button mode="contained" onPress={handleRetry} style={styles.button}>
            Scan Again
          </Button>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  navbar: { backgroundColor: 'black' },
  navbarTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scannerContainer: { flex: 1, height: '80%' }, // Ensures proper scanner height
  loader: { marginTop: 50 },
  errorContainer: { alignItems: 'center', marginTop: 10 },
  error: { color: 'red', textAlign: 'center', marginBottom: 5 },
  retryButton: { backgroundColor: 'red', marginVertical: 5 },
  card: { margin: 10, padding: 10, backgroundColor: 'white', elevation: 3, borderRadius: 10 },
  image: { height: 150, resizeMode: 'cover' },
  button: { margin: 10, backgroundColor: 'black' },
});

