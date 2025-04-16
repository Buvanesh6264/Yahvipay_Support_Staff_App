import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function UserTicketScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token,setToken] = useState("");
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        console.error("No token found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching token from AsyncStorage:", error);
    }
  };
  useEffect(()=>{
    fetchTickets();
  },[token])
  const fetchTickets = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${apiUrl}/tickets/userparcels`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },});
      const result = await response.json();
      if (Array.isArray(result?.data)) {
        const sorted = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(sorted);
      } else {
        console.warn("Unexpected ticket format");
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (ticketNumber) => {
    navigation.navigate('ParcelRequestTicketDetail', { ticketNumber });
  };

  const handleCreateParcel=(item)=>{
    Alert.alert(
      "Create Parcel",
      "Are you sure you want to create parcel for this ticket?",
      [
        {
          text:"Cancel",
          onPress:()=>console.log("cancelled"),
          style:"cancel"
        }
        ,{
          text:"Ok",
          onPress:()=>{
            navigation.navigate("CreateParcel",{
              agentid:item.agentid,
              // acceso
            })
          }
        }

      ]
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="MY Parcel Requests Tickets" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : tickets.length === 0 ? (
        <Text style={styles.noDataText}>No tickets found</Text>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={`Ticket Type: ${item.type}`} titleStyle={styles.cardTitle} />
              <Card.Content>
                <Text style={styles.detailText}><Text style={styles.bold}>Ticket No:</Text> {item.ticketNumber}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Agent ID:</Text> {item.agentid}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Status:</Text> {item.status}</Text>
              </Card.Content>
              <View style={styles.buttonContainer}>
              {item.status?.toLowerCase() === 'asigned' && (
                  <TouchableOpacity style={styles.generateButton} onPress={() => handleCreateParcel(item)}>
                    <Text style={styles.buttonText}>Create Parcel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.viewButton} onPress={() => handleView(item.ticketNumber)}>
                  <Text style={styles.buttonText}>View</Text>
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
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  navbar: { backgroundColor: '#007bff', elevation: 4 },
  navbarTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  loader: { marginTop: 50 },
  noDataText: { textAlign: 'center', fontSize: 18, marginTop: 50 },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    paddingBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  detailText: { fontSize: 16, marginTop: 5 },
  bold: { fontWeight: 'bold' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  viewButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  generateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
