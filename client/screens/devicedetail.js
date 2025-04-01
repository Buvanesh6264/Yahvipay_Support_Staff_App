import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
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
        <Image source={{ uri: device.image }} style={styles.deviceImage} />
        <View style={styles.header}>
          <Text style={styles.deviceId}>Device ID: {device.deviceid}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <DetailCard label="Device Name" value={device.devicename} />
          <DetailCard label="Status" value={device.status.toUpperCase()} status={device.status} />
          <DetailCard label="Support ID" value={device.supportid || "N/A"} />
          <DetailCard label="Agent ID" value={device.agentid || "N/A"} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailCard = ({ label, value, status }) => (
  <View style={styles.detailCard}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={[styles.value, status ? styles[status] : null]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    // alignItems: "center",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#EDEDED",
    paddingVertical: 20,
    width: "100%",
  },
  deviceImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 20,
  },
  deviceId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },
  detailsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  detailCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    height:70,
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    // textAlign: "right",
  },
  available: {
    color: "#28A745", 
  },
  assigned: {
    color: "#FFC107", 
  },
  delivered: {
    color: "#17A2B8",
  },
  damaged: {
    color: "#DC3545", 
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    fontSize: 18,
    color: "#DC3545",
    textAlign: "center",
    marginTop: 50,
  },
});

export default DeviceDetail;
