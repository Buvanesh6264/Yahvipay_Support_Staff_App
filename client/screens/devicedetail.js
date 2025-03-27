import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const DeviceDetail = ({ route }) => {
  const { deviceid } = route.params;
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchDeviceDetails();
  }, [deviceid]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch(apiUrl+`/device/${deviceid}`);
      const data = await response.json();
      setDevice(data.device || null);
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="black" style={styles.loader} />;
  }

  if (!device) {
    return <Text style={styles.noData}>No device data found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: device.image }} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.deviceName}>{device.devicename}</Text>
        <Text style={styles.info}>Device ID: {device.deviceid}</Text>
        <Text style={styles.status(device.status)}>Status: {device.status}</Text>
        <Text style={styles.info}>Support ID: {device.supportid || 'N/A'}</Text>
        <Text style={styles.info}>Agent ID: {device.agentid || 'N/A'}</Text>
        <Text style={styles.info}>User ID: {device.userid || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => console.log('Update Device')}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  details: {
    width: '100%',
    paddingHorizontal: 10,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  status: (status) => ({
    fontSize: 18,
    fontWeight: 'bold',
    color: status === 'available' ? 'green' : status === 'assigned' ? 'orange' : 'red',
    marginBottom: 15,
    textAlign: 'center',
  }),
  button: {
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noData: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DeviceDetail;
