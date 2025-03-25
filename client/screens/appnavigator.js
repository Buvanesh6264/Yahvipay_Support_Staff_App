import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./login";
import Register from "./register";
import HomeScreen from "./home";
import devices from "./devices"
import AddDeviceScreen from "./adddevice";
import DeviceDetailScreen from "./devicedetail";
import ParcelDetail from "./parceldetial";
import ParcelScreen from "./parcel";
import ProfilePage from "./profile";
// import ScanPage from "./scan";
// import Scanner from "./cam";
// import ScanDeviceScreen from "./qrscandevicebyid";
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={HomeScreen} /> 
      <Stack.Screen name="devices" component={devices} /> 
      <Stack.Screen name="adddevice" component={AddDeviceScreen} /> 
      {/* <Stack.Screen name="qrdevice" component={ScanDeviceScreen} />  */}
      <Stack.Screen name="devicedetail" component={DeviceDetailScreen} /> 
      <Stack.Screen name="parceldetial" component={ParcelDetail} /> 
      <Stack.Screen name="parcels" component={ParcelScreen} /> 
      <Stack.Screen name="profile" component={ProfilePage} />
      {/* <Stack.Screen name="scan" component={ScanPage} />  */}
      {/* <Stack.Screen name="Scanner" component={Scanner} />  */}
    </Stack.Navigator>
  );
}
