import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  MaterialIcons,
  FontAwesome5,
  Entypo,
  Ionicons,
} from "@expo/vector-icons";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [deviceCount, setDeviceCount] = useState(0);
  const [parcelCount, setParcelCount] = useState(0);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [deviceStatusCounts, setDeviceStatusCounts] = useState({});
  const [parcelStatusCounts, setParcelStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${apiUrl}/allcount`);
        const data = await res.json();
        if (res.ok) {
          setDeviceCount(data.data.devices.statusCounts.available || 0);
          setParcelCount(data.data.parcels.total || 0);
          setPendingDeliveries(data.data.incomingParcelCount || 0);
          setDeviceStatusCounts(data.data.devices.statusCounts || {});
          setParcelStatusCounts(data.data.parcels.statusCounts || {});
        } else {
          console.error("Error fetching counts:", data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const renderStatusCards = (statusCounts, category) => {
    return Object.entries(statusCounts).map(([status, count]) => (
      <TouchableOpacity
        key={`${category}-${status}`}
        onPress={() =>
          navigation.navigate(
            category === "Device" ? "Devices" : "Parcels",
            { initialStatus: capitalize(status) }
          )
        }
      >
        <Card title={`${category} - ${capitalize(status)}`} value={count} />
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.statsWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color="black" style={styles.loader} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            {renderStatusCards(deviceStatusCounts, "Device")}
            {renderStatusCards(parcelStatusCounts, "Parcel")}
            <TouchableOpacity
              onPress={() =>
              navigation.navigate("DamagedParcelFromAgent")
              }
            >
              <Card title="Incoming Parcels" value={pendingDeliveries} />
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.sectionContainer}>
          <Section
            title="Device"
            items={["Add Device", "Device Inventory", "Devices Asigned to Me"]}
            screens={["QRScan", "Devices", "UserDevices"]}
            navigation={navigation}
          />

          <Section
            title="Parcel"
            items={[
              "Create Parcel",
              "Parcel Inventory",
              "Parcel Asigned to Me",
              "Track Marketing Agent Parcel",
              "Damaged Parcel From Agent",
            ]}
            screens={[
              "CreateParcel",
              "Parcels",
              "UserParcel",
              "AgentParcelDetail",
              "DamagedParcelFromAgent",
            ]}
            navigation={navigation}
          />

          <Section
            title="Accessories"
            items={["Accessories Inventory"]}
            screens={["Accesories"]}
            navigation={navigation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Card = ({ title, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const Section = ({ title, items, screens, navigation }) => {
  const getIcon = (title) => {
    switch (title) {
      case "Device":
        return (
          <MaterialIcons
            name="devices"
            size={22}
            color="#333"
            style={styles.icon}
          />
        );
      case "Parcel":
        return (
          <FontAwesome5
            name="box"
            size={22}
            color="#333"
            style={styles.icon}
          />
        );
      case "Accessories":
        return (
          <Entypo
            name="tools"
            size={22}
            color="#333"
            style={styles.icon}
          />
        );
      default:
        return (
          <Ionicons
            name="help-circle-outline"
            size={22}
            color="#333"
            style={styles.icon}
          />
        );
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.sectionItem}
          onPress={() => navigation.navigate(screens[index])}
        >
          <View style={styles.row}>
            {getIcon(title)}
            <Text style={styles.sectionText}>{item}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    marginTop: 25,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  statsWrapper: {},
  statsScroll: {
    paddingHorizontal: 10,
    paddingTop: 30,
    gap: 10,
    paddingBottom: 30,
  },
  statCard: {
    marginRight: 10,
    width: 140,
    height: 80,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    alignItems: "center",
    justifyContent: "center",
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginTop: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  sectionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 20,
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignItems: "center",
    marginBottom: 10,
    color: "#333",
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#EAEAEA",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
