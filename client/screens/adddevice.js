import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const AddDeviceScreen = ({ navigation, route }) => {
  const [devicename, setDeviceName] = useState("");
  const [status, setStatus] = useState("available");
  const [agentid, setAgentId] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [productId, setProductId] = useState("");
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        if (!savedToken) {
          Alert.alert("Error", "No token found. Please log in.");
          navigation.navigate("Login");
          return;
        }
        setToken(savedToken);
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);
  useEffect(() => {
    if (route?.params?.scannedId) {
      setProductId(route.params.scannedId);
    }
  }, [route?.params?.scannedId]);
  

  const handleAddDevice = async () => {
    if (!devicename || !status || !productId) {
      Alert.alert("Error", "Device name, status, and scanned ID are required");
      return;
    }
  
    const payload = {
      devicename,
      status,
      deviceid: productId, 
      agentid: status !== "available" ? agentid : "",
      image,
    };
  
    try {
      const response = await fetch(`${apiUrl}/device/adddevice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert("Success", "Device added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", result.message || "Failed to add device");
      }
    } catch (error) {
      console.error("Error adding device:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <Text style={styles.title}>Add New Device</Text>

        <Text style={styles.label}>Device Name</Text>
        <TextInput
          value={devicename}
          onChangeText={setDeviceName}
          style={styles.input}
          placeholder="Enter device name"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Available" value="available" />
            <Picker.Item label="Assigned" value="assigned" />
            <Picker.Item label="Delivered" value="delivered" />
            <Picker.Item label="Damaged" value="damaged" />
          </Picker>
        </View>

        {status !== "available" && (
          <>
            <Text style={styles.label}>Agent ID</Text>
            <TextInput
              value={agentid}
              onChangeText={setAgentId}
              style={styles.input}
              placeholder="Enter agent ID"
            />
          </>
        )}

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          value={image}
          onChangeText={setImage}
          style={styles.input}
          placeholder="Enter image URL"
        />

        <TouchableOpacity style={styles.button} onPress={handleAddDevice}>
          <Text style={styles.buttonText}>Add Device</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343a40",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  picker: {
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddDeviceScreen;
