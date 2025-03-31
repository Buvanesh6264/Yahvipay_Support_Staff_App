import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ParcelDetail = ({ route }) => {
  const { parcelNumber } = route.params;
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Parcel Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Parcel Number:</Text>
              <Text style={styles.value}>{parcel.parcelNumber}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.label}>Pickup Location:</Text>
              <Text style={styles.value}>{parcel.pickupLocation}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Destination:</Text>
              <Text style={styles.value}>{parcel.destination}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Agent ID:</Text>
              <Text style={styles.value}>{parcel.agentid || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Support ID:</Text>
              <Text style={styles.value}>{parcel.supportid || "N/A"}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.label}>Device ID:</Text>
              <Text style={styles.value}>{parcel.deviceid || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Accessories:</Text>
              <Text style={styles.value}>
                {parcel.accessories.length > 0
                  ? parcel.accessories.join(", ")
                  : "None"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Receiver:</Text>
              <Text style={styles.value}>{parcel.reciver || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Sender:</Text>
              <Text style={styles.value}>{parcel.sender || "N/A"}</Text>
            </View>
          </Card.Content>
        </Card>

        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log("Update Parcel")}
        >
          <Text style={styles.buttonText}>Update Parcel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingBottom: 15,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  status: (status) => ({
    fontWeight: "700",
    color:
      status === "delivered"
        ? "green"
        : status === "in transit"
        ? "orange"
        : status === "pending"
        ? "red"
        : "#333",
  }),
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ParcelDetail;
