import React ,{useState,useEffect} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-paper";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
// import AsyncStorage from '@react-native-async-storage/async-storage';


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
        // const token = await AsyncStorage.getItem('token');
        const deviceRes = await fetch(`${apiUrl}/device/availabledevicescount`);
        const parcelRes = await fetch(`${apiUrl}/parcel/parcelcount`
          // , {
          //   headers: {
          //     Authorization: token,
          //   },
          // }
        )
        const tracking = await fetch(`${apiUrl}/tracking/trackingcount`);

  
        const deviceData = await deviceRes.json();
        const parcelData = await parcelRes.json();
        const trackingData = await tracking.json();
        console.log(`this is${deviceData.data}`)
        console.log(`this parcel${parcelData.data}`)
        if (deviceRes.ok && parcelRes.ok) {
          setDeviceCount(deviceData.data || 0);
          setParcelCount(parcelData.data || 0);
          setPendingDeliveries(trackingData.data || 0); 
        } else {
          console.error("Error fetching counts:", deviceData.message, parcelData.message);
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Dashboard</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="black" style={styles.loader} />
        ) : (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Total Parcels</Text>
              <Text style={styles.statValue}>{parcelCount}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Available Devices</Text>
              <Text style={styles.statValue}>{deviceCount}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Pending Deliveries</Text>
              <Text style={styles.statValue}>{pendingDeliveries}</Text>
            </Card>
          </View>
        )}

        {/* <View style={styles.quickActions}>
         <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("devices", { screen: "adddevice" })}>
            <MaterialIcons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.actionText}>Add Device</Text>
          </TouchableOpacity>   
        </View> */}

        <View style={styles.viewContainer}>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("parcels", { screen: "parcels" })}>
            <FontAwesome5 name="box-open" size={24} color="white" />
            <Text style={styles.viewText}>All Parcels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("devices", { screen: "devices" })}>
            <MaterialIcons name="devices" size={24} color="white" />
            <Text style={styles.viewText}>All Devices</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("parcels", { screen: "userspakage" })}>
            <FontAwesome5 name="user" size={24} color="white" />
            <Text style={styles.viewText}>Your Parcels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("devices", { screen: "userdevices" })}>
            <MaterialIcons name="personal-video" size={24} color="white" />
            <Text style={styles.viewText}>Your Devices</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("devices", { screen: "qrscan" })}>
            <FontAwesome5 name="qrcode" size={24} color="white" />
            <Text style={styles.viewText}>Add Device</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("parcels", { screen: "createparcel" })}>
            <MaterialIcons name="local-shipping" size={24} color="white" />
            <Text style={styles.actionText}>Create Parcel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F4F4F4", paddingTop: 20 },
  container: { padding: 20, backgroundColor: "#FFFFFF", flexGrow: 1 },
  header: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statCard: { flex: 1, padding: 20, margin: 5, backgroundColor: "#FFFFFF", alignItems: "center", borderRadius: 12, elevation: 3 },
  statTitle: { fontSize: 14, color: "#666" },
  statValue: { fontSize: 20, fontWeight: "bold", marginTop: 5, color: "#222" },
  quickActions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  actionButton: { backgroundColor: "#007AFF", padding: 15, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", width: "45%" },
  actionText: { color: "white", marginLeft: 10, fontWeight: "bold", fontSize: 16 },
  viewContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  viewButton: { backgroundColor: "#4A4A4A", padding: 15, borderRadius: 12, width: "45%", alignItems: "center", flexDirection: "row", justifyContent: "center" },
  viewText: { fontSize: 16, fontWeight: "bold", color: "white", marginLeft: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  activityItem: { padding: 12, backgroundColor: "#EAEAEA", marginBottom: 5, borderRadius: 6 },
});
