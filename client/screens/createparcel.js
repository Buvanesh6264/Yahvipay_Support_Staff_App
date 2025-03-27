import React, { useState } from "react";
import { View, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Appbar, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateParcelScreen({ navigation }) {
  const [form, setForm] = useState({
    deviceid: "",
    accessories: "",
    pickupLocation: "",
    destination: "",
    agentid: "",
    userid: "",
    sender: "",
    reciver: "",
  });
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;


  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const validateInputs = () => {
    let errors = [];

    if (!form.deviceid.trim()) errors.push("Device ID is required.");
    if (!form.pickupLocation.trim()) errors.push("Pickup location is required.");
    if (!form.destination.trim()) errors.push("Destination is required.");
    if (!form.agentid.trim()) errors.push("Agent ID is required.");
    if (!form.userid.trim()) errors.push("User ID is required.");
    if (!form.sender.trim()) errors.push("Sender is required.");
    if (!form.reciver.trim()) errors.push("Receiver is required.");

    if (form.accessories && typeof form.accessories !== "string") {
      errors.push("Accessories must be a comma-separated string.");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateInputs();
    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(apiUrl+"/parcel/addparcel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          ...form,
          accessories: form.accessories ? form.accessories.split(",").map((a) => a.trim()) : [],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Parcel added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Failed to add parcel.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Parcel" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.form}>
        {Object.keys(form).map((key) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={form[key]}
            onChangeText={(value) => handleChange(key, value)}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Parcel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  navbar: { backgroundColor: "black" },
  form: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
