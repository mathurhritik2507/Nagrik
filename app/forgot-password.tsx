import React,{useState} from "react";
import {ActivityIndicator,Alert,Text,TextInput,TouchableOpacity,View} from "react-native";
import {router} from "expo-router";
import {sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../firebaseConfig";

export default function ForgotPassword(){
 const [email,setEmail]=useState("");const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState("");const [error,setError]=useState("");
 const send=async()=>{setStatus("");setError("");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError("Enter a valid email address.");return;}
  setBusy(true);
  try{await sendPasswordResetEmail(auth,email.trim());setStatus("If this address has an eligible account, check your email for reset instructions.");}
  catch(e:any){if(e?.code==="auth/user-not-found")setStatus("If this address has an eligible account, check your email for reset instructions.");else setError("Unable to request reset email. Please try again.");}
  finally{setBusy(false);}
 };
 return <View style={{flex:1,backgroundColor:"#F4F7FB",justifyContent:"center",padding:24}}>
  <Text style={{fontSize:30,fontWeight:"900",color:"#102238",marginBottom:10}}>Reset password</Text>
  <Text style={{fontSize:14,color:"#66758A",marginBottom:24}}>We will email you a secure reset link.</Text>
  <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" style={{backgroundColor:"#FFF",padding:16,borderRadius:12,borderColor:"#CFDAE5",borderWidth:1,marginBottom:12}}/>
  {error?<Text style={{color:"#B42318",marginBottom:10}}>{error}</Text>:null}
  {status?<Text style={{color:"#13795B",marginBottom:10}}>{status}</Text>:null}
  <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={send} style={{backgroundColor:"#FF6B00",borderRadius:12,alignItems:"center",padding:16}}>
   {busy?<ActivityIndicator color="#FFF"/>:<Text style={{color:"#FFF",fontWeight:"800"}}>Send reset email</Text>}
  </TouchableOpacity>
  <TouchableOpacity accessibilityRole="button" onPress={()=>router.replace("/login")} style={{alignItems:"center",padding:16}}><Text style={{color:"#102238",fontWeight:"700"}}>Back to login</Text></TouchableOpacity>
 </View>;
}
