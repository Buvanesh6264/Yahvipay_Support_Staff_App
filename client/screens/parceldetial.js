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
        const response = await fetch(`${apiUrl}/parcel/parcelNumber`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ parcelNumber }),
        });

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
        {/* <Appbar.BackAction onPress={() => navigation.goBack()} /> */}
        <Appbar.Content title="Parcel Details" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color="#fff" style={styles.icon} />
              <Text style={styles.title}>
                {parcel.sender} ➝ {parcel.reciver}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#fff" style={styles.icon} />
              <Text style={styles.subtitle}>
                {parcel.pickupLocation} ➝ {parcel.destination}
              </Text>
            </View>
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={20} style={styles.icon} />
              <Text style={styles.sectionTitle}>Parcel Information</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="confirmation-number" size={16} style={styles.icon} />
              <Text style={styles.infoText}>{parcel.parcelNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={16} style={styles.icon} />
              <Text style={styles.infoText}>
                Agent ID: {parcel.reciver}({parcel.agentid || "N/A"})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="support-agent" size={16} style={styles.icon} />
              <Text style={styles.infoText}>
                Support ID: {parcel.supportname}({parcel.supportid || "N/A"})
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialIcons name="devices" size={20} style={styles.icon} />
              <Text style={styles.sectionTitle}>Devices</Text>
            </View>
            {parcel.devices?.length > 0 ? (
              parcel.devices.map((device, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.infoRow}
                  onPress={() => navigation.navigate("DeviceDetail", { deviceid: device })}
                >
                  <MaterialIcons name="devices" size={16} style={styles.icon} />
                  <Text style={[styles.infoText]}>{device}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.infoText}>None</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialIcons name="settings" size={20} style={styles.icon} />
              <Text style={styles.sectionTitle}>Accessories</Text>
            </View>
            {parcel.accessories?.length > 0 ? (
              parcel.accessories.map((acc, index) => (
                <View key={index} style={styles.infoRow}>
                  <MaterialIcons name="inventory" size={16} style={styles.icon} />
                  <Text style={styles.infoText}>
                    {acc.id} (Qty: {acc.quantity})
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>None</Text>
            )}
          </Card.Content>
        </Card>

        {parcel.status?.toLowerCase() === 'packed' && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNavigateToUpdateParcel}
          >
            <Text style={styles.buttonText}>Update Parcel</Text>
          </TouchableOpacity>
        )}
        {parcel.status?.toLowerCase() !== 'packed' && (
          <Text style={styles.statusMessage}>
            Parcel cannot be updated because its status is {parcel.status}.
            Only parcels with "packed" status can be updated.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { padding: 16 },
  appbar: { backgroundColor: "#fff" },
  navbarTitle: { color: "#333", fontSize: 22, fontWeight: "bold", textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#007bff",
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTextContainer: { marginLeft: 8 },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 16, color: "#fff", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
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
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  statusMessage: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", textAlign: "center", marginTop: 20 },
});

export default ParcelDetail;