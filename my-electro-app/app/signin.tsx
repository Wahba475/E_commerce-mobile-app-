import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import React, { useState } from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseUrl = "http://192.168.100.54:5000";

const signin = () => {
  const [errormessage, setErrormessage] = useState("");
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async () => {
    setErrormessage("");
    try {
      const response = await axios.post(`${baseUrl}/user/login`, {
        email: formData.email,
        password: formData.password,
      });
      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        Alert.alert("Success", "Logged in successfully");
        router.push("/(tabs)");
      }
    } catch (error: any) {
      console.log("Error details:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrormessage(error.response.data.message);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        setErrormessage("Cannot connect to server. Please check your connection.");
      } else if (error.message) {
        setErrormessage(error.message);
      } else {
        setErrormessage("Something went wrong. Please try again.");
      }
    }
  };

  const navigateToSignUp = () => { router.push('/signup'); };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Ionicons name="hand-right-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.title}>Sign in to continue</Text>
              <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#666"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {errormessage !== "" && <Text style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{errormessage}</Text>}


              <TouchableOpacity style={styles.signInButton} activeOpacity={0.8} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.signUpPrompt}>
                Don't have an account?{' '}
                <TouchableOpacity onPress={navigateToSignUp}>
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24 },
  headerSection: { paddingTop: 40, paddingBottom: 50 },
  welcomeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  welcomeText: { fontSize: 18, fontWeight: '500', color: '#999' },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#999', fontWeight: '400' },
  formSection: { flex: 1 },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, color: '#fff', paddingVertical: 12 },
  eyeIcon: { padding: 4 },
  signInButton: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  signInButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  bottomSection: { alignItems: 'center', paddingBottom: 40 },
  signUpPrompt: { fontSize: 14, color: '#999' },
  signUpLink: { color: '#fff', fontWeight: '600', textDecorationLine: 'underline' },
});

export default signin;
