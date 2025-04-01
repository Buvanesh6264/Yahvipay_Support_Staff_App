import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity ,Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";

export default function ParcelScanner({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productId, setProductId] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true); 

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true); 

      return () => {
        setIsCameraActive(false); 
      };
    }, [])
  );

  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true);
  console.log(data)
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/device/${data}`);
      const result = await response.json();
      console.log(result)
  
      if (response.ok && result.device) {
        console.log(result.device.status)
        if (result.device.status === "available") {
            navigation.navigate("createparcel", { scannedDevice: { id: data, status: result.device.status } });
        } else {
          Alert.alert("Error", `Device ${data} is not available.`);
        }
      } else {
              Alert.alert("New Device", `Device ID: ${data} not found.Add the device`);
            }
    } catch (error) {
      console.error("Error checking device:", error);
      Alert.alert("Error", "Could not check device. Try again.");
    }
  };
  
  
  

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {isCameraActive && (
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["upc_a", "ean13", "code128"],
            }}
            style={styles.camera}
          >
            <View style={styles.scannerFrame}>
              <Text style={styles.scanText}>Scan</Text>
            </View>
          </CameraView>
        </View>
      )}

      <View style={styles.bottomContainer}>
        <Text style={styles.label}>Barcode</Text>
        <TextInput style={styles.input} value={productId} editable={false} />

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => alert(`Scanned: ${productId}`)}
        >
          <Text style={styles.confirmButtonText}>CONFIRM</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              setProductId("");
            }}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  cameraContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  scannerFrame: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    width: 250, 
    height: 120, 
    borderWidth: 2,
    borderColor: "#007AFF", 
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center", 
    alignItems: "center", 
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", 
  },
  
  bottomContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#F5F5F5",
    marginBottom: 20,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scanAgainButton: {
    marginTop: 10,
  },
  scanAgainText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

