import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Picker, Button, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddDeviceScreen = ({ navigation }) => {
  const [devicename, setDeviceName] = useState("");
  const [status, setStatus] = useState("available");
  const [agentid, setAgentId] = useState("");
  const [userid, setUserId] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

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

  const handleAddDevice = async () => {
    if (!devicename || !status) {
      Alert.alert("Error", "Device name and status are required");
      return;
    }

    const payload = {
      devicename,
      status,
      agentid: status !== "available" ? agentid : "",
      userid: status !== "available" ? userid : "",
      image,
    };

    try {
      const response = await fetch("http://192.168.1.45:5000/device/adddevice", {
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
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Device Name:</Text>
      <TextInput value={devicename} onChangeText={setDeviceName} style={styles.input} />

      <Text style={styles.label}>Status:</Text>
      <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)} style={styles.picker}>
        <Picker.Item label="Available" value="available" />
        <Picker.Item label="Assigned" value="assigned" />
        <Picker.Item label="Delivered" value="delivered" />
        <Picker.Item label="Damaged" value="damaged" />
      </Picker>

      {status !== "available" && (
        <>
          <Text style={styles.label}>Agent ID:</Text>
          <TextInput value={agentid} onChangeText={setAgentId} style={styles.input} />

          <Text style={styles.label}>User ID:</Text>
          <TextInput value={userid} onChangeText={setUserId} style={styles.input} />
        </>
      )}

      <Text style={styles.label}>Image URL:</Text>
      <TextInput value={image} onChangeText={setImage} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleAddDevice}>
        <Text style={styles.buttonText}>Add Device</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddDeviceScreen;