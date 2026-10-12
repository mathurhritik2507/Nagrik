import React from "react";
import {ScrollView,Text,View} from "react-native";
import {router} from "expo-router";
import {Button,Card,Heading,palette} from "../components/web/Kit";

// Expo Router companion route for the web-only PWA installation page.
export default function InstallNagrikNative(){
 return <ScrollView style={{flex:1,backgroundColor:palette.bg}} contentContainerStyle={{padding:18}}>
   <View style={{maxWidth:800,width:"100%",alignSelf:"center"}}>
    <Card>
     <Heading>Welcome to Nagrik</Heading>
     <Text style={{color:palette.muted,lineHeight:24,marginBottom:14}}>
       You're using the native app. The Add to Home Screen instructions apply to our website at https://nagrik-eight.vercel.app/install, not to this installed Android or iOS application.
     </Text>
     <Button label="Try free Civic Guide" onPress={()=>router.push("/demo")}/>
     <View style={{marginTop:12}}><Button label="Sign in" secondary onPress={()=>router.push("/login")}/></View>
    </Card>
   </View>
 </ScrollView>;
}
