import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../firebaseConfig";

const colors = {
  primary: "#FF6B00",
  background: "#F7F8FA",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  danger: "#DC2626",
};

export default function ReportScreen() {
  const [issueType, setIssueType] = useState("Garbage Dump");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    Keyboard.dismiss();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    Keyboard.dismiss();

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitReport = async () => {
    Keyboard.dismiss();

    if (loading) return;

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    if (!location.trim() || !description.trim()) {
      Alert.alert("Missing info", "Please add location and description.");
      return;
    }

    setLoading(true);

    try {
      const newReport = {
        id: Date.now().toString(),
        type: "report",
        userId: user.uid,
        name: user.displayName || "Nagrik User",
        email: user.email || "",
        city: "Pune",
        issueType: issueType.trim(),
        location: location.trim(),
        description: description.trim(),
        image: image,
        xp: 20,
        status: "Saved on device",
        createdAt: new Date().toISOString(),
      };

      const oldReports = await AsyncStorage.getItem("reports");
      const parsedReports = oldReports ? JSON.parse(oldReports) : [];

      await AsyncStorage.setItem(
        "reports",
        JSON.stringify([newReport, ...parsedReports])
      );

      Alert.alert("Saved privately ✅", "Issue note saved on this device (+20 practice XP). Nagrik has not filed it with any government authority.");

      setIssueType("Garbage Dump");
      setLocation("");
      setDescription("");
      setImage(null);
    } catch (error) {
      Alert.alert("Report Error", "Could not save your report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ padding: 20, paddingBottom: 220 }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              padding: 24,
              borderRadius: 26,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900" }}>
              Report Issue 🚧
            </Text>

            <Text style={{ color: "#fff", fontSize: 16, marginTop: 8 }}>
              Save a private note about a civic issue. This does not file an official complaint.
            </Text>

            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                alignSelf: "flex-start",
                marginTop: 18,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                👤 Reporting as {auth.currentUser?.displayName || "Nagrik User"}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 22,
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text }}>
              Issue Type
            </Text>

            <TextInput
              value={issueType}
              onChangeText={setIssueType}
              placeholder="Example: Garbage Dump"
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
                backgroundColor: "#fff",
              }}
            />

            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: colors.text,
                marginTop: 20,
              }}
            >
              Location
            </Text>

            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Example: Undri, Pune"
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
                backgroundColor: "#fff",
              }}
            />

            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: colors.text,
                marginTop: 20,
              }}
            >
              Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.muted}
              multiline
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
                height: 120,
                textAlignVertical: "top",
                backgroundColor: "#fff",
              }}
            />

            <TouchableOpacity
              onPress={pickImage}
              style={{
                backgroundColor: "#FFF0E6",
                padding: 16,
                borderRadius: 16,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "900" }}>
                Choose Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openCamera}
              style={{
                backgroundColor: "#111827",
                padding: 16,
                borderRadius: 16,
                marginTop: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                Open Camera 📷
              </Text>
            </TouchableOpacity>

            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 18,
                  marginTop: 18,
                }}
              />
            ) : null}

            <TouchableOpacity
              onPress={submitReport}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#999" : colors.primary,
                padding: 18,
                borderRadius: 18,
                marginTop: 24,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
                  Submit Report +20 XP
                </Text>
              )}
            </TouchableOpacity>

            <View
              style={{
                backgroundColor: "#FEF2F2",
                padding: 14,
                borderRadius: 16,
                marginTop: 18,
              }}
            >
              <Text
                style={{
                  color: colors.danger,
                  fontWeight: "800",
                  lineHeight: 22,
                }}
              >
                Please upload only genuine civic issues. False reports may reduce civic score in future updates.
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}