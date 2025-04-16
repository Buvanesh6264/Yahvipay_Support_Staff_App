import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function AgentInventoryScreen() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAgentInventories();
  }, []);

  const fetchAgentInventories = async () => {
    try {
      const response = await fetch('http://192.168.1.21:4000/agentdeviceinfo');
      const result = await response.json();
      if (Array.isArray(result?.data)) {
        setAgents(result.data);
      } else {
        console.warn("Unexpected data format:", result);
        setAgents([]);
      }
    } catch (error) {
      console.error("Error fetching agent inventories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="Agent Inventories" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : agents.length === 0 ? (
        <Text style={styles.noDataText}>No agent inventories found</Text>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={`Agent: ${item.firstname}`} titleStyle={styles.cardTitle} />
              <Card.Content>
                <Text style={styles.detailText}><Text style={styles.bold}>Agent ID:</Text> {item.id}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Phone:</Text> {item.phone}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Available Devices:</Text> {item.deviceCount}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Accessories :</Text> {item.accessories.length}</Text>
                {item.accessories.map((acc, idx) => (
                  <Text key={idx} style={styles.detailText}>
                    • <Text style={styles.bold}>ID:</Text> {acc.device_id}  |  <Text style={styles.bold}>Qty:</Text> {acc.quantity}
                  </Text>
                ))}
              </Card.Content>
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
});
