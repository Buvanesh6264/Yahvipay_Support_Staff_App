import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView,SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-paper";
import { MaterialIcons,FontAwesome5 } from "@expo/vector-icons";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate("profile")}>
            <MaterialIcons name="account-circle" size={32} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Total Parcels</Text>
            <Text style={styles.statValue}>12</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Total Devices</Text>
            <Text style={styles.statValue}>8</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Pending Deliveries</Text>
            <Text style={styles.statValue}>5</Text>
          </Card>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("adddevice")}>
            <MaterialIcons name="point-of-sale" size={24} color="white" />
            <Text style={styles.actionText}>Add Device</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("parcels")}>
            <MaterialIcons name="local-shipping" size={24} color="white" />
            <Text style={styles.actionText}>Create Parcel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("parcels")}>
            <FontAwesome5 name="box-open" size={24} color="white" />
            <Text style={styles.viewText}>View Parcels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("devices")}>
            <MaterialIcons name="point-of-sale" size={24} color="white" />
            <Text style={styles.viewText}>View Devices</Text>
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
  safeContainer: { flex: 1, backgroundColor: "white", paddingTop: 20 },
  container: { padding: 20, backgroundColor: "white", flexGrow: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statCard: { flex: 1, padding: 15, margin: 5, backgroundColor: "#f3f3f3", alignItems: "center", borderRadius: 10 },
  statTitle: { fontSize: 14, color: "gray" },
  statValue: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  quickActions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  actionButton: { backgroundColor: "black", padding: 15, borderRadius: 10, flexDirection: "row", alignItems: "center" },
  actionText: { color: "white", marginLeft: 10, fontWeight: "bold" },
  viewContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  viewButton: { backgroundColor: "black", padding: 15, borderRadius: 10, width: "45%", alignItems: "center", flexDirection: "row", justifyContent: "center" },
  viewText: { fontSize: 16, fontWeight: "bold", color: "white", marginLeft: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  activityItem: { padding: 10, backgroundColor: "#f3f3f3", marginBottom: 5, borderRadius: 5 },
});

