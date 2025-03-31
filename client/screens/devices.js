import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Picker } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function DeviceScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(''); 
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchDevices();
  }, [status]);

  const fetchDevices = async () => {
    try {
      const url = status ? `${apiUrl}/device/alldevices?status=${status}` : `${apiUrl}/device/alldevices`;
      const response = await fetch(url);
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.Content title="Devices" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <Picker
          selectedValue={status}
          onValueChange={(itemValue) => setStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="Available" value="Available" />
          <Picker.Item label="Assigned" value="Assigned" />
          <Picker.Item label="Delivered" value="Delivered" />
          <Picker.Item label="Damaged" value="Damaged" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="black" style={styles.loader} />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.deviceid}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate('devicedetail', { deviceid: item.deviceid })}>
              <Card.Cover source={{ uri: item.image }} style={styles.image} />
              <Card.Title title={item.devicename} subtitle={`ID: ${item.deviceid}`} />
              <Card.Content>
                <Text>Status: {item.status}</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  navbar: { backgroundColor: 'black' },
  navbarTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  loader: { marginTop: 50 },
  card: { margin: 10, padding: 10, backgroundColor: '#f5f5f5' },
  image: { height: 150, resizeMode: 'cover' },
  filterContainer: { padding: 10 },
  filterLabel: { fontSize: 16, marginBottom: 5 },
  picker: { height: 40, width: '100%' },
});
