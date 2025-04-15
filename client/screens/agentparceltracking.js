import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, FlatList, ActivityIndicator,TouchableOpacity  } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function AgentParcelScreen() {
  const [agentList, setAgentList] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [statusFilter, setStatusFilter] = useState('All');
  const statusOptions = ['All', 'packed', 'sent', 'received', 'delivered'];


  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("http://192.168.4.74:4000/allAgentId");
        const data = await response.json();
        const ids = data.map((agent) => agent.id);
        setAgentList(ids);
      } catch (error) {
        console.error("Agent fetch error:", error);
        Alert.alert("Error", "Could not fetch agents");
      }
    };

    fetchAgents();
  }, []);

  const fetchParcelsForAgent = async (agentid, status = statusFilter) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/parcel/agentidstatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentid, status }),
      });
  
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setParcels(result.data);
      } else {
        Alert.alert("No Parcels", result.message);
        setParcels([]);
      }
    } catch (error) {
      console.error("Error fetching parcels:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
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
        <Appbar.BackAction onPress={() => navigation.navigate('Main')} />
        <Appbar.Content title="Agent Parcel Tracking" titleStyle={styles.navbarTitle} />
      </Appbar.Header>
      <View style={styles.content}>
        <View>
          <Picker
            selectedValue={selectedAgent}
            style={styles.picker}
            onValueChange={(value) => {
              setSelectedAgent(value);
              fetchParcelsForAgent(value);
            }}
          >
            <Picker.Item label="Select an Agent ID" value="" />
            {agentList.map((id) => (
              <Picker.Item key={id} label={id} value={id} />
            ))}
          </Picker>
          {selectedAgent !== '' && (
            <Picker
              selectedValue={statusFilter}
              style={styles.picker}
              onValueChange={(value) => {
                setStatusFilter(value);
                fetchParcelsForAgent(selectedAgent, value);
              }}
            >
              {statusOptions.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          )}
        </View>

        {selectedAgent === '' ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Select an Agent ID to view assigned parcels.</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : parcels.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No parcels found for this agent.</Text>
          </View>
        ) : (
          <FlatList
            data={parcels}
            keyExtractor={(item) => item.parcelNumber}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if(item.type==="outgoing"){
                    navigation.navigate('ParcelDetail', { parcelNumber: item.parcelNumber });
                  }
                  if(item.type==="incoming"){
                    navigation.navigate('returnparceldetials', { parcelNumber: item.parcelNumber });
                }}
              }
              >
                <Card style={styles.card}>
                  <Card.Cover 
                    source={{ uri: 'https://imgs.search.brave.com/mN2Zk0Wyu2uZ81v8jKIq5Dp9bzIEJKKjJcwIsNZxWgc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzM0Lzc3LzEz/LzM2MF9GXzYzNDc3/MTM2NF9aUmFwZ1ZH/Z0plZFBtSk04eEhV/ckNYS3ZRRUhFU2o1/YS5qcGc' }}
                    style={styles.image}
                  />
                  <Card.Title title={`Parcel No: ${item.parcelNumber}`} titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 10 }} />
                  <Card.Content>
                    <Text style={[styles.statusText, getStatusStyle(item.status)]}><Text style={styles.boldLabel}>Status:</Text> {item.status}</Text>
                    <Text style={styles.cardText}><Text style={styles.boldLabel}>Destination:</Text> {item.destination || "N/A"}</Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

    </View>
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1,  backgroundColor: '#f0f2f5' },
  content: {flex: 1, paddingBottom: 10,margin:20,  },
  navbar: { backgroundColor: 'white', elevation: 3, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  navbarTitle: { color: '#333', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  title: { marginBottom: 10, fontWeight: 'bold', textAlign: 'center' },
  picker: { backgroundColor: 'white', marginBottom: 20 ,borderRadius: 12,elevation:4,borderRadius:20},
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    // elevation:3
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },  
  card: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 4,
  },
  image: {
    height: 160,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardText: {
    fontSize: 16,
    marginTop: 5,
  },
  boldLabel: {
    fontWeight: 'bold',
    color: '#444',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',     
    textAlign: 'center',   
    marginTop: 8,
  },
});
