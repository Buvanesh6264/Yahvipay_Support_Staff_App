import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';

const ParcelDetail = ({ route }) => {
  const { parcelNumber } = route.params;
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParcelDetails = async () => {
      try {
        const response = await fetch(`http://192.168.1.55:5000/parcel/${parcelNumber}`);
        // const response = await fetch(`http://192.168.1.4:5000/parcel/${parcelNumber}`);//home
        const data = await response.json();

        if (response.ok) {
          setParcel(data.data);
        } else {
          setError(data.message || 'Failed to fetch parcel details');
        }
      } catch (error) {
        setError('Error fetching parcel details');
      } finally {
        setLoading(false);
      }
    };

    fetchParcelDetails();
  }, [parcelNumber]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!parcel) {
    return <Text style={styles.error}>Parcel details not available.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Parcel Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Parcel Number:</Text>
            <Text style={styles.value}>{parcel.parcelNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{parcel.status}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Pickup Location:</Text>
            <Text style={styles.value}>{parcel.pickupLocation}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Destination:</Text>
            <Text style={styles.value}>{parcel.destination}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Agent ID:</Text>
            <Text style={styles.value}>{parcel.agentid}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Support ID:</Text>
            <Text style={styles.value}>{parcel.supportid}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{parcel.userid}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.value}>{parcel.deviceid}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Accessories:</Text>
            <Text style={styles.value}>{parcel.accessories.join(', ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Receiver:</Text>
            <Text style={styles.value}>{parcel.reciver}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Sender:</Text>
            <Text style={styles.value}>{parcel.sender}</Text>
          </View>
        </Card.Content>
      </Card>

      <TouchableOpacity style={styles.button} onPress={() => console.log('Update Parcel')}>
        <Text style={styles.buttonText}>Update Parcel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    marginHorizontal: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ParcelDetail;
