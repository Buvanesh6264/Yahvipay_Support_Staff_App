import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Card, Appbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const ParcelDetail = ({ route }) => {
  const { parcelNumber } = route.params;
  const navigation = useNavigation();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchParcelDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/parcel/${parcelNumber}`);
        const data = await response.json();
        if (response.ok) {
          setParcel(data.data);
        } else {
          setError(data.message || "Failed to fetch parcel details");
        }
      } catch (error) {
        setError("Error fetching parcel details");
      } finally {
        setLoading(false);
      }
    };
    fetchParcelDetails();
  }, [parcelNumber]);

  const handleNavigateToUpdateParcel = async () => {
    try {
      await AsyncStorage.setItem("parcelNumber", parcelNumber);
      navigation.navigate("UpdateParcel", { parcelNumber });
    } catch (error) {
      console.error("Error saving parcel number:", error);
    }
  };

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
    <SafeAreaView style={styles.safeContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Parcel Details"titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              <MaterialIcons name="person" size={20} /> {parcel.sender} ➝ {parcel.reciver}
            </Text>
            <Text style={styles.subtitle}>
              <MaterialIcons name="location-on" size={20} /> {parcel.pickupLocation} ➝ {parcel.destination}
            </Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="info" size={20} /> Parcel Information
            </Text>
            <Text style={styles.info}>
              <MaterialIcons name="confirmation-number" size={16} /> {parcel.parcelNumber}
            </Text>
            <Text style={styles.info}>
              <MaterialIcons name="person" size={16} /> Agent ID: {parcel.agentid || "N/A"}
            </Text>
            <Text style={styles.info}>
              <MaterialIcons name="support-agent" size={16} /> Support ID: {parcel.supportid || "N/A"}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="devices" size={20} /> Devices
            </Text>
            <Text style={styles.info}>
              {parcel.devices?.length > 0 ? parcel.devices.join(", ") : "None"}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="settings" size={20} /> Accessories
            </Text>
            {parcel.accessories?.length > 0 ? (
              parcel.accessories.map((acc, index) => (
                <Text key={index} style={styles.info}>
                  <MaterialIcons name="inventory" size={16} /> {acc.id} (Qty: {acc.quantity})
                </Text>
              ))
            ) : (
              <Text style={styles.info}>None</Text>
            )}
          </Card.Content>
        </Card>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToUpdateParcel}>
          <Text style={styles.buttonText}>Update Parcel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { padding: 16 },
  appbar: { backgroundColor: "#fff",height:25,marginTop:-20 }, 
  navbarTitle: { color: '#333', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#007bff", borderRadius: 12, marginBottom: 16 },
  headerTextContainer: { marginLeft: 8 },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 16, color: "#fff", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  info: { fontSize: 16, marginVertical: 4, color: "#333" },
  button: { marginTop: 20, backgroundColor: "#007bff", padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", textAlign: "center", marginTop: 20 },
});

export default ParcelDetail;
