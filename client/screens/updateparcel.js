import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const UpdateParcelScreen = ({ route }) => {
  const [agentid, setAgentid] = useState("");
  const [devices, setDevices] = useState([]);
  const [token, setToken] = useState(null);
  const [parcelNumber, setParcelNumber] = useState(null);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const storedParcelNumber = await AsyncStorage.getItem("parcelNumber");

        if (!savedToken) {
          Alert.alert("Error", "No token found. Please log in.");
          navigation.navigate("Login");
          return;
        }
        if (!storedParcelNumber) {
          Alert.alert("Error", "No parcel number found.");
          return;
        }

        setToken(savedToken);
        setParcelNumber(storedParcelNumber);
      } catch (error) {
        console.error("Error fetching stored data:", error);
      }
    };
    fetchStoredData();
  }, []);

  useEffect(() => {
    const fetchParcelData = async () => {
      try {
        if (!parcelNumber) return;
        const response = await fetch(`${apiUrl}/parcel/${parcelNumber}`);
        const result = await response.json();
        if (response.ok) {
          setAgentid(result.data.agentid);
          setDevices(result.data.devices || []);
        } else {
          Alert.alert("Error", result.message || "Failed to find parcel");
        }
      } catch (error) {
        Alert.alert("Error", "Something went wrong while fetching parcel data");
      }
    };
    if (token) fetchParcelData();
  }, [token, parcelNumber]);

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

  const handleUpdateParcel = useCallback(async () => {
    if (!token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (devices.length === 0) {
      Alert.alert("Error", "Please scan at least one available device.");
      return;
    }

    const parcelData = { agentid, devices };
    try {
      const response = await fetch(`${apiUrl}/update/Updateparcel`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parcelData),
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Parcel updated successfully");
        navigation.goBack();  
      } else {
        Alert.alert("Error", result.message || "Failed to update parcel");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  }, [token, agentid, devices]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>Update Parcel</Text>
      <TextInput style={styles.input} placeholder="Agent ID" value={agentid} editable={false} />
      <Button title="Scan Device" onPress={() => navigation.navigate("updateqrscan")} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <View style={styles.deviceItemContainer}>
            <Text style={styles.deviceItem}>Device ID: {item}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setDevices((prev) => prev.filter((device) => device !== item))}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Update Parcel" onPress={handleUpdateParcel} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  deviceItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  deviceItem: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UpdateParcelScreen;
