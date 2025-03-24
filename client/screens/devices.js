import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';

export default function DeviceScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);
  useEffect(() => {
    console.log("Updated devices:", devices);
  }, [devices]);  
  const fetchDevices = async () => {
    try {
      const response = await fetch('http://192.168.1.28:5000/device/alldevices');
      const data = await response.json();
      if (data.devices) {
        setDevices(data.devices);
      } else {
        setDevices([]); 
      }
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

      {loading ? <ActivityIndicator size="large" color="black" style={styles.loader} /> : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
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
});
