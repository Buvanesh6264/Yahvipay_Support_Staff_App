import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      name: "",  
      phone: "",  
      email: "",  
      password: "",  
    },
  });

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch(apiUrl+'/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        navigation.navigate('Login');
      } else {
        if (result.errors) {
          if (result.errors.phone) setError("phone", { type: "server", message: result.errors.phone });
          if (result.errors.email) setError("email", { type: "server", message: result.errors.email });
          if (result.errors.password) setError("password", { type: "server", message: result.errors.password });
        } else {
          setError("general", { type: "server", message: result.message || "Registration failed. Please try again." });
        }
      }
    } catch (error) {
      setError("general", { type: "server", message: "Network error. Please try again." });
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>REGISTER</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="person" size={24} color="gray" style={styles.icon} />
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Name" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
          )}
        />
      </View>
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={24} color="gray" style={styles.icon} />
        <Controller
          control={control}
          name="phone"
          rules={{
            required: 'Phone number is required',
            pattern: { value: /^\d{10}$/, message: 'Invalid phone number (10 digits required)' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Phone" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
          )}
        />
      </View>
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={24} color="gray" style={styles.icon} />
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email format' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Email" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
          )}
        />
      </View>
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={24} color="gray" style={styles.icon} />
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            pattern: { 
              value: /^[A-Za-z\d@$!%*?&]{6,}$/, 
              message: 'Password must be 8+ chars, include uppercase, lowercase, number & special character'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Password" secureTextEntry={!showPassword} onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
          )}
        />
      </View>
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <View style={styles.checkboxContainer}>
        <Checkbox status={showPassword ? 'checked' : 'unchecked'} onPress={() => setShowPassword(!showPassword)} />
        <Text>Show Password</Text>
      </View>

      {errors.general && <Text style={styles.error}>{errors.general.message}</Text>}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.button}>REGISTER</Button>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomColor: 'gray', marginBottom: 20 },
  icon: { marginRight: 10 },
  input: { flex: 1, backgroundColor: 'transparent' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  button: { backgroundColor: 'black', padding: 10, marginTop: 20 },
  link: { textAlign: 'center', marginTop: 20, color: 'gray' },
  linkBold: { color: 'purple', fontWeight: 'bold' },
  error: { color: "red", textAlign: "center", marginBottom: 10 }, 
});
