import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
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
      const response = await fetch(`${apiUrl}/device/deviceid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceid }),
      });
      const data = await response.json();
      setDevice(data.device || null);
    } catch (error) {
      console.error("Error fetching device details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceLocationStatus = () => {
    if (device.status === "available") {
      return "Device is in inventory.";
    }
    if (device.status === "assigned" && device.agentid && device.Inventory === false) {
      return `Device is with Agent (${device.agentid}).`;
    }
    if (device.status === "assigned" && device.agentid && device.Inventory === true) {
      return "Device is in inventory.";
    }
    if (device.user && device.activated) {
      return "Device is with the user.";
    }

    if (device.status === "damaged") {
      if (device.agentid && device.Inventory === false) {
        return `Damaged device is with Agent (${device.agentid}).`;
      } else {
        return "Damaged device is back in inventory.";
      }
    }

    return "Device status is unclear.";
  };

  const deviceHistory = [];

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
    );
  }

  if (!device) {
    return <Text style={styles.noData}>No device data found.</Text>;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: device.image }} style={styles.deviceImage} />
          <View
            style={[
              styles.activationBadge,
              { backgroundColor: device.activated ? "#28A745" : "#DC3545" },
            ]}
          >
            <Text style={styles.activationText}>
              {device.activated ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <View style={styles.header}>
        <Text style={styles.deviceId}>Device ID: {device.deviceid}</Text>
        </View>
        <View
          style={[
            styles.statusContainer,
            {
              borderLeftColor:
                device.status === "available"
                  ? "#28A745"
                  : device.status === "assigned"
                  ? "#FFC107"
                  : device.status === "damaged"
                  ? "#DC3545"
                  : "#007bff",
            },
          ]}
        >
          <Text style={styles.statusHeader}>Device Location Status</Text>
          <Text style={styles.statusText}>{getDeviceLocationStatus()}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <DetailCard label="Device Name" value={device.devicename} />
          <DetailCard
            label="Status"
            value={device.status.toUpperCase()}
            status={device.status}
          />
          <DetailCard label="Support ID" value={device.supportid || "N/A"} />
          <DetailCard label="Agent ID" value={device.agentid || "N/A"} />
          <DetailCard
            label="Parcel Number"
            value={device.parcelNumber || "N/A"}
          />
        <DetailCard
          label="Device Usage"
          value={
            device.Used === 0
              ? "This device is brand new."
              : `${device.Used} user have used this device before.`
          }
        />

        {device.status === "damaged" && device.DamageMsg && (
          <DetailCard label="Damage Note" value={device.DamageMsg} />
        )}
        </View>

        {/* <View style={styles.historyContainer}>
          <Text style={styles.statusHeader}>Device History</Text>
          {deviceHistory.map((entry, index) => (
            <Text key={index} style={styles.statusText}>
              • {entry.date}: {entry.status}
            </Text>
          ))}
        </View> */}
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
  },
  header: {
    alignItems: "center",
    backgroundColor: "#EDEDED",
    paddingVertical: 20,
    width: "100%",
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    marginTop: 20,
  },
  activationBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 1,
  },
  activationText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 20,
  },
  deviceImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
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
    height: 70,
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
  statusContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: "#007bff", 
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  statusHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#007bff",
  },
  statusText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    lineHeight: 22,
  },
  historyContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
});

export default DeviceDetail;