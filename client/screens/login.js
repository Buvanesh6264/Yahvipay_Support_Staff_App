import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Checkbox } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      phone: "",  
      password: "",  
    },
  });

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.replace("MainApp");
      }
    };
    checkLoginStatus();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage(""); 

    try {
      const response = await fetch(apiUrl + "/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.status === "success") {
        console.log("Login Successful:", result);
        await AsyncStorage.setItem("token", result.token);
        navigation.replace("MainApp"); 
        console.error(result.message);
        setErrorMessage(result.message); 
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Network error. Please try again later."); 
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGN IN</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={24} color="gray" style={styles.icon} />
        <Controller
          control={control}
          name="phone"
          rules={{
            required: "Phone number is required",
            pattern: { value: /^\d{10}$/, message: "Must be a 10-digit number" }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone Number"
              keyboardType="numeric"
              maxLength={10}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />
      </View>
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={24} color="gray" style={styles.icon} />
        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              secureTextEntry={!showPassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />
      </View>
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <View style={styles.checkboxContainer}>
        <Checkbox status={showPassword ? "checked" : "unchecked"} onPress={() => setShowPassword(!showPassword)} />
        <Text>Show Password</Text>
      </View>

      {errorMessage !== "" && <Text style={styles.error}>{errorMessage}</Text>}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.button}>
        LOGIN
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.linkBold}>Register Here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderBottomColor: "gray", marginBottom: 20 },
  icon: { marginRight: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  input: { flex: 1, backgroundColor: "transparent" },
  button: { backgroundColor: "black", padding: 10, marginTop: 20 },
  link: { textAlign: "center", marginTop: 20, color: "gray" },
  linkBold: { color: "purple", fontWeight: "bold" },
  error: { color: "red", textAlign: "center", marginBottom: 10 }, 
});
