import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Card, Appbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ParcelRequesTicketDetail = ({ route }) => {
  const { ticketNumber } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`${apiUrl}/tickets/TicketNumber`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ticketNumber }),
          });

        const data = await response.json();
        if (response.ok) {
          setTicket(data.data);
        } else {
          setError(data.message || "Failed to load ticket data");
        }
      } catch (err) {
        setError("Error fetching ticket data");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketNumber]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error || !ticket) {
    return <Text style={styles.error}>{error || "Ticket not found"}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ticket Details" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialIcons name="confirmation-number" size={20} style={styles.icon} />
              <Text style={styles.sectionTitle}>Ticket Info</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="confirmation-number" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>Ticket Number: </Text>{ticket.ticketNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="assignment" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>Type: </Text>{ticket.type}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="badge" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>Agent ID: </Text>{ticket.agentid}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="badge" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>Support ID: </Text>{ticket.supportid ? ticket.supportid : 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>
                Created: </Text>{new Date(ticket.createdAt).toLocaleString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>Status:</Text> {ticket.status}</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
        <Card.Content>
        <View style={styles.infoRow}>
              <MaterialIcons name="devices" size={20} style={styles.icon} />
              <Text style={styles.sectionTitle}>Devices</Text>
            </View>
        <View style={styles.infoRow}>
              <MaterialIcons name="devices" size={16} style={styles.icon} />
              <Text style={styles.infoText}><Text style={styles.sectionsubtitle}>Devices Requested: </Text>{ticket.devices}</Text>
            </View>
            </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialIcons name="inventory" size={20} style={styles.icon} />
              <Text style={styles.sectionTitle}>Accessories</Text>
            </View>
            {ticket.accessories && ticket.accessories.length > 0 ? (
              ticket.accessories.map((acc, index) => (
                <View key={index} style={styles.infoRow}>
                  <MaterialIcons name="extension" size={16} style={styles.icon} />
                  <Text style={styles.infoText}>
                    {acc.accessoriesid} (Qty: {acc.quantity})
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>No accessories</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { padding: 16 },
  appbar: { backgroundColor: "#fff" },
  navbarTitle: { color: "#333", fontSize: 22, fontWeight: "bold", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    // marginBottom: 8,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
    marginBottom: 2,
  },
  sectionsubtitle:{
    fontSize: 16,
    fontWeight: "bold",
    // marginBottom: 8,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { flex:1,color: "red", textAlign: "center", marginTop: 20 },
});

export default ParcelRequesTicketDetail;
