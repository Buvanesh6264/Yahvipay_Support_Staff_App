import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text, Button } from 'react-native-paper';
import {useIsFocused, useNavigation,useRoute  } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function DeviceScreen() {
  const foces = useIsFocused()
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const route = useRoute(); 
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchDevices();
  }, [status]);

  useEffect(() => {
    if(foces){
    if (route.params?.initialStatus) {
      setStatus(route.params.initialStatus);
    }
    else{
      setStatus('');
    }
  }
  }, [route.params?.initialStatus,foces]);

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

  const filteredDevices = devices.filter((device) =>
    device.deviceid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Device Inventory" titleStyle={styles.navbarTitle} />
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-outline" size={25} color="black" style={{fontWeight: 'bold'}} onPress={() => navigation.navigate('QRScan')}/>
        </TouchableOpacity>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by device Id"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={styles.picker}
            dropdownIconColor="#333" 
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="Available" value="Available" />
            <Picker.Item label="Assigned" value="Assigned" />
            <Picker.Item label="Delivered" value="Delivered" />
            <Picker.Item label="Damaged" value="Damaged" />
          </Picker>
        </View>
      </View>


      {loading ? (
        <ActivityIndicator size="large" color="black" style={styles.loader} />
      ) : filteredDevices.length === 0 ? (
           <Text style={styles.noDataText}>Device not found</Text>
          ):(
        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.deviceid}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate('DeviceDetail', { deviceid: item.deviceid })}>
              <View style={styles.cardContent}>
                <Card.Cover source={{ uri: item.image }} style={styles.image} />
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{item.devicename}</Text>
                  <Text style={styles.deviceId}>ID: {item.deviceid}</Text>
                  <Text style={styles.deviceStatus}>Status: {item.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#555" />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  navbar: { backgroundColor: 'white', elevation: 3, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  navbarTitle: { color: '#333', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  addButton: { padding: 10},
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    margin: 15,
    alignItems: 'center',
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  clearIcon: {
    paddingLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  filterLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3, 
  },
  picker: {
    height: 45,
    fontSize: 16,
    color: '#333',
    padding: 25,
  },
  loader: { marginTop: 50 },

  card: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
    padding: 10,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  deviceId: { fontSize: 14, color: '#777' },
  deviceStatus: { fontSize: 14, color: '#444', marginTop: 2 },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  }
});

