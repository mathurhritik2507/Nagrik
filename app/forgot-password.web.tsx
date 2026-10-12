import React,{useState} from "react";
import {Text,View} from "react-native";
import {router} from "expo-router";
import {sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../firebaseConfig";
import {Button,Card,Field,Notice,palette} from "../components/web/Kit";

export default function ForgotPasswordWeb(){
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [success,setSuccess]=useState("");
  const [error,setError]=useState("");
  const submit=async()=>{
    setError("");setSuccess("");
    const value=email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){setError("Enter a valid email address.");return;}
    setBusy(true);
    try{
      await sendPasswordResetEmail(auth,value);
      setSuccess("Firebase accepted the reset request. If this address has an eligible password-based account, check Inbox, Spam, and Promotions. Delivery is not guaranteed.");
    }catch(e:any){
      if(["auth/user-not-found","auth/invalid-credential"].includes(e?.code)){
        setSuccess("If the address belongs to an eligible account, you will receive password-reset instructions.");
      } else if(e?.code==="auth/too-many-requests"){
        setError("Too many requests. Please try again later.");
      } else if(e?.code==="auth/network-request-failed"){
        setError("Network error. Please check your connection and try again.");
      } else if(e?.code==="auth/operation-not-allowed"){
        setError("Password-based sign-in is disabled in this Firebase project.");
      } else if(e?.code==="auth/unauthorized-domain"){
        setError("The site domain is not authorized for Firebase Authentication.");
      } else {
        setError("Firebase could not process this request ("+(e?.code||"unknown")+"). Please contact the app owner.");
      }
    }finally{setBusy(false);}
  };
  return <View style={{flex:1,backgroundColor:palette.bg,alignItems:"center",justifyContent:"center",padding:18}}>
    <View style={{width:"100%",maxWidth:510}}>
      <Text style={{fontSize:32,fontWeight:"900",color:palette.navy,marginBottom:9}}>Reset your password</Text>
      <Text style={{color:palette.muted,marginBottom:22,lineHeight:22}}>Enter the email address you used to sign up for Nagrik. We will request a reset email from Firebase.</Text>
      <Card>
        <Field label="Account email address" value={email} onChangeText={setEmail} placeholder="you@example.com"/>
        <Notice text={error} error/><Notice text={success}/>
        <Button label="Send reset email" onPress={submit} busy={busy}/>
        <View style={{marginTop:12}}><Button label="Back to sign in" secondary onPress={()=>router.replace("/login")}/></View>
      </Card>
    </View>
  </View>;
}
