import React, { useState } from "react";
import { auth } from "../../firebaseConfig";
import {
    ActivityIndicator,
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

const colors = {
  primary: "#FF6B00",
  background: "#F7F8FA",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  success: "#16A34A",
  border: "#E5E7EB",
};

export default function AssistantScreen() {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Namaste 👋 I’m your Nagrik Civic Assistant. Ask me how to improve your civic score, what action to do today, or how to report an issue.",
    },
  ]);

  const sendMessage = async () => {
    const question=message.trim();
    if(!question || typing)return;
    if(question.length>600){
      setMessages(prev=>[...prev,{role:"ai",text:"Keep your question within 600 characters."}]);
      return;
    }
    const account=auth.currentUser;
    if(!account){
      setMessages(prev=>[...prev,{role:"ai",text:"Please sign in again to use Nagrik Civic AI."}]);
      return;
    }
    const history=messages.slice(1).slice(-6).map(item=>({
      role:item.role==="user"?"user":"assistant",
      content:item.text
    }));
    setMessages(prev=>[...prev,{role:"user",text:question}]);
    setMessage("");
    setTyping(true);
    Keyboard.dismiss();
    try{
      const token=await account.getIdToken();
      const baseUrl=process.env.EXPO_PUBLIC_NAGRIK_API_BASE||"https://nagrik-eight.vercel.app";
      const endpoint=(baseUrl.endsWith("/")?baseUrl.slice(0,-1):baseUrl)+"/api/civic-assistant";
      const response=await fetch(endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
        body:JSON.stringify({message:question,history})
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"AI is unavailable right now.");
      setMessages(prev=>[...prev,{role:"ai",text:String(payload.reply||"No reply received.")}]);
    }catch(error){
      setMessages(prev=>[...prev,{role:"ai",text:error?.message||"The AI service is unavailable. Please try again."}]);
    }finally{setTyping(false);}
  };

  const quickPrompt = (text) => {
    setMessage(text);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 170,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: colors.primary,
                padding: 26,
                borderRadius: 28,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900" }}>
                Civic Assistant 🤖
              </Text>

              <Text
                style={{
                  color: "#fff",
                  marginTop: 10,
                  fontSize: 16,
                  lineHeight: 22,
                }}
              >
                Ask civic questions about community, public services, sustainability, reporting, and more. General guidance only.
              </Text>
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: colors.text,
                marginTop: 26,
              }}
            >
              Quick Questions
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 14 }}
            >
              {[
                "How do I improve my civic score?",
                "What action should I do today?",
                "How do I report garbage?",
                "How to climb leaderboard?",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => quickPrompt(item)}
                  style={{
                    backgroundColor: "#FFF0E6",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 999,
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: "900" }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: colors.text,
                marginTop: 28,
              }}
            >
              Chat
            </Text>

            {messages.map((item, index) => (
              <View
                key={index}
                style={{
                  alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    item.role === "user" ? colors.primary : colors.card,
                  padding: 15,
                  borderRadius: 20,
                  marginTop: 14,
                  maxWidth: "85%",
                }}
              >
                <Text
                  style={{
                    color: item.role === "user" ? "#fff" : colors.text,
                    lineHeight: 22,
                    fontSize: 15,
                    fontWeight: item.role === "user" ? "800" : "600",
                  }}
                >
                  {item.text}
                </Text>
              </View>
            ))}

            {typing ? (
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: colors.card,
                  padding: 15,
                  borderRadius: 20,
                  marginTop: 14,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color={colors.primary} />
                <Text style={{ color: colors.muted, marginLeft: 10 }}>
                  Nagrik AI is thinking...
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              padding: 14,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask Nagrik AI..."
              placeholderTextColor={colors.muted}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 10,
                backgroundColor: "#F9FAFB",
              }}
            />

            <TouchableOpacity
              onPress={sendMessage}
              style={{
                backgroundColor: colors.primary,
                width: 50,
                height: 50,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>
                ↑
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}