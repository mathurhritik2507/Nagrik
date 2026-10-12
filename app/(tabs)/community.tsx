import React from "react";
import {View,Text} from "react-native";
import {router} from "expo-router";
import {TouchableOpacity} from "react-native";
/**
 * Required universal route sibling for community.web.tsx.
 * Native app has a lightweight placeholder until its community feed
 * uses the same Firestore moderation and privacy protections.
 */
export default function CommunityNative(){
 return <View style={{flex:1,backgroundColor:"#F4F7FB",padding:22,justifyContent:"center"}}>
   <Text style={{fontSize:31,fontWeight:"900",color:"#102238"}}>Community feed 📰</Text>
   <Text style={{fontSize:15,color:"#66758A",marginTop:13,lineHeight:23}}>
     The shared Nagrik feed is currently being tested on the web. Your private activities and reports remain available in this mobile app.
   </Text>
   <TouchableOpacity accessibilityRole="button" onPress={()=>router.replace("/")} style={{backgroundColor:"#FF6B00",borderRadius:14,padding:16,alignItems:"center",marginTop:26}}>
     <Text style={{color:"white",fontWeight:"800"}}>Return home</Text>
   </TouchableOpacity>
 </View>;
}
