import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Appbar, Card, Text, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function AccessoriesScreen() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const response = await fetch(`${apiUrl}/accessory/allaccessory`);
      const data = await response.json();
      setAccessories(data.data || []);
    } catch (error) {
      console.error('Error fetching accessories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="Accessories" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <FlatList
          data={accessories}
          keyExtractor={(item) => item.accessoriesid}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                {/* Image Display */}
                <Image source={{ uri: item.image }} style={styles.image} />
                
                <View style={styles.details}>
                  <Text style={styles.title}>{item.accessoriesname}</Text>
                  <Text style={styles.subtitle}>ID: {item.accessoriesid}</Text>
                  <Text style={styles.specs}>Type: {item.specs.type}</Text>
                  <Text style={styles.specs}>Power: {item.specs.power || "N/A"}</Text>
                  <Text style={styles.specs}>Port: {item.specs.port || "N/A"}</Text>
                  <Text style={styles.specs}>Brand: {item.specs.brand}</Text>
                  <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
                  <View style={styles.stockContainer}>
                    <IconButton 
                      icon={item.instock ? 'check-circle' : 'close-circle'}
                      iconColor={item.instock ? 'green' : 'red'}
                      size={20}
                    />
                    <Text style={[styles.stock, { color: item.instock ? 'green' : 'red' }]}>
                      {item.instock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  navbar: { backgroundColor: 'white', elevation: 3 },
  navbarTitle: { color: '#333', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  loader: { marginTop: 50 },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    resizeMode: 'contain',
  },
  details: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 ,alignItems:"center"},
  subtitle: { fontSize: 14, color: '#777' },
  specs: { fontSize: 14, color: '#555', marginTop: 2 },
  quantity: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 5 },
  stockContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  stock: { fontSize: 14, fontWeight: 'bold', marginLeft: 5 },
});
