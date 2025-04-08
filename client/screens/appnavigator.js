import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import Login from "./login";
import Register from "./register";
import HomeScreen from "./home";
import Devices from "./devices";
import AddDeviceScreen from "./adddevice";
import DeviceDetailScreen from "./devicedetail";
import ParcelDetail from "./parceldetial";
import ParcelScreen from "./parcel";
import ProfilePage from "./profile";
import TrackingScreen from "./tracking";
import UserDeviceScreen from "./userdevice";
import UserParcelScreen from "./userparcel";
import CreateParcelScreen from "./createparcel";
import Scanner from "./scanner";
import ParcelScanner from "./parceldevicescanner";
import AccesoriesScreen from "./accesories";
import UpdateParcelScreen from "./updateparcel";
import UpdateScanner from "./updatescanner";
import AgentParcelDetail from "./agentparceltracking";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function DevicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="devices" component={Devices} />
      <Stack.Screen name="adddevice" component={AddDeviceScreen} />
      <Stack.Screen name="devicedetail" component={DeviceDetailScreen} />
      <Stack.Screen name="userdevices" component={UserDeviceScreen} />
      <Stack.Screen name="qrscan" component={Scanner} />
    </Stack.Navigator>
  );
}

function ParcelsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="parcels" component={ParcelScreen} />
      <Stack.Screen name="parceldetial" component={ParcelDetail} />
      <Stack.Screen name="TrackPackage" component={TrackingScreen} />
      <Stack.Screen name="userspakage" component={UserParcelScreen} />
      <Stack.Screen name="createparcel" component={CreateParcelScreen} />
      <Stack.Screen name="parcelqrscan" component={ParcelScanner} />
      <Stack.Screen name="accesories" component={AccesoriesScreen} />
      <Stack.Screen name="UpdateParcel" component={UpdateParcelScreen} />
      <Stack.Screen name="updateqrscan" component={UpdateScanner} />
      <Stack.Screen name="agentparcel" component={AgentParcelDetail} />
    </Stack.Navigator>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "devices") iconName = "devices";
          else if (route.name === "parcels") iconName = "local-shipping";
          else if (route.name === "profile") iconName = "person";
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: true,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="devices" component={DevicesStack} />
      <Tab.Screen name="parcels" component={ParcelsStack} />
      <Tab.Screen name="profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="MainApp" component={BottomTabs} />
    </Stack.Navigator>
  );
}