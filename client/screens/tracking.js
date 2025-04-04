import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export default function TrackingScreen() {
  const route = useRoute();
  const { parcelNumber } = route.params;
  const [trackingData, setTrackingData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    fetchTrackingDetails();
  }, []);

  const fetchTrackingDetails = async () => {
    try {
      const response = await fetch(apiUrl + `/tracking/parcelNumber`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parcelNumber }),
      });
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
        <Appbar.BackAction onPress={() => navigation.navigate('Home')}color="white" />
        <Appbar.Content title="Tracking Details" titleStyle={styles.navbarTitle} />
      </Appbar.Header>
      <View style={styles.contentContainer}>
        {trackingData ? (
          <ScrollView>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>Parcel Number: {trackingData.parcelNumber}</Text>
                <Text style={styles.info}>Current Status: {trackingData.currentStatus}</Text>
                <Text style={styles.info}>Current Location: {trackingData.currentLocation}</Text>
                <Text style={styles.info}>
                  Expected Delivery: {new Date(trackingData.expectedDelivery).toLocaleString()}
                </Text>
              </Card.Content>
            </Card>

            <TouchableOpacity style={styles.button} onPress={() => setShowHistory(!showHistory)}>
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
                      <Text style={styles.historyDate}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navbar: {
    backgroundColor: '#333',
    alignItems:"center"
  },
  navbarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: "center",
  },
  card: {
    marginVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  loading: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
});
