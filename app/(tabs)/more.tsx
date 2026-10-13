import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const groups=[
 {title:"Take action",items:[
  {title:"Record an action",icon:"add-circle-outline",path:"/explore"},
  {title:"Issue notes",icon:"document-text-outline",path:"/report"},
  {title:"Weekly challenges",icon:"flag-outline",path:"/challenges"},
 ]},
 {title:"Community",items:[
  {title:"Community feed",icon:"people-outline",path:"/community"},
  {title:"Leaderboard",icon:"trophy-outline",path:"/leaderboard"},
 ]},
 {title:"Learn & manage",items:[
  {title:"Free Civic Guide",icon:"chatbubbles-outline",path:"/assistant"},
  {title:"Civic insights",icon:"bar-chart-outline",path:"/impact"},
  {title:"My profile",icon:"person-circle-outline",path:"/profile"},
  {title:"Account & security",icon:"shield-checkmark-outline",path:"/account-help"},
 ]},
];

export default function MoreNative(){
 return <ScrollView style={{flex:1,backgroundColor:"#F4F7FB"}} contentContainerStyle={{padding:20,paddingBottom:100}}>
  <Text style={{fontSize:29,fontWeight:"900",color:"#102238",marginBottom:4}}>Explore Nagrik</Text>
  <Text style={{fontSize:14,color:"#66758A",marginBottom:20}}>Everything in one place.</Text>
  {groups.map(group=><View key={group.title} style={{marginBottom:20}}>
    <Text style={{fontSize:19,fontWeight:"900",color:"#102238",marginBottom:10}}>{group.title}</Text>
    {group.items.map(item=><Pressable key={item.path} accessibilityRole="button" accessibilityLabel={item.title}
       onPress={()=>router.push(item.path as any)}
       style={({pressed})=>({backgroundColor:"#FFF",borderRadius:15,borderWidth:1,borderColor:"#E5EBF2",marginBottom:9,padding:17,flexDirection:"row",alignItems:"center",gap:13,opacity:pressed?0.8:1})}>
       <Ionicons name={item.icon as any} size={23} color="#FF6B00"/>
       <Text style={{flex:1,fontSize:16,color:"#16243A",fontWeight:"800"}}>{item.title}</Text>
       <Ionicons name="chevron-forward" size={18} color="#8897A8"/>
    </Pressable>)}
  </View>)}
 </ScrollView>;
}
