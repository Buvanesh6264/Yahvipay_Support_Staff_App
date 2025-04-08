    import React from "react";
    import { createStackNavigator } from "@react-navigation/stack";
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
import BottomTabs from "./botemtabnavigator";

    const Stack = createStackNavigator();

    export default function StackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Devices" component={Devices} />
        <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
        <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
        <Stack.Screen name="UserDevices" component={UserDeviceScreen} />
        <Stack.Screen name="QRScan" component={Scanner} />
        <Stack.Screen name="Parcels" component={ParcelScreen} />
        <Stack.Screen name="ParcelDetail" component={ParcelDetail} />
        <Stack.Screen name="TrackPackage" component={TrackingScreen} />
        <Stack.Screen name="UserParcel" component={UserParcelScreen} />
        <Stack.Screen name="CreateParcel" component={CreateParcelScreen} />
        <Stack.Screen name="ParcelQRScan" component={ParcelScanner} />
        <Stack.Screen name="Accesories" component={AccesoriesScreen} />
        <Stack.Screen name="UpdateParcel" component={UpdateParcelScreen} />
        <Stack.Screen name="UpdateQRScan" component={UpdateScanner} />
        <Stack.Screen name="AgentParcelDetail" component={AgentParcelDetail} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        </Stack.Navigator>
    );
    }
