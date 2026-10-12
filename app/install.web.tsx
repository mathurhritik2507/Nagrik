import React,{useEffect,useState} from "react";
import {ScrollView,Text,View} from "react-native";
import {router} from "expo-router";
import {Button,Card,Heading,Notice,palette} from "../components/web/Kit";

type InstallEvent=Event & {
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:"accepted"|"dismissed"}>;
};

export default function InstallNagrikWeb(){
 const [ready,setReady]=useState<InstallEvent|null>(null);
 const [installed,setInstalled]=useState(false);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
   const updateInstalled=()=>setInstalled(window.matchMedia("(display-mode: standalone)").matches||
     (navigator as Navigator & {standalone?:boolean}).standalone===true);
   updateInstalled();
   const prepare=(event:Event)=>{
     event.preventDefault();
     setReady(event as InstallEvent);
   };
   const complete=()=>{setReady(null);setInstalled(true);setMessage("Nagrik was added successfully. Open it from your phone's home screen.");};
   window.addEventListener("beforeinstallprompt",prepare);
   window.addEventListener("appinstalled",complete);
   return ()=>{
     window.removeEventListener("beforeinstallprompt",prepare);
     window.removeEventListener("appinstalled",complete);
   };
 },[]);
 const install=async()=>{
   if(!ready||busy)return;
   setBusy(true);setMessage("");
   try{
     await ready.prompt();
     const result=await ready.userChoice;
     setMessage(result.outcome==="accepted"?
       "Installation accepted. Look for the Nagrik icon on your device.":
       "Installation dismissed. You can install Nagrik later.");
   }catch{
     setMessage("The automatic install prompt wasn't available. Use your browser's Add to Home screen option.");
   }finally{setReady(null);setBusy(false);}
 };
 return <ScrollView style={{flex:1,backgroundColor:palette.bg}} contentContainerStyle={{padding:18,paddingBottom:44}}>
  <View style={{alignSelf:"center",width:"100%",maxWidth:900}}>
   <View style={{backgroundColor:palette.navy,padding:25,borderRadius:24,marginBottom:16}}>
    <Text style={{color:"#FFB883",fontWeight:"900",fontSize:12,letterSpacing:1.3}}>NAGRIK · INSTALL THE WEB APP</Text>
    <Text style={{color:"#FFF",fontSize:32,fontWeight:"900",marginTop:10}}>Nagrik on your home screen</Text>
    <Text style={{color:"#E0EAF3",marginTop:12,lineHeight:23}}>Install the free civic guide and community demo from your browser. No app store or API billing required.</Text>
   </View>
   <Card>
    <Heading muted="This is a website installed as an app-like shortcut, not yet the Google Play release.">Install Nagrik</Heading>
    {installed?<Notice text="Nagrik appears to be running in standalone installed mode."/>:null}
    {ready&&!installed?<Button label="Install Nagrik on this device" onPress={install} busy={busy}/>:null}
    {message?<Notice text={message}/>:null}
    <View style={{marginTop:14}}>
     <Text style={{fontWeight:"900",color:palette.ink,fontSize:17,marginBottom:9}}>Android · Google Chrome</Text>
     <Text style={{color:palette.muted,lineHeight:23}}>1. Open this link in Chrome (not inside WhatsApp or Instagram's in-app browser).{"\n"}2. Tap the three-dot Chrome menu.{"\n"}3. Select Install app or Add to Home screen.{"\n"}4. Confirm, then open the Nagrik icon.</Text>
    </View>
    <View style={{marginTop:19}}>
     <Text style={{fontWeight:"900",color:palette.ink,fontSize:17,marginBottom:9}}>iPhone · Safari</Text>
     <Text style={{color:palette.muted,lineHeight:23}}>1. Open this page in Safari.{"\n"}2. Tap Share.{"\n"}3. Choose Add to Home Screen (scroll or use the Share menu's More options if needed).{"\n"}4. Tap Add, then open Nagrik from your home screen.</Text>
    </View>
    <View style={{marginTop:19}}>
     <Text style={{fontWeight:"900",color:palette.ink,fontSize:17,marginBottom:9}}>Desktop · Chrome or Edge</Text>
     <Text style={{color:palette.muted,lineHeight:23}}>Look for Install in the browser address bar or application menu. Browsers may vary in how they offer installation.</Text>
    </View>
    <View style={{marginTop:20,gap:10}}>
     <Button label="Try Nagrik guest demo" onPress={()=>router.push("/demo")}/>
     <Button label="Sign in to Nagrik" secondary onPress={()=>router.push("/login")}/>
    </View>
   </Card>
   <Card>
    <Heading>Public-beta limitations</Heading>
    <Text style={{color:palette.muted,lineHeight:22}}>
     Internet access is needed for sign-in, Firebase community features and most screens. We intentionally do not cache user reports, photographs or authentication data offline. Personal civic action records on the web remain stored in the browser, not synchronized across devices. The free Civic Guide is curated reference content, not generative AI or an official government reporting system. Rewards are virtual badges only.
    </Text>
   </Card>
  </View>
 </ScrollView>;
}
