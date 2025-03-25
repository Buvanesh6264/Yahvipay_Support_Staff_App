import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';

export default function AddDeviceScreen({ navigation }) {
  const [devicename, setDeviceName] = useState('');
  const [status, setStatus] = useState('available');
  const [image, setImage] = useState('');
  const [userId, setUserId] = useState('');
  const [supportId, setSupportId] = useState('');
  const [agentId, setAgentId] = useState('');

  const validStatuses = ['available', 'assigned', 'delivered', 'damaged'];

  const validateInputs = () => {
    if (!devicename.trim()) {
      Alert.alert('Validation Error', 'Device Name is required!');
      return false;
    }
    if (!validStatuses.includes(status.toLowerCase())) {
      Alert.alert('Validation Error', `Invalid status. Allowed values: ${validStatuses.join(', ')}`);
      return false;
    }
    if (image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(image)) {
      Alert.alert('Validation Error', 'Invalid image URL format!');
      return false;
    }
    if (status !== 'available' && (!userId.trim() || !supportId.trim() || !agentId.trim())) {
      Alert.alert('Validation Error', 'User ID, Support ID, and Agent ID are required for this status!');
      return false;
    }
    return true;
  };

  const handleAddDevice = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch('http://192.168.1.55:5000/device/adddevice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devicename, status, image, userId, supportId, agentId }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Device added successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Error', data.message || 'Failed to add device');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Device" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Device Name</Text>
        <TextInput style={styles.input} placeholder="Enter Device Name" value={devicename} onChangeText={setDeviceName} />

        <Text style={styles.label}>Status</Text>
        <TextInput style={styles.input} placeholder="Enter Status" value={status} onChangeText={setStatus} />

        <Text style={styles.label}>Image URL</Text>
        <TextInput style={styles.input} placeholder="Enter Image URL" value={image} onChangeText={setImage} />

        {status !== 'available' && (
          <>
            <Text style={styles.label}>User ID</Text>
            <TextInput style={styles.input} placeholder="Enter User ID" value={userId} onChangeText={setUserId} />

            <Text style={styles.label}>Support ID</Text>
            <TextInput style={styles.input} placeholder="Enter Support ID" value={supportId} onChangeText={setSupportId} />

            <Text style={styles.label}>Agent ID</Text>
            <TextInput style={styles.input} placeholder="Enter Agent ID" value={agentId} onChangeText={setAgentId} />
          </>
        )}

        <Button mode="contained" onPress={handleAddDevice} style={styles.button}>Add Device</Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  navbar: { backgroundColor: 'black' },
  navbarTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  button: { marginTop: 10 },
});