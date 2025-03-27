import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

export default function TrackingScreen() {
  const route = useRoute();
  const { parcelNumber } = route.params;
  const [trackingData, setTrackingData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    fetchTrackingDetails();
  }, []);

  const fetchTrackingDetails = async () => {
    try {
      const response = await fetch(apiUrl+`/tracking/${parcelNumber}`);
      const data = await response.json();
      if (data.status === 'success') {
        setTrackingData(data.data);
      }
    } catch (error) {
      console.error('Error fetching tracking details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.Content title="Tracking Details" titleStyle={styles.navbarTitle} />
      </Appbar.Header>
      <View style={styles.containers}>
      {trackingData ? (
        <ScrollView>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Parcel Number: {trackingData.parcelNumber}</Text>
              <Text style={styles.info}>Current Status: {trackingData.currentStatus}</Text>
              <Text style={styles.info}>Current Location: {trackingData.currentLocation}</Text>
              <Text style={styles.info}>Expected Delivery: {new Date(trackingData.expectedDelivery).toLocaleString()}</Text>
            </Card.Content>
          </Card>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowHistory(!showHistory)}>
            <Text style={styles.buttonText}>{showHistory ? 'Hide' : 'View'} Full History</Text>
          </TouchableOpacity>

          {showHistory && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.subtitle}>Tracking History</Text>
                {trackingData.trackingHistory.map((entry, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyText}>{entry.status}</Text>
                    <Text style={styles.historyText}>{entry.location}</Text>
                    <Text style={styles.historyDate}>{new Date(entry.timestamp).toLocaleString()}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.loading}>Loading tracking details...</Text>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  containers: { flex: 1, backgroundColor: 'white', padding: 20 },
  navbar: { backgroundColor: 'black' },
  navbarTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  card: { marginVertical: 10, padding: 15, backgroundColor: '#f5f5f5' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  info: { fontSize: 16, marginBottom: 5 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  historyItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  historyText: { fontSize: 16 },
  historyDate: { fontSize: 14, color: 'gray' },
  loading: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});