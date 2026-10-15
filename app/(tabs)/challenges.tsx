import React, { useCallback, useState } from "react";
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
import { useFocusEffect } from "expo-router";
import { auth } from "../../firebaseConfig";

const colors = {
  primary: "#FF6B00",
  background: "#F7F8FA",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  border: "#E5E7EB",
};

export default function ChallengesScreen() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofText, setProofText] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const challenges = [
    {
      id: "clean",
      icon: "🧹",
      title: "Cleanliness Mission",
      desc: "Clean or remove visible litter near your home, society, or public area.",
      xp: 50,
      requirement: "Upload a photo after completing the cleanup.",
    },
    {
      id: "report",
      icon: "🚧",
      title: "Report a Civic Issue",
      desc: "Find a real civic issue such as garbage, pothole, streetlight, or leakage.",
      xp: 20,
      requirement: "Upload proof photo and describe the issue clearly.",
    },
    {
      id: "traffic",
      icon: "🚦",
      title: "Traffic Sense Check",
      desc: "Follow or promote one road-safety habit today.",
      xp: 30,
      requirement: "Upload proof or describe your road-safety action.",
    },
    {
      id: "green",
      icon: "🌱",
      title: "Green India Action",
      desc: "Plant, water, or protect a plant in your area.",
      xp: 40,
      requirement: "Upload a photo of your green action.",
    },
  ];

  const loadSubmissions = async () => {
    const saved = await AsyncStorage.getItem("challengeSubmissions");
    const parsed = saved ? JSON.parse(saved) : [];

    const userSubmissions = parsed.filter((item) => item.userId === user?.uid);
    setSubmissions(userSubmissions);
  };

  useFocusEffect(
    useCallback(() => {
      loadSubmissions();
    }, [])
  );

  const pickProofImage = async () => {
    Keyboard.dismiss();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
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
      setProofImage(result.assets[0].uri);
    }
  };

  const startChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setProofImage(null);
    setProofText("");
  };

  const submitProof = async () => {
    Keyboard.dismiss();

    if (!user) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    if (!selectedChallenge) {
      Alert.alert("Select challenge", "Please select a challenge first.");
      return;
    }

    if (!proofImage) {
      Alert.alert("Proof required", "Please upload or capture proof photo.");
      return;
    }

    if (!proofText.trim()) {
      Alert.alert("Description required", "Please write what you did.");
      return;
    }

    setLoading(true);

    try {
      const newSubmission = {
        id: Date.now().toString(),
        type: "challenge",
        userId: user.uid,
        name: user.displayName || "Nagrik User",
        email: user.email || "",
        challengeId: selectedChallenge.id,
        challengeTitle: selectedChallenge.title,
        icon: selectedChallenge.icon,
        description: proofText.trim(),
        image: proofImage,
        xp: 0,
        potentialXp: selectedChallenge.xp,
        status: "Unverified",
        createdAt: new Date().toISOString(),
      };

      const oldSubmissions = await AsyncStorage.getItem("challengeSubmissions");
      const parsedSubmissions = oldSubmissions ? JSON.parse(oldSubmissions) : [];

      await AsyncStorage.setItem(
        "challengeSubmissions",
        JSON.stringify([newSubmission, ...parsedSubmissions])
      );

      const oldPosts = await AsyncStorage.getItem("posts");
      const parsedPosts = oldPosts ? JSON.parse(oldPosts) : [];

      const feedPost = {
        id: `challenge-${newSubmission.id}`,
        type: "post",
        userId: user.uid,
        name: user.displayName || "Nagrik User",
        email: user.email || "",
        city: "Pune",
        category: "Challenge Submitted",
        caption: `${selectedChallenge.icon} ${selectedChallenge.title}: ${proofText.trim()}`,
        xp: 0,
        image: proofImage,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        "posts",
        JSON.stringify([feedPost, ...parsedPosts])
      );

      Alert.alert(
        "Proof Submitted ✅",
        "Your photo was saved on this device only. No AI review occurred and no XP was awarded."
      );

      setSelectedChallenge(null);
      setProofImage(null);
      setProofText("");
      loadSubmissions();
    } catch (error) {
      Alert.alert("Error", "Could not submit challenge proof.");
    } finally {
      setLoading(false);
    }
  };

  const hasSubmitted = (challengeId) => {
    return submissions.some((item) => item.challengeId === challengeId);
  };

  const completedCount = submissions.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              padding: 26,
              borderRadius: 28,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 34, fontWeight: "900" }}>
              Civic Challenges 🎯
            </Text>

            <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>
              Record photo evidence honestly. This beta cannot verify actions automatically.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 26,
              padding: 22,
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text }}>
              Local challenge submissions
            </Text>

            <Text
              style={{
                fontSize: 54,
                fontWeight: "900",
                color: colors.primary,
                marginTop: 14,
              }}
            >
              {completedCount}
            </Text>

            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 22 }}>
              Evidence saved on this device; not independently verified.
            </Text>

            <View
              style={{
                height: 14,
                backgroundColor: "#E5E7EB",
                borderRadius: 999,
                marginTop: 22,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, completedCount * 10)}%`,
                  height: "100%",
                  backgroundColor: colors.primary,
                }}
              />
            </View>

            <Text style={{ color: colors.warning, fontWeight: "900", marginTop: 12 }}>
              {completedCount} unverified challenge submissions
            </Text>
          </View>

          {selectedChallenge ? (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 26,
                padding: 22,
                marginTop: 24,
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            >
              <Text style={{ fontSize: 28 }}>
                {selectedChallenge.icon}
              </Text>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: colors.text,
                  marginTop: 10,
                }}
              >
                Submit Proof
              </Text>

              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "900",
                  marginTop: 8,
                }}
              >
                {selectedChallenge.title} · Potential {selectedChallenge.xp} XP after verification
              </Text>

              <Text style={{ color: colors.muted, marginTop: 10, lineHeight: 22 }}>
                {selectedChallenge.requirement}
              </Text>

              <TextInput
                value={proofText}
                onChangeText={setProofText}
                placeholder="Write what you actually completed..."
                placeholderTextColor={colors.muted}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  padding: 14,
                  marginTop: 18,
                  height: 110,
                  textAlignVertical: "top",
                  backgroundColor: "#fff",
                }}
              />

              <TouchableOpacity
                onPress={pickProofImage}
                style={{
                  backgroundColor: "#FFF0E6",
                  padding: 16,
                  borderRadius: 16,
                  marginTop: 18,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "900" }}>
                  Choose Proof Image
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openCamera}
                style={{
                  backgroundColor: "#111827",
                  padding: 16,
                  borderRadius: 16,
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  Capture Proof 📷
                </Text>
              </TouchableOpacity>

              {proofImage ? (
                <Image
                  source={{ uri: proofImage }}
                  style={{
                    width: "100%",
                    height: 220,
                    borderRadius: 18,
                    marginTop: 18,
                  }}
                />
              ) : null}

              <TouchableOpacity
                onPress={submitProof}
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#999" : colors.primary,
                  padding: 18,
                  borderRadius: 18,
                  marginTop: 22,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
                    Save Unverified Proof
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectedChallenge(null);
                  setProofImage(null);
                  setProofText("");
                }}
                style={{
                  marginTop: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.danger, fontWeight: "900" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: colors.text,
              marginTop: 30,
            }}
          >
            Today’s Missions
          </Text>

          {challenges.map((item) => {
            const submitted = hasSubmitted(item.id);

            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 24,
                  padding: 20,
                  marginTop: 18,
                }}
              >
                <Text style={{ fontSize: 34 }}>{item.icon}</Text>

                <Text
                  style={{
                    fontSize: 21,
                    fontWeight: "900",
                    color: colors.text,
                    marginTop: 12,
                  }}
                >
                  {item.title}
                </Text>

                <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 22 }}>
                  {item.desc}
                </Text>

                <Text
                  style={{
                    color: colors.warning,
                    marginTop: 10,
                    fontWeight: "800",
                    lineHeight: 21,
                  }}
                >
                  Requirement: {item.requirement}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 18,
                  }}
                >
                  <Text style={{ color: colors.success, fontWeight: "900" }}>
                    Potential {item.xp} XP (not awarded)
                  </Text>

                  <TouchableOpacity
                    onPress={() => startChallenge(item)}
                    disabled={submitted}
                    style={{
                      backgroundColor: submitted ? "#DCFCE7" : colors.primary,
                      paddingHorizontal: 18,
                      paddingVertical: 11,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: submitted ? colors.success : "#fff",
                        fontWeight: "900",
                      }}
                    >
                      {submitted ? "Submitted ✅" : "Start"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: colors.text,
              marginTop: 30,
            }}
          >
            My Submissions
          </Text>

          {submissions.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 22,
                padding: 18,
                marginTop: 18,
              }}
            >
              <Text style={{ color: colors.muted }}>
                No challenge proof submitted yet.
              </Text>
            </View>
          ) : (
            submissions.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 22,
                  padding: 18,
                  marginTop: 18,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
                  {item.icon} {item.challengeTitle}
                </Text>

                <Text style={{ color: colors.muted, marginTop: 8 }}>
                  {item.description}
                </Text>

                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 18,
                      marginTop: 14,
                    }}
                  />
                ) : null}

                <View
                  style={{
                    backgroundColor: "#FFF7ED",
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    marginTop: 12,
                  }}
                >
                  <Text style={{ color: colors.warning, fontWeight: "900" }}>
                    {item.status} · +{item.xp} XP
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}