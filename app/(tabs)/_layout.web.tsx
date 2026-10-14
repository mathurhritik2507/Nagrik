import React,{useEffect,useState} from "react";
import {ActivityIndicator,View,useWindowDimensions} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Redirect,Tabs} from "expo-router";
import {onAuthStateChanged,User} from "firebase/auth";
import {auth} from "../../firebaseConfig";
import {palette} from "../../components/web/Kit";

const icons:Record<string,any>={
  index:"home-outline",
  community:"people-outline",
  challenges:"flag-outline",
  more:"grid-outline",
};
export default function WebTabs(){
 const [user,setUser]=useState<User|null|undefined>(undefined);
 const {width}=useWindowDimensions();
 useEffect(()=>onAuthStateChanged(auth,u=>setUser(u)),[]);
 if(user===undefined)return <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:palette.bg}}><ActivityIndicator size="large" color={palette.orange}/></View>;
 if(!user)return <Redirect href="/login"/>;
 return <Tabs screenOptions={({route})=>({
   headerShown:false,
   tabBarActiveTintColor:palette.orange,
   tabBarInactiveTintColor:"#7B8BA0",
   tabBarLabelStyle:{fontWeight:"800",fontSize:width<500?11:12,marginBottom:5},
   tabBarStyle:{height:width<500?70:75,paddingTop:10,paddingBottom:9,backgroundColor:"#FFF",borderTopWidth:1,borderTopColor:palette.border},
   tabBarIcon:({color,size})=><Ionicons name={icons[route.name]||"ellipse-outline"} size={size} color={color}/>,
 })}>
   <Tabs.Screen name="index" options={{title:"Home"}}/>
   <Tabs.Screen name="community" options={{title:"Community"}}/>
   <Tabs.Screen name="challenges" options={{title:"Challenges"}}/>
   <Tabs.Screen name="more" options={{title:"More"}}/>
   <Tabs.Screen name="explore" options={{href:null}}/>
   <Tabs.Screen name="report" options={{href:null}}/>
   <Tabs.Screen name="profile" options={{href:null}}/>
   <Tabs.Screen name="impact" options={{href:null}}/>
   <Tabs.Screen name="assistant" options={{href:null}}/>
   <Tabs.Screen name="leaderboard" options={{href:null}}/>
   <Tabs.Screen name="learn" options={{href:null}}/>
   <Tabs.Screen name="notifications" options={{href:null}}/>
   <Tabs.Screen name="pledge" options={{href:null}}/>
   <Tabs.Screen name="rewards" options={{href:null}}/>
 </Tabs>;
}
