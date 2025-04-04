import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Retrieved Token:", token);
        if (!token) {
          console.error("No token found");
          setLoading(false);
          navigation.navigate("Login");
          return;
        }
        const response = await fetch(apiUrl+"/user/userdata", {
          method: "GET",
          headers: {
            Authorization: token, 
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user:", response.status);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const token = await AsyncStorage.removeItem("token");
    navigation.replace("Login");
    console.log("Retrieved Token:", token);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="black" style={styles.loader} />;
  }

  if (!user) {
    return <Text style={styles.noData}>No user data found.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialIcons name="account-circle" size={100} color="gray" style={styles.profileIcon} />
        <Text style={styles.title}>{user.name}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.info}>{user.phone}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.info}>{user.email}</Text>
          <Text style={styles.label}>Support ID:</Text>
          <Text style={styles.info}>{user.supportid}</Text>
        </View>

        {/* <TouchableOpacity style={styles.button} onPress={() => console.log("Edit Profile")}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileIcon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoContainer: {
    width: "100%",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  loader: {
    marginTop: 50,
  },
  noData: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});

export default ProfilePage;
