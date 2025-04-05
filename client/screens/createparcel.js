import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons, FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";


const CreateParcelScreen = ({ route }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [agentid, setAgentid] = useState("");
  const [agentList, setAgentList] = useState([]);
  const [devices, setDevices] = useState([]);
  const [reciver, setReciver] = useState("");
  const [sender, setSender] = useState("");
  const [token, setToken] = useState(null);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        if (!savedToken) {
          Alert.alert("Error", "No token found. Please log in.");
          navigation.navigate("Login");
          return;
        }
        setToken(savedToken);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("http://192.168.1.40:4000/allAgentId");
        const data = await response.json();
        if (response.ok) {
          const ids = data.map((agent) => agent.id);
          setAgentList(ids);
        } else {
          Alert.alert("Error", "Failed to fetch agent list");
        }
      } catch (error) {
        console.error("Agent fetch error:", error);
        Alert.alert("Error", "Could not fetch agents");
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    if (route.params?.scannedDevice) {
      const { id, status } = route.params.scannedDevice;
      if (status === "available") {
        setDevices((prevDevices) => {
          if (prevDevices.some((device) => device === id)) {
            Alert.alert("Duplicate Device", "This device has already been scanned.");
            return prevDevices;
          }
          return [...prevDevices, id];
        });
      } else {
        Alert.alert("Error", `Device ${id} is not available.`);
      }
    }
  }, [route.params?.scannedDevice]);

  const handleAddParcel = useCallback(async () => {
    if (!token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (devices.length === 0) {
      Alert.alert("Error", "Please scan at least one available device.");
      return;
    }

    const parcelData = {
      pickupLocation,
      destination,
      agentid,
      devices,
      reciver,
      sender,
    };

    try {
      const response = await fetch(`${apiUrl}/parcel/addparcel`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parcelData),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Parcel added successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", result.message || "Failed to add parcel");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  }, [token, pickupLocation, destination, agentid, devices, reciver, sender]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}> Create New Parcel</Text>

        <Text style={styles.sectionTitle}>Devices</Text>
        <Button
          title="Scan Device"
          color="#4CAF50"
          onPress={() => navigation.navigate("parcelqrscan")}
        />

        {devices.length > 0 && (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <View style={styles.deviceItemContainer}>
                <Text style={styles.deviceItem}>Device ID: {item}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    setDevices((prev) => prev.filter((device) => device !== item))
                  }
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <Text style={styles.sectionTitle}>Parcel Details</Text>
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup location"
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />

        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
        />

        <Text style={styles.label}>Select Agent</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={agentid}
            onValueChange={(itemValue) => setAgentid(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Agent ID --" value="" />
            {agentList.map((id) => (
              <Picker.Item key={id} label={id} value={id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Receiver Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter receiver's name"
          value={reciver}
          onChangeText={setReciver}
        />

        <Text style={styles.label}>Sender Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter sender's name"
          value={sender}
          onChangeText={setSender}
        />

        <View style={{ marginTop: 20 }}>
          <Button title=" Submit Parcel" color="#1E88E5" onPress={handleAddParcel} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: "#f7f9fc",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1E88E5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#333",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  deviceItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  deviceItem: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CreateParcelScreen;
