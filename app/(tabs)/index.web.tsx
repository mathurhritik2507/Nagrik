import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { auth } from "../../firebaseConfig";
import { useCivicData } from "../../lib/webCivicStore";
import { FeatureTile, NagrikFeature } from "../../components/web/FeatureTile";
import { Button, Card, Heading, Shell, palette, dateLabel } from "../../components/web/Kit";

const discovery:NagrikFeature[]=[
  {title:"Community feed",summary:"See what your neighbors are sharing.",icon:"people-outline",href:"/community",tone:"blue"},
  {title:"Weekly challenges",summary:"Find a small mission you can try.",icon:"flag-outline",href:"/challenges",tone:"mint"},
  {title:"Free Civic Guide",summary:"Get prepared guidance on civic topics.",icon:"chatbubbles-outline",href:"/assistant",tone:"orange"},
];

export default function WebHome(){
  const {width}=useWindowDimensions();
  const {data,points}=useCivicData();
  const name=auth.currentUser?.displayName?.trim().split(" ")[0]||"there";
  const recent=[
    ...data.actions.map(v=>({...v,label:"Action",summary:v.description})),
    ...data.reports.map(v=>({...v,label:"Private issue note",summary:v.description})),
    ...data.proofs.map(v=>({...v,label:"Challenge proof",summary:v.description})),
  ].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,3);

  return <Shell title={`Hello, ${name} 👋`} subtitle="What would you like to do today?" eyebrow="NAGRIK / HOME">
    <View style={{backgroundColor:palette.navy,borderRadius:22,padding:width<540?22:28,marginBottom:19}}>
      <Text style={{color:"#FFB880",fontWeight:"900",fontSize:11,letterSpacing:1.6}}>GET STARTED</Text>
      <Text style={{color:"#FFF",fontWeight:"900",fontSize:width<540?23:27,marginTop:9,marginBottom:7}}>
        Small actions. Better neighborhoods.
      </Text>
      <Text style={{color:"#CBD9E7",lineHeight:21,fontSize:13,marginBottom:19}}>
        Start with one simple step. Your private notes and activity stay on this device.
      </Text>
      <View style={{flexDirection:width<560?"column":"row",gap:10}}>
        <Button label="Record an action" onPress={()=>router.push("/explore")}/>
        <Button label="Save an issue note" secondary onPress={()=>router.push("/report")}/>
      </View>
    </View>

    <View style={{marginBottom:9}}>
      <Heading muted="Three easy ways to explore Nagrik.">Discover</Heading>
    </View>
    <View style={{flexDirection:"row",flexWrap:"wrap",gap:12,marginBottom:22}}>
      {discovery.map(item=><FeatureTile key={item.href} item={item} compact/>)}
    </View>

    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:6}}>
      <Heading muted="Your activity from this browser only.">Your progress</Heading>
      <Pressable accessibilityRole="button" accessibilityLabel="View all Nagrik features"
        onPress={()=>router.push("/more" as any)}
        style={{flexDirection:"row",alignItems:"center",gap:5,padding:8}}>
        <Text style={{color:palette.orange,fontWeight:"800",fontSize:13}}>All features</Text>
        <Ionicons name="arrow-forward" size={16} color={palette.orange}/>
      </Pressable>
    </View>
    <Card style={{padding:width<540?16:20}}>
      <View style={{flexDirection:"row",gap:9,flexWrap:"wrap"}}>
        {[
          {label:"Actions",value:data.actions.length},
          {label:"Issue notes",value:data.reports.length},
          {label:"Practice XP",value:points},
        ].map(stat=><View key={stat.label} style={{
          flexGrow:1,flexBasis:width<540?90:160,minWidth:84,paddingVertical:6,
        }}>
          <Text style={{color:palette.navy,fontWeight:"900",fontSize:27}}>{stat.value}</Text>
          <Text style={{color:palette.muted,fontSize:12,marginTop:4}}>{stat.label}</Text>
        </View>)}
      </View>
      {recent.length>0?<View style={{borderTopWidth:1,borderTopColor:palette.border,paddingTop:15,marginTop:15}}>
        <Text style={{color:palette.ink,fontSize:14,fontWeight:"800",marginBottom:8}}>Recent activity</Text>
        {recent.map((activity,i)=><View key={activity.id}
          style={{paddingVertical:9,borderBottomWidth:i===recent.length-1?0:1,borderBottomColor:palette.border}}>
          <Text style={{color:palette.ink,fontWeight:"700",fontSize:13}}>
            {activity.label} <Text style={{color:palette.muted,fontWeight:"400"}}>· {dateLabel(activity.createdAt)}</Text>
          </Text>
          <Text numberOfLines={1} style={{fontSize:12,color:palette.muted,marginTop:3}}>{activity.summary}</Text>
        </View>)}
      </View>:null}
    </Card>

    <Pressable accessibilityRole="button" accessibilityLabel="Explore all Nagrik features"
      onPress={()=>router.push("/more" as any)}
      style={({pressed})=>({flexDirection:"row",alignItems:"center",gap:12,padding:17,borderRadius:16,
        backgroundColor:"#E9F1FA",marginTop:2,opacity:pressed?.8:1})}>
      <Ionicons name="grid-outline" size={24} color={palette.navy}/>
      <View style={{flex:1}}>
        <Text style={{fontWeight:"900",fontSize:15,color:palette.navy}}>Looking for something else?</Text>
        <Text style={{fontSize:12,color:palette.muted,marginTop:4}}>Reports, Leaderboard, Profile and more, all in one place.</Text>
      </View>
      <Ionicons name="chevron-forward" size={21} color={palette.navy}/>
    </Pressable>
    <Text style={{color:palette.muted,fontSize:11,lineHeight:17,marginTop:17}}>
      Public beta · Private issue notes are not sent to local authorities. Weekly badges are virtual, not vouchers.
    </Text>
  </Shell>;
}
