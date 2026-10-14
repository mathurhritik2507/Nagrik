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
  success: "#16A34A",
};

export default function UploadScreen() {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Cleanliness");
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

  const handleUpload = async () => {
    Keyboard.dismiss();

    if (loading) return;

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    if (!caption.trim()) {
      Alert.alert("Missing info", "Please type your civic action.");
      return;
    }

    setLoading(true);

    try {
      const newPost = {
        id: Date.now().toString(),
        type: "post",
        userId: user.uid,
        name: user.displayName || "Nagrik User",
        email: user.email || "",
        city: "Pune",
        category: category.trim(),
        caption: caption.trim(),
        xp: 50,
        image: image,
        verified: true,
        createdAt: new Date().toISOString(),
      };

      const oldPosts = await AsyncStorage.getItem("posts");
      const parsedPosts = oldPosts ? JSON.parse(oldPosts) : [];

      await AsyncStorage.setItem(
        "posts",
        JSON.stringify([newPost, ...parsedPosts])
      );

      Alert.alert("Saved privately ✅", "Civic action saved on this device (+50 practice XP). It was not uploaded to a public feed.");

      setCaption("");
      setCategory("Cleanliness");
      setImage(null);
    } catch (error) {
      Alert.alert("Upload Error", "Could not save your action.");
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
              Upload Action 📸
            </Text>

            <Text style={{ color: "#fff", fontSize: 16, marginTop: 8 }}>
              Record a civic action privately and earn virtual practice XP.
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
                👤 Posting as {auth.currentUser?.displayName || "Nagrik User"}
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
              Category
            </Text>

            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Example: Cleanliness"
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
              What did you do?
            </Text>

            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Example: I cleaned garbage near my society."
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
                Choose from Gallery
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

            {image ? (
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  padding: 12,
                  borderRadius: 14,
                  marginTop: 14,
                }}
              >
                <Text
                  style={{
                    color: colors.success,
                    fontWeight: "900",
                    textAlign: "center",
                  }}
                >
                  AI Ready ✅ Image selected
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleUpload}
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
                  Submit Action +50 XP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}