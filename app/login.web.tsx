import React,{useState} from "react";
import {Text,View,useWindowDimensions} from "react-native";
import {router} from "expo-router";
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../firebaseConfig";
import {Button,Card,Field,Notice,palette} from "../components/web/Kit";
const explain=(error:any)=>{
 const code=error?.code||"unknown";
 const texts:Record<string,string>={
  "auth/invalid-credential":"Email or password is incorrect.",
  "auth/invalid-email":"Enter a valid email.",
  "auth/too-many-requests":"Too many attempts. Please try again later.",
  "auth/network-request-failed":"Network error. Check your internet connection.",
  "auth/operation-not-allowed":"Enable email/password authentication in Firebase.",
 };
 return texts[code]||("Sign in failed ("+code+").");
};
export default function WebLogin(){
 const {width}=useWindowDimensions();const wide=width>850;
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const submit=async()=>{setError("");
  if(!email.trim()||!password){setError("Email and password are required.");return;}
  setBusy(true);
  try{await signInWithEmailAndPassword(auth,email.trim(),password);router.replace("/");}
  catch(e){setError(explain(e));}
  finally{setBusy(false);}
 };
 return <View style={{flex:1,backgroundColor:palette.bg,alignItems:"center",justifyContent:"center",padding:18}}>
   <View style={{maxWidth:990,width:"100%",flexDirection:wide?"row":"column",alignItems:"center",gap:wide?40:18}}>
     <View style={{flex:wide?1:undefined,width:wide?"48%":"100%",backgroundColor:palette.navy,borderRadius:24,padding:wide?37:25}}>
       <Text style={{fontWeight:"900",fontSize:35,color:"#FFF"}}>nagrik<Text style={{color:palette.orange}}>.</Text></Text>
       <Text style={{color:"#FBC49D",fontSize:12,letterSpacing:1.6,fontWeight:"800",marginTop:20}}>YOUR CIVIC SPACE</Text>
       <Text style={{color:"#FFF",fontSize:wide?30:22,fontWeight:"900",marginTop:8,lineHeight:wide?40:30}}>Small actions. Stronger communities.</Text>
       <Text style={{color:"#C9D8E8",marginTop:12,lineHeight:23}}>Record local initiatives, follow challenges, and keep track of your contribution.</Text>
       <Text style={{fontSize:12,color:"#C9D8E8",marginTop:24}}>Independent civic-tech beta · Not a government service</Text>
     </View>
     <View style={{flex:wide?1:undefined,width:wide?"48%":"100%"}}>
       <Text style={{fontWeight:"900",fontSize:29,color:palette.ink,marginBottom:6}}>Welcome back</Text>
       <Text style={{color:palette.muted,marginBottom:17}}>Sign in to your Nagrik account.</Text>
       <Card>
         <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com"/>
         <Field label="Password" secure value={password} onChangeText={setPassword} placeholder="Your password"/>
         <Notice text={error} error/>
         <Button label="Sign in" onPress={submit} busy={busy}/>
         <View style={{marginTop:13}}><Button label="New here? Create account →" secondary onPress={()=>router.push("/signup")}/></View>
       </Card>
     </View>
   </View>
 </View>;
}
