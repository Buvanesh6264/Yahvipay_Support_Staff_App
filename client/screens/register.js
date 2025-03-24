import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.28:5000/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(result);
      navigation.navigate('Login')
    } catch (error) {
      console.error(error);
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
          rules={{ required: 'Phone number is required' }}
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
          rules={{ required: 'Email is required' }}
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
          rules={{ required: 'Password is required' }}
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
  error: { color: 'red', textAlign: 'left', marginBottom: 10 },
});
