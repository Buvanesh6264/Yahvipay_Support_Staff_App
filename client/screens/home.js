import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [deviceCount, setDeviceCount] = useState(0);
  const [parcelCount, setParcelCount] = useState(0);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${apiUrl}/dashboardcounts`);
        const data = await res.json(); 
        if (res.ok) { 
          setDeviceCount(data.data.availableDevicesCount || 0);
          setParcelCount(data.data.parcelCount || 0);
          setPendingDeliveries(data.data.trackingCount || 0);
        } else {
          console.error(
            "Error fetching counts:",
            data.data.availableDevicesCount,
            data.data.parcelCount,
            data.data.trackingCount
          );
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCounts();
  }, []);
  

  return (
    <SafeAreaView style={styles.safeContainer}>
  <View style={styles.headerContainer}>
    <Text style={styles.title}>Dashboard</Text>
  </View>

  <View style={styles.statsWrapper}>
    {loading ? (
      <ActivityIndicator size="large" color="black" style={styles.loader} />
    ) : (
      <View style={styles.statsContainer}>
        <Card title="Total Parcels" value={parcelCount} />
        <Card title="Available Devices" value={deviceCount} />
        <Card title="Pending Deliveries" value={pendingDeliveries} />
      </View>
    )}
  </View>

  <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.sectionContainer}>
      <Section
        title="Device"
        items={["Add Device", "All Device", "My Device"]}
        screens={["QRScan", "Devices", "UserDevices"]}
        navigation={navigation}
      />

      <Section
        title="Parcel"
        items={["Create Parcel", "All Parcel", "My Parcel","Track Marketing Agent Parcel"]}
        screens={["CreateParcel", "Parcels", "UserParcel","AgentParcelDetail"]}
        navigation={navigation}
      />

      <Section
        title="Accessories"
        items={["All Accessories"]}
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
        return <MaterialIcons name="devices" size={22} color="#333" style={styles.icon} />;
      case "Parcel":
        return <FontAwesome5 name="box" size={22} color="#333" style={styles.icon} />;
      case "Accessories":
        return <Entypo name="tools" size={22} color="#333" style={styles.icon} />;
      default:
        return <Ionicons name="help-circle-outline" size={22} color="#333" style={styles.icon} />;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.sectionItem}
          onPress={() => {
            // navigate directly to screen name
            navigation.navigate(screens[index]);
          }}
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
    marginTop:25,
    // backgroundColor: "",
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
    // marginBottom:10,
  },
  statsContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20, gap: 3 ,paddingTop:30},
  statCard:{ 
    marginBottom: 20,
    height:80,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 4 },
  },
  statsWrapper: {
  },
  statTitle: { fontSize: 14, color: "#666" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#222" ,textAlign: "center",marginTop:10},
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  sectionContainer: {
    // marginTop: 10,
    alignItems: "center", 
    justifyContent: "center",
  },
  section: { 
    marginBottom: 20,
    // display:"flex", 
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
    sectionTitle: { fontSize: 20, fontWeight: "bold",alignItems: "center", marginBottom: 10, color: "#333" },
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
  }
});
