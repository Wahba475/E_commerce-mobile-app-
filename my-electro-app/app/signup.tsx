import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
  } from "react-native";
  import React, { useState } from "react";
  import { router, Stack } from "expo-router";
  import { Ionicons } from "@expo/vector-icons";
  import { LinearGradient } from "expo-linear-gradient";
  import axios from "axios";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  const baseUrl = "http://192.168.100.54:5000";
  
  const signup = () => {
    const [errormessage, setErrormessage] = useState("");
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
    const handleInputChange = (field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  
    const handleSignUp = async () => {
      setErrormessage("");
      if (formData.password !== formData.confirmPassword) {
        setErrormessage("Passwords do not match");
        return;
      }
      try {
        const response = await axios.post(`${baseUrl}/user/register`, {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        if (response.data.token) {
          await AsyncStorage.setItem("token", response.data.token);
          Alert.alert("Success", "Account created successfully");
          router.push("/(tabs)");
        }
      } catch (error: any) {
        if (error.response) {
          // Server responded with a status code out of 2xx range
          setErrormessage(
            `Error ${error.response.status}: ${error.response.data?.message || JSON.stringify(error.response.data)}`
          );
        } else if (error.request) {
          // Request was made but no response received
          setErrormessage("No response from server. Please check your connection.");
        } else {
          // Something else went wrong
          setErrormessage(`Error: ${error.message}`);
        }
      }
      
    };
  
    const navigateToLogin = () => {
      router.push("/signin");
    };
  
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
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
          }}
        />
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerSection}>
                <Text style={styles.title}>Create an account</Text>
                <Text style={styles.subtitle}>
                  Join us and start your journey today
                </Text>
              </View>
  
              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your full name"
                      placeholderTextColor="#666"
                      value={formData.fullName}
                      onChangeText={(value) =>
                        handleInputChange("fullName", value)
                      }
                      autoCapitalize="words"
                    />
                  </View>
                </View>
  
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#666"
                      value={formData.email}
                      onChangeText={(value) => handleInputChange("email", value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
  
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#666"
                      value={formData.password}
                      onChangeText={(value) =>
                        handleInputChange("password", value)
                      }
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
  
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Confirm your password"
                      placeholderTextColor="#666"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        handleInputChange("confirmPassword", value)
                      }
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword ? "eye-outline" : "eye-off-outline"
                        }
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
  
  
                {errormessage !== "" && (
                  <Text
                    style={{
                      color: "red",
                      marginBottom: 12,
                      textAlign: "center",
                    }}
                  >
                    {errormessage}
                  </Text>
                )}
  
                <TouchableOpacity
                  style={styles.signUpButton}
                  activeOpacity={0.8}
                  onPress={handleSignUp}
                >
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                </TouchableOpacity>
  
              </View>
  
              <View style={styles.bottomSection}>
                <Text style={styles.loginPrompt}>
                  Already have an account?{" "}
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text style={styles.loginLink}>Sign in</Text>
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
    headerSection: { paddingTop: 20, paddingBottom: 40 },
    title: { fontSize: 32, fontWeight: "700", color: "#fff", marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#999", fontWeight: "400" },
    formSection: { flex: 1 },
    inputContainer: { marginBottom: 24 },
    inputLabel: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 8 },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#2a2a2a", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: "#333" },
    inputIcon: { marginRight: 12 },
    textInput: { flex: 1, fontSize: 16, color: "#fff", paddingVertical: 12 },
    eyeIcon: { padding: 4 },
    signUpButton: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 32, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    signUpButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
    bottomSection: { marginBottom: 24 },
    loginPrompt: { color: "#999", fontSize: 14, textAlign: "center" },
    loginLink: { color: "#fff", fontWeight: "600" },
  });
  
  export default signup;