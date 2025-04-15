import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,Modal  } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const UpdateParcelScreen = ({ route }) => {
  const [agentid, setAgentid] = useState("");
  const [devices, setDevices] = useState([]);
  const [accessories, setAccessories] = useState("");
  const [Existingdevices, setExistingDevices] = useState([]);
  const [ExistingAccessories, setExistingAccessories] = useState([]);
  const [token, setToken] = useState(null);
  const [parcelNumber, setParcelNumber] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccessoryId, setCurrentAccessoryId] = useState("");
  const [quantity, setQuantity] = useState("");
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
        const response = await fetch(`${apiUrl}/parcel/parcelNumber`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ parcelNumber }),
        });
        const result = await response.json();
        if (response.ok) {
          setAgentid(result.data.agentid);
          setExistingDevices(prevDevices => {if (prevDevices.some((device) => device === result.data.devices)) {
            Alert.alert("Duplicate Device", "This device has already been scanned.");
            return prevDevices;
          }
          return [...prevDevices, ...(result.data.devices || [])];
        });
        setExistingAccessories(prevDevices => {
        return [...prevDevices, ...(result.data.accessories || [])];
      });
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
      const { id, status, type } = route.params.scannedDevice;
      console.log(type)
      if (type === "Device") {
        if (status === "available") {
          setDevices((prevDevices) => {
            if (prevDevices.includes(id)) {
              Alert.alert("Duplicate Device", "This device has already been scanned.");
              return prevDevices;
            }
            return [...prevDevices, id];
          });
        } else {
          Alert.alert("Error", `Device ${id} is not available.`);
        }
      } else if (type === "Accesory") {
        console.log("hi")
        setCurrentAccessoryId(id);
        setQuantity("");
        setModalVisible(true);
      }
    }
  }, [route.params?.scannedDevice]);
  
  const handleAddAccessory = () => {
    const parsedQuantity = parseInt(quantity, 10);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid number.");
      return;
    }

    setAccessories((prevAccessories) => [
      ...prevAccessories,
      { id: currentAccessoryId, quantity: parsedQuantity },
    ]);

    setModalVisible(false);
  };
  const handleUpdateParcel = useCallback(async () => {
    if (!token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }
  
    if ((devices.length > 0 && accessories.length > 0) || (devices.length === 0 && accessories.length === 0)) {
      Alert.alert("Error", "You can update either devices or accessories at a time, not both.");
      return;
    }
  
    const parcelData = { agentid, devices, parcelNumber, accessories };
    try {
      const response = await fetch(`${apiUrl}/parcel/Updateparcel`, {
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
  }, [token, agentid, devices, accessories]);
  

  return (
    <SafeAreaView style={styles.container}>
  <StatusBar barStyle="dark-content" backgroundColor="#fff" />
  <Text style={styles.title}>Update Parcel</Text>
  <TextInput style={styles.input} placeholder="Agent ID" value={agentid} editable={false} />

  <Text style={styles.sectionTitle}>Existing Parcel Devices</Text>
  {Existingdevices.length === 0 ? (
    <Text style={styles.noDevicesText}>No existing devices in this parcel.</Text>
  ) : (
    <FlatList
      data={Existingdevices}
      keyExtractor={(item) => item.toString()}
      renderItem={({ item }) => (
        <View style={styles.deviceItemContainer}>
          <Text style={styles.deviceItem}>Device ID: {item}</Text>
        </View>
      )}
    />
  )}
  <Text style={styles.sectionTitle}>Existing Parcel Accessories</Text>
  {ExistingAccessories.length === 0 ? (
    <Text style={styles.noDevicesText}>No existing Accessories in this parcel.</Text>
  ) : (
    <FlatList
    data={ExistingAccessories}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <Text>Accessory: {item.id}, Quantity: {item.quantity}</Text>
    )}
  />  
  )}

  <Button title="Scan Device/Scan Accessory" onPress={() => navigation.navigate("UpdateQRScan")} />
  <Text style={styles.sectionTitle}>Scanned Devices</Text>
  
  {devices.length === 0 ? (
    <Text style={styles.noDevicesText}>No new devices scanned.</Text>
  ) : (
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
  )}
  <Text style={styles.sectionTitle}>Scanned Accessories</Text>
  {accessories.length === 0 ? (
    <Text style={styles.noDevicesText}>No new accessories scanned.</Text>
  ) : (
    <FlatList
        data={accessories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>Accessory: {item.id}, Quantity: {item.quantity}</Text>}
      />
  )}

  <Button title="Update Parcel" onPress={handleUpdateParcel} />
  <Modal 
        visible={modalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Accessory Quantity</Text>
            <Text style={styles.modalSubtitle}>Accessory ID: {currentAccessoryId}</Text>
            
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
              placeholderTextColor="#999"
              style={styles.modalInput}
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddAccessory}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  noDevicesText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#888",
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default UpdateParcelScreen;
