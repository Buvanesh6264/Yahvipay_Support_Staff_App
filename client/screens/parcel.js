import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ParcelScreen() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      const response = await fetch(apiUrl + "/parcel/allparcels");
      const data = await response.json();
      setParcels(data.data || []);
    } catch (error) {
      console.error("Error fetching parcels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPackage = (parcelNumber) => {
    navigation.navigate('TrackPackage', { parcelNumber });
  };

  const handleViewPackage = (parcelNumber) => {
    navigation.navigate('parceldetial', { parcelNumber });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')}color="white" />
        <Appbar.Content title="All Parcels" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <FlatList
          data={parcels}
          keyExtractor={(item) => item.parcelNumber.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              {/* <Card.Cover source={{ uri: item.image }} style={styles.image} /> */}
              <Card.Title title={`Parcel ${item.parcelNumber}`} titleStyle={styles.cardTitle} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => handleTrackPackage(item.parcelNumber)}>
                  <Text style={styles.buttonText}>Track Package</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewPackage(item.parcelNumber)}>
                  <Text style={styles.buttonText}>View Package</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9', paddingBottom: 10 },
  navbar: { backgroundColor: '#007bff', elevation: 4 },
  navbarTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  loader: { marginTop: 50 },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    paddingBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 10 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  trackButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  // image: { height: 180, resizeMode: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  viewButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});