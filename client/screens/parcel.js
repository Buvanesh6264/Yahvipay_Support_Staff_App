  import React, { useEffect, useState } from 'react';
  import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,Alert  } from 'react-native';
  import { Appbar, Card, Text } from 'react-native-paper';
  import { useNavigation } from '@react-navigation/native';
  import { Ionicons } from '@expo/vector-icons';

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
      navigation.navigate('ParcelDetail', { parcelNumber });
    };

    const handleSendParcel = (parcelNumber) => {
      Alert.alert(
        "Send Parcel",
        "Are you sure you want to send this parcel?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "OK",
            onPress: async () => {
              try {
                const response = await fetch(`${apiUrl}/parcel/updatestatus`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    parcelNumber: parcelNumber,
                    status: "sent"
                  }),
                });
    
                const result = await response.json();
    
                if (response.ok && result.status === "success") {
                  fetchParcels(); 
                } else {
                  console.error("Failed to update status:", result.message);
                }
              } catch (error) {
                console.error("Error updating parcel status:", error);
              }
            }
          }
        ]
      );
    };
    
    
    const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
        case "packed":
          return { color: "#6f42c1" };       
        case "sent":
          return { color: "#17a2b8" };       
        case "received":
          return { color: "#ffc107" };       
        case "delivered":
          return { color: "#28a745" };       
        default:
          return { color: "#6c757d" };       
      }
    };
    
    
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.navbar}>
          {/* <Appbar.BackAction onPress={() => navigation.navigate('Main')}color="white" /> */}
          <Appbar.Content title="All Parcels" titleStyle={styles.navbarTitle} />
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-outline" size={24} color="white" onPress={() => navigation.navigate('CreateParcel')}/>
          </TouchableOpacity>
        </Appbar.Header>
        <TouchableOpacity
          style={styles.agentbtn}
          onPress={() => navigation.navigate("AgentParcelDetail")}>
          <Text style={styles.buttonText}>Track Agents parcels</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <FlatList
            data={parcels}
            keyExtractor={(item) => item.parcelNumber.toString()}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Cover source={{ uri: 'https://imgs.search.brave.com/mN2Zk0Wyu2uZ81v8jKIq5Dp9bzIEJKKjJcwIsNZxWgc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzM0Lzc3LzEz/LzM2MF9GXzYzNDc3/MTM2NF9aUmFwZ1ZH/Z0plZFBtSk04eEhV/ckNYS3ZRRUhFU2o1/YS5qcGc' }} style={styles.image} />
                <Card.Title title={`Parcel No: ${item.parcelNumber}`} titleStyle={styles.cardTitle} />
                <Card.Content>
                  <Text style={[styles.statusText, getStatusStyle(item.status)]}>
                   <Text style={styles.boldLabel}>Status:</Text> {item.status?.toUpperCase()}
                  </Text>
                </Card.Content>
                <View style={styles.buttonContainer}>
                  {item.status?.toLowerCase() === 'packed' && (
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={() => handleSendParcel(item.parcelNumber)}>
                      <Ionicons name="send-outline" size={20} color="white" />
                      <Text style={styles.buttonText}></Text>
                    </TouchableOpacity>
                  )}

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
    addButton: { padding: 10 },
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
    agentbtn: {
      backgroundColor: '#28a745',
      margin:20,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
      elevation: 3,
    },
    image: { height: 180, resizeMode: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    sendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6f42c1',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      elevation: 3,
    },
    boldLabel: {
      fontWeight: 'bold',
      color: '#444',
      textAlign: 'center',   
    },
    viewButton: {
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      elevation: 3,
    },
    statusText: {
      fontSize: 16,
      fontWeight: 'bold',     
      textAlign: 'center',   
      marginTop: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });