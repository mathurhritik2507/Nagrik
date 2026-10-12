import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
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

export default function ProfileScreen() {
  const user = auth.currentUser;

  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [area, setArea] = useState("Pune");
  const [editing, setEditing] = useState(false);

  const [xp, setXP] = useState(250);
  const [actions, setActions] = useState(0);
  const [reports, setReports] = useState(0);

  const displayName = user?.displayName || "Nagrik User";
  const email = user?.email || "";

  const loadData = async () => {
    const savedProfile = await AsyncStorage.getItem("profileData");
    const savedPosts = await AsyncStorage.getItem("posts");
    const savedReports = await AsyncStorage.getItem("reports");

    const profile = savedProfile ? JSON.parse(savedProfile) : {};
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    const reportsData = savedReports ? JSON.parse(savedReports) : [];

    const userPosts = posts.filter((item) => item.userId === user?.uid);
    const userReports = reportsData.filter((item) => item.userId === user?.uid);

    const postXP = userPosts.reduce((sum, item) => sum + (item.xp || 0), 0);
    const reportXP = userReports.reduce((sum, item) => sum + (item.xp || 0), 0);

    setXP(250 + postXP + reportXP);
    setActions(userPosts.length);
    setReports(userReports.length);

    setProfileImage(profile.profileImage || null);
    setBio(profile.bio || "Building a better city through civic action 🇮🇳");
    setArea(profile.area || "Pune");
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const saveProfile = async () => {
    const data = {
      profileImage,
      bio,
      area,
    };

    await AsyncStorage.setItem("profileData", JSON.stringify(data));
    setEditing(false);
    Alert.alert("Saved ✅", "Profile updated successfully.");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      Alert.alert("Logout Error", "Could not logout. Try again.");
    }
  };

  const civicScore = Math.min(100, Math.floor(xp / 7));
  const level = Math.max(1, Math.floor(xp / 100));

  const achievements = [
    {
      icon: "🔥",
      title: "3 Day Streak",
      desc: "Active civic participation",
    },
    {
      icon: "🏆",
      title: "Civic Warrior",
      desc: "Earned 400+ XP",
    },
    {
      icon: "📸",
      title: "Verified Contributor",
      desc: "Uploaded civic proof",
    },
  ];

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
      >
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 28,
            padding: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={pickImage}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    borderWidth: 3,
                    borderColor: "#fff",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 38 }}>👤</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ marginLeft: 18, flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 18 }}>
                Civic Hero 👋
              </Text>

              <Text
                style={{
                  color: "#fff",
                  fontSize: 34,
                  fontWeight: "900",
                  marginTop: 4,
                }}
              >
                {displayName}
              </Text>

              <Text style={{ color: "#fff", marginTop: 6 }}>
                {email}
              </Text>
              <TouchableOpacity accessibilityRole="button" onPress={()=>router.push("/account-help")} style={{marginTop:10}}><Text style={{color:"#FFF",fontWeight:"900",textDecorationLine:"underline"}}>Verify email / account help →</Text></TouchableOpacity>

              <Text style={{ color: "#fff", marginTop: 6 }}>
                📍 {area}, India
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: "#fff",
              marginTop: 20,
              lineHeight: 22,
            }}
          >
            {bio}
          </Text>

          <TouchableOpacity
            onPress={() => setEditing(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              alignSelf: "flex-start",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 999,
              marginTop: 18,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              Edit Profile
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 28,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 32,
                  fontWeight: "900",
                }}
              >
                {xp}
              </Text>

              <Text style={{ color: "#fff" }}>Total XP</Text>
            </View>

            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 32,
                  fontWeight: "900",
                }}
              >
                {actions}
              </Text>

              <Text style={{ color: "#fff" }}>Actions</Text>
            </View>

            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 32,
                  fontWeight: "900",
                }}
              >
                {reports}
              </Text>

              <Text style={{ color: "#fff" }}>Reports</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 22,
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: colors.text,
            }}
          >
            Civic Score ⭐
          </Text>

          <Text
            style={{
              color: colors.muted,
              marginTop: 10,
              lineHeight: 22,
            }}
          >
            Your public civic score based on actions, reports, streaks, and
            participation.
          </Text>

          <Text
            style={{
              fontSize: 64,
              fontWeight: "900",
              color: colors.primary,
              marginTop: 24,
            }}
          >
            {civicScore}/100
          </Text>

          <View
            style={{
              height: 16,
              backgroundColor: "#E5E7EB",
              borderRadius: 999,
              marginTop: 18,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${civicScore}%`,
                height: "100%",
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 22,
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: colors.text,
            }}
          >
            Level {level} Civic Warrior 🏆
          </Text>

          <Text style={{ color: colors.muted, marginTop: 10 }}>
            Keep contributing to unlock higher civic ranks.
          </Text>

          <View
            style={{
              height: 16,
              backgroundColor: "#E5E7EB",
              borderRadius: 999,
              marginTop: 22,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${xp % 100}%`,
                height: "100%",
                backgroundColor: colors.primary,
              }}
            />
          </View>

          <Text
            style={{
              color: colors.muted,
              marginTop: 12,
              fontWeight: "700",
            }}
          >
            {xp % 100}/100 XP to next level
          </Text>
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: colors.text,
            marginTop: 30,
          }}
        >
          Achievements 🏅
        </Text>

        {achievements.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: colors.card,
              borderRadius: 22,
              padding: 18,
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: "#FFF0E6",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 19,
                  fontWeight: "900",
                  color: colors.text,
                }}
              >
                {item.title}
              </Text>

              <Text
                style={{
                  color: colors.muted,
                  marginTop: 5,
                }}
              >
                {item.desc}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: colors.danger,
            padding: 18,
            borderRadius: 20,
            alignItems: "center",
            marginTop: 32,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editing} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: 24,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: "900",
              color: colors.text,
            }}
          >
            Edit Profile
          </Text>

          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Write your civic bio..."
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 18,
              marginTop: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <TextInput
            value={area}
            onChangeText={setArea}
            placeholder="Your area"
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 18,
              marginTop: 18,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <TouchableOpacity
            onPress={saveProfile}
            style={{
              backgroundColor: colors.primary,
              padding: 18,
              borderRadius: 20,
              marginTop: 30,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              Save Changes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEditing(false)}
            style={{
              marginTop: 18,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.muted,
                fontWeight: "900",
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}