import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DeviceScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(apiUrl+'/device/userdevices', {
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();
        if (response.ok) {
            setDevices(data.data);
        } else {
          console.error('Error fetching parcels:', data.message);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);


  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.Content title="Devices" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

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
});
