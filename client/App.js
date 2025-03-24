import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./screens/appnavigator"; 

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
