import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Modal ,
} from "react-native";
import { Appbar, Card, Text } from "react-native-paper";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function ParcelScreen() {
  const foces = useIsFocused();
  const [parcels, setParcels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    console.log("status", statusFilter);
    fetchParcels();
  }, [statusFilter]);

  useEffect(() => {
    if (foces) {
      if (route.params?.initialStatus) {
        setStatusFilter(route.params.initialStatus);
      } else {
        setStatusFilter("");
      }
    }
  }, [route.params?.initialStatus, foces]);

  const fetchParcels = async () => {
    try {
      const url = statusFilter
        ? `${apiUrl}/parcel/allparcels?status=${statusFilter}`
        : `${apiUrl}/parcel/allparcels`;
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data?.data)) {
        const sortedParcels = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setParcels(sortedParcels);
      } else {
        console.warn("Unexpected data format: data.data is not an array");
        setParcels([]);
      }
    } catch (error) {
      console.error("Error fetching parcels:", error);
      setParcels([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = parcels.filter((parcel) =>
    parcel.parcelNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTrackPackage = (parcelNumber) => {
    navigation.navigate("TrackPackage", { parcelNumber });
  };

  const handleViewPackage = (parcelNumber) => {
    navigation.navigate("ParcelDetail", { parcelNumber });
  };

  const handleSendParcel = (parcelNumber) => {
    Alert.alert("Send Parcel", "Are you sure you want to send this parcel?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            const updateResponse = await fetch(
              `${apiUrl}/parcel/updatestatus`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  parcelNumber: parcelNumber,
                  status: "sent",
                }),
              }
            );

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok || updateResult.status !== "success") {
              console.error("Failed to update status:", updateResult.message);
              return;
            }

            const trackingResponse = await fetch(
              `${apiUrl}/tracking/generate`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ parcelNumber }),
              }
            );

            const trackingResult = await trackingResponse.json();

            if (!trackingResponse.ok || trackingResult.status !== "success") {
              console.error(
                "Failed to generate tracking:",
                trackingResult.message
              );
              return;
            }

            Alert.alert("Success", "Parcel sent and tracking generated!");
            fetchParcels();
          } catch (error) {
            console.error("Error during send and tracking generation:", error);
          }
        },
      },
    ]);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "packed":
        return { color: "#6f42c1" };
      case "sent":
        return { color: "#17a2b8" };
      // case "received":
      //   return { color: "#ffc107" };
      // case "delivered":
      //   return { color: "#28a745" };
      default:
        return { color: "#6c757d" };
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content
          title="Parcel Inventory"
          titleStyle={styles.navbarTitle}
        />
        <TouchableOpacity style={styles.addButton}>
          <Ionicons
            name="add-outline"
            size={24}
            color="white"
            onPress={() => navigation.navigate("CreateParcel")}
          />
        </TouchableOpacity>
      </Appbar.Header>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search by Parcel Number"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearIcon}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.statusText}>
            {statusFilter ? statusFilter.toUpperCase() : "All"}
          </Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Status</Text>
              {["", "packed", "sent"].map((statusOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setStatusFilter(statusOption);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>
                    {statusOption ? statusOption.toUpperCase() : "All"}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : filtered.length === 0 ? (
        <Text style={styles.noDataText}>Parcel not found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.parcelNumber.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Cover
                source={{
                  uri: "https://imgs.search.brave.com/mN2Zk0Wyu2uZ81v8jKIq5Dp9bzIEJKKjJcwIsNZxWgc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzM0Lzc3LzEz/LzM2MF9GXzYzNDc3/MTM2NF9aUmFwZ1ZH/Z0plZFBtSk04eEhV/ckNYS3ZRRUhFU2o1/YS5qcGc",
                }}
                style={styles.image}
              />
              <Card.Title
                title={`Parcel No: ${item.parcelNumber}`}
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <View style={styles.statusContainer}>
                  <Text
                    style={[styles.statusText, getStatusStyle(item.status)]}
                  >
                    <Text style={styles.boldLabel}>Status:</Text>{" "}
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </Card.Content>
              <View style={styles.buttonContainer}>
                {item.status?.toLowerCase() === "packed" ? (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleSendParcel(item.parcelNumber)}
                  >
                    <Ionicons name="send-outline" size={20} color="white" />
                    <Text style={styles.buttonText}> Send Parcel</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => handleTrackPackage(item.parcelNumber)}
                  >
                    <Text style={styles.buttonText}>Track Package</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewPackage(item.parcelNumber)}
                >
                  <Text style={styles.buttonText}>View Package</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9", paddingBottom: 10 },
  navbar: { backgroundColor: "#007bff", elevation: 4 },
  navbarTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: { marginTop: 50 },
  addButton: { padding: 10 },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 5,
    paddingBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingHorizontal: 10,
  },
  trackButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6f42c1",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 3,
  },
  viewButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    margin: 15,
    alignItems: "center",
    elevation: 3,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  clearIcon: { marginLeft: 10 },
  noDataText: { textAlign: "center", fontSize: 18, marginTop: 50 },
  filterContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  filterLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
  },
  // picker: { height: 50, width: "100%" },
  image: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10 },
  boldLabel: { fontWeight: "bold" },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 30,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancel: {
    marginTop: 15,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
});
