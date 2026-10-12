import React,{useState} from "react";
import {ActivityIndicator,ScrollView,Text,TextInput,TouchableOpacity,View} from "react-native";
import {router} from "expo-router";
import {useAccountHelp} from "../lib/useAccountHelp";
const ORANGE="#FF6B00",INK="#102238",MUTED="#66758A";
const Btn=({title,onPress,disabled=false}:{title:string;onPress:()=>void;disabled?:boolean})=>
 <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={{backgroundColor:ORANGE,padding:16,borderRadius:13,alignItems:"center",marginTop:12,opacity:disabled?.55:1}}>
  <Text style={{color:"#FFF",fontWeight:"800"}}>{title}</Text>
 </TouchableOpacity>;
export default function AccountHelpNative(){
 const {user,loading,busy,error,info,refresh,sendVerification,changePassword}=useAccountHelp();
 const [current,setCurrent]=useState("");const [next,setNext]=useState("");const [confirm,setConfirm]=useState("");
 if(loading)return <View style={{flex:1,justifyContent:"center"}}><ActivityIndicator color={ORANGE}/></View>;
 return <ScrollView style={{backgroundColor:"#F4F7FB",flex:1}} contentContainerStyle={{padding:22,paddingBottom:100}}>
  <Text style={{fontWeight:"900",fontSize:30,color:INK,marginBottom:8}}>Account help</Text>
  {!user?<Btn title="Sign in first" onPress={()=>router.replace("/login")}/>:<>
   <Text style={{fontSize:16,color:INK,fontWeight:"800",marginVertical:12}}>{user.email}</Text>
   <Text style={{color:user.emailVerified?"#13795B":"#B42318",fontWeight:"800"}}>{user.emailVerified?"Email verified":"Email not verified"}</Text>
   <Btn title="Check my verification status" onPress={refresh} disabled={busy}/>
   {!user.emailVerified?<Btn title="Request verification email" onPress={sendVerification} disabled={busy}/>:null}
   <Text style={{color:MUTED,marginTop:12,lineHeight:21}}>Requests don't guarantee inbox delivery. Check the inbox for the sign-in address above, including Spam and All Mail.</Text>
   <Text style={{color:INK,fontWeight:"900",fontSize:20,marginTop:27}}>Change password without email</Text>
   <Text style={{color:MUTED,marginTop:8,lineHeight:21}}>If you know your current password, update it securely while signed in.</Text>
   {[
    {label:"Current password",value:current,set:setCurrent},
    {label:"New password",value:next,set:setNext},
    {label:"Confirm new password",value:confirm,set:setConfirm},
   ].map(v=><View key={v.label} style={{marginTop:10}}><Text style={{fontWeight:"700",color:INK,marginBottom:5}}>{v.label}</Text>
    <TextInput accessibilityLabel={v.label} secureTextEntry value={v.value} onChangeText={v.set}
      style={{backgroundColor:"#FFF",padding:13,borderRadius:12,borderWidth:1,borderColor:"#CED8E5"}}/></View>)}
   <Btn title="Save new password" disabled={busy} onPress={async()=>{await changePassword(current,next,confirm);setCurrent("");setNext("");setConfirm("");}}/>
   <Btn title="Open password reset" onPress={()=>router.push("/forgot-password")}/>
  </>}
  {error?<Text style={{marginTop:15,color:"#B42318",lineHeight:21}}>{error}</Text>:null}
  {info?<Text style={{marginTop:15,color:"#13795B",lineHeight:21}}>{info}</Text>:null}
 </ScrollView>;
}