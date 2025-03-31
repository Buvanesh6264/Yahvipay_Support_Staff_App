import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DeviceDetail = ({ route }) => {
  const { deviceid } = route.params;
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchDeviceDetails();
  }, [deviceid]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/device/${deviceid}`);
      const data = await response.json();
      setDevice(data.device || null);
    } catch (error) {
      console.error("Error fetching device details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  if (!device) {
    return <Text style={styles.noData}>No device data found.</Text>;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={{ uri: device.image }} style={styles.image} />

          <View style={styles.detailsCard}>
            <Text style={styles.deviceName}>{device.devicename}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Device ID:</Text>
              <Text style={styles.value}>{device.deviceid}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.status, styles[device.status]]}>{device.status.toUpperCase()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Support ID:</Text>
              <Text style={styles.value}>{device.supportid || "N/A"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Agent ID:</Text>
              <Text style={styles.value}>{device.agentid || "N/A"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => console.log("Update Device")}>
            <Text style={styles.buttonText}>Update Device</Text>
          </TouchableOpacity>
        </View>
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
  container: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  detailsCard: {
    width: "100%",
    padding: 20,
  },
  deviceName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  infoRow: {
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
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  status: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  available: {
    color: "green",
  },
  assigned: {
    color: "orange",
  },
  delivered: {
    color: "blue",
  },
  damaged: {
    color: "red",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});

export default DeviceDetail;
