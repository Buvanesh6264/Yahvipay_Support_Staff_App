import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserParcelScreen() {
  const navigation = useNavigation();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(apiUrl+'/parcel/userparcels', {
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setParcels(data.data);
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

  const handleTrackPackage = (parcelNumber) => {
    navigation.navigate('TrackPackage', { parcelNumber });
  };

  const handleViewPackage = (parcelNumber) => {
    navigation.navigate('parceldetial', { parcelNumber });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.Content title="Parcels" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="black" style={styles.loader} />
      ) : (
        <FlatList
          data={parcels}
          keyExtractor={(item) => item.parcelNumber.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: item.image }} style={styles.image} />
              <Card.Title title={`Parcel ${item.parcelNumber}`} subtitle={`Status: ${item.status}`} />

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => handleTrackPackage(item.parcelNumber)}>
                  <Text style={styles.buttonText}>Track Package</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => handleViewPackage(item.parcelNumber)}>
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
  container: { flex: 1, backgroundColor: 'white' },
  navbar: { backgroundColor: 'black' },
  navbarTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  image: { height: 150, resizeMode: 'cover' },
  loader: { marginTop: 50 },
  card: { margin: 10, padding: 10, backgroundColor: '#f5f5f5' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 25, borderRadius: 8, marginTop: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
