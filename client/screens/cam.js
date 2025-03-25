import { Camera } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Overlay } from "./overlay";

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <Camera
        style={StyleSheet.absoluteFillObject}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(async () => {
              await Linking.openURL(data);
              qrLock.current = false; 
            }, 500);
          }
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}
