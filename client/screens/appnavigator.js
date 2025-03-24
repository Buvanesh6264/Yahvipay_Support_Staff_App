import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./login";
import Register from "./register";
import HomeScreen from "./home";
import devices from "./devices"
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={HomeScreen} /> 
      <Stack.Screen name="devices" component={devices} /> 
      {/* <Stack.Screen name="Home" component={HomeScreen} />  */}
    </Stack.Navigator>
  );
}
