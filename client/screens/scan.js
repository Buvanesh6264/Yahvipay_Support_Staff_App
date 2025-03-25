import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native"; 

export default function ScanPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();

  const isPermissionGranted = Boolean(permission?.granted);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>QR Code Scanner</Text>
      <View style={{ gap: 20 }}>
        <Pressable onPress={requestPermission}>
          <Text style={styles.buttonStyle}>Request Permissions</Text>
        </Pressable>
        <Pressable
          disabled={!isPermissionGranted}
          onPress={() => navigation.navigate("Scanner")} 
        >
          <Text style={[styles.buttonStyle, { opacity: !isPermissionGranted ? 0.5 : 1 }]}>
            Scan Code
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    justifyContent: "space-around",
    paddingVertical: 80,
  },
  title: {
    color: "white",
    fontSize: 40,
  },
  buttonStyle: {
    color: "#0E7AFE",
    fontSize: 20,
    textAlign: "center",
  },
});
