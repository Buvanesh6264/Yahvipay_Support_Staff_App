import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet ,SafeAreaView,StatusBar } from "react-native";
// import { Appbar } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const CreateParcelScreen = ({ route }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [agentid, setAgentid] = useState("");
  const [devices, setDevices] = useState([]);
  // const [scandevices, setScanDevices] = useState([]);
  const [accessoryId, setAccessoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [accessories, setAccessories] = useState([]);
  const [reciver, setReciver] = useState("");
  const [sender, setSender] = useState("");
  const [token, setToken] = useState(null);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  useEffect(()=>{
    console.log(devices,'useeffect')
    console.log(accessories,'accesory')
  },[devices,accessories]);

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
  
  
  // const handleAdddevice = async () => {
  //   console.log(scandevices,"device id")
  //   if (!scandevices) {
  //     Alert.alert("Error", "Please scan the device to add the device");
  //     return;
  //   }
  //   else{
    
  //     setAccessories((prev) => [...prev, { deviceid: scandevices}]);
  //     setScanDevices("");  
  //   }
  // };
  
  const handleAddAccessory = async () => {
    if (!accessoryId || !quantity) {
      Alert.alert("Error", "Please enter both Accessory ID and Quantity.");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/accessory/${accessoryId}`);
      const data = await response.json();
      console.log(data)
  
      if (data.instock===false) {
        Alert.alert("Error", "Accessory is not available.");
        return;
      }
  
      setAccessories((prev) => [...prev, { id: accessoryId, quantity }]);
      setAccessoryId("");
      setQuantity("");
    }catch (error) {
      console.error("Error checking accessory availability:", error);
      Alert.alert("Error", "Failed to check availability.");
    }
  };
  
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
      accessories: accessories,
      reciver,
      sender,
    };

    console.log("Sending data:", JSON.stringify(parcelData)); 
    try {
      const response = await fetch(`${apiUrl}/addparcel/addparcel`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parcelData),
      });
      console.log(token)

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
  }, [token, pickupLocation, destination, agentid, devices, accessories, reciver, sender]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Parcel</Text>
      <TextInput style={styles.input} placeholder="Pickup Location" value={pickupLocation} onChangeText={setPickupLocation} />
      <TextInput style={styles.input} placeholder="Destination" value={destination} onChangeText={setDestination} />
      <TextInput style={styles.input} placeholder="Agent ID" value={agentid} onChangeText={setAgentid} />
      <TextInput style={styles.input} placeholder="Accessory ID" value={accessoryId} onChangeText={setAccessoryId} />
      <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <Button title="Add Accessory" onPress={handleAddAccessory} />
      <FlatList
        data={accessories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>Accessory: {item.id}, Quantity: {item.quantity}</Text>
        )}
      />
      <TextInput style={styles.input} placeholder="Receiver" value={reciver} onChangeText={setReciver} />
      <TextInput style={styles.input} placeholder="Sender" value={sender} onChangeText={setSender} />

      <Button title="Scan Device" onPress={() => navigation.navigate("parcelqrscan")} />

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


      <Button title="Add Parcel" onPress={handleAddParcel} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // marginTop:19,
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight,
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

export default CreateParcelScreen;
