import React,{useState} from "react";
import {Text,View,useWindowDimensions} from "react-native";
import {router} from "expo-router";
import {createUserWithEmailAndPassword,updateProfile} from "firebase/auth";
import {auth} from "../firebaseConfig";
import {Button,Card,Field,Notice,palette} from "../components/web/Kit";
const messages:Record<string,string>={
 "auth/email-already-in-use":"An account already exists for this email. Please sign in.",
 "auth/invalid-email":"Please use a valid email address.",
 "auth/weak-password":"Choose a stronger password.",
 "auth/operation-not-allowed":"Email/password accounts are not enabled in Firebase.",
 "auth/unauthorized-domain":"This domain must be configured for Firebase Authentication.",
 "auth/network-request-failed":"A network error prevented registration.",
};
export default function WebSignup(){
 const {width}=useWindowDimensions();const wide=width>850;
 const [name,setName]=useState("");const [city,setCity]=useState("Pune");
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const submit=async()=>{setError("");
  if(name.trim().length<2||city.trim().length<2||!email.includes("@")){setError("Enter your name, city and a valid email.");return;}
  if(password.length<8){setError("Use at least 8 characters for your password.");return;}
  setBusy(true);
  try{
   const result=await createUserWithEmailAndPassword(auth,email.trim(),password);
   // Firebase creates the account without requiring verification email.
   try{await updateProfile(result.user,{displayName:name.trim().slice(0,60)});}
   catch{/* Do not strand an already-created account if the optional display name fails. */}
   router.replace("/");
  }catch(e:any){setError(messages[e?.code]||`Registration failed (${e?.code||"unknown"}).`);}
  finally{setBusy(false);}
 };
 return <View style={{flex:1,backgroundColor:palette.bg,alignItems:"center",justifyContent:"center",padding:18}}>
   <View style={{maxWidth:990,width:"100%",flexDirection:wide?"row":"column",alignItems:"center",gap:wide?40:18}}>
     <View style={{flex:wide?1:undefined,width:wide?"48%":"100%",backgroundColor:palette.navy,borderRadius:24,padding:wide?37:25}}>
       <Text style={{fontWeight:"900",fontSize:35,color:"#FFF"}}>nagrik<Text style={{color:palette.orange}}>.</Text></Text>
       <Text style={{color:"#FFB980",letterSpacing:1.5,fontSize:12,fontWeight:"800",marginTop:22}}>JOIN THE COMMUNITY</Text>
       <Text style={{fontSize:wide?30:22,fontWeight:"900",color:"#FFF",marginTop:10,lineHeight:wide?40:31}}>Your next civic action starts here.</Text>
       <Text style={{color:"#CBDAE8",marginTop:14,lineHeight:23}}>Create an account for private civic tracking. No verification email is needed to try the public beta.</Text>
       <Text style={{fontSize:12,color:"#CBDAE8",marginTop:24}}>Beta records are local to this browser. Avoid submitting sensitive personal information.</Text>
     </View>
     <View style={{flex:wide?1:undefined,width:wide?"48%":"100%"}}>
       <Text style={{fontWeight:"900",fontSize:29,color:palette.ink}}>Create an account</Text>
       <Text style={{color:palette.muted,marginTop:6,marginBottom:16}}>Start building your civic record.</Text>
       <Card>
         <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name"/>
         <Field label="City" value={city} onChangeText={setCity} placeholder="Your city"/>
         <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com"/>
         <Field label="Password (minimum 8 characters)" secure value={password} onChangeText={setPassword} placeholder="Choose a password"/>
         <Notice text={error} error/>
         <Button label="Create account" busy={busy} onPress={submit}/>
         <View style={{marginTop:12}}><Button label="Already registered? Sign in →" secondary onPress={()=>router.push("/login")}/></View>
       </Card>
     </View>
   </View>
 </View>;
}
