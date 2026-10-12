import React from "react";
import CommunityPreview from "../../components/web/CommunityPreview";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { auth } from "../../firebaseConfig";
import { useCivicData } from "../../lib/webCivicStore";
import { Shell, Hero, Card, Heading, Metric, Button, Empty, palette, dateLabel } from "../../components/web/Kit";

export default function WebHome(){
  const {data,points}=useCivicData();
  const name=auth.currentUser?.displayName?.split(" ")[0] || "Citizen";
  const recent=[
    ...data.actions.map(v=>({...v,label:"Civic action",summary:v.description})),
    ...data.reports.map(v=>({...v,label:"Issue report",summary:v.description})),
    ...data.proofs.map(v=>({...v,label:"Challenge submission",summary:v.description})),
  ].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,5);
  return <Shell title={`Welcome back, ${name} 👋`} subtitle="Your personal civic workspace. Small actions add up — and every submission should be visible and traceable.">
    <Hero kicker="NAGRIK / PUBLIC BETA" title="Make your neighborhood better." description="Record a private action, document a neighborhood concern, or explore real community contributions. Your public posts require an explicit opt-in.">
      <View style={{flexDirection:"row",flexWrap:"wrap",marginTop:20,gap:10}}>
        <Button label="Record a civic action ↗" onPress={()=>router.push("/explore")}/>
        <Button label="Report an issue ↗" secondary onPress={()=>router.push("/report")}/>
      </View>
    </Hero>
    <Card>
      <Heading muted="No payment or OpenAI API credits are required for the core guided demo.">Explore Nagrik today</Heading>
      <Text style={{color:palette.muted,lineHeight:22,marginBottom:8}}>
        Free Civic Guide: prepared local reference answers, not generative AI. Actions, reports, photo proofs, XP and virtual weekly crates are saved only in this browser. Verified members can share text posts through the Firebase Community Feed.
      </Text>
      <Text style={{color:palette.muted,lineHeight:22,marginBottom:15}}>
        Nothing in Nagrik files an official government complaint, verifies a contribution, or awards a real voucher. Live AI remains optional until the owner's API billing is active.
      </Text>
      <Button label="Try Free Civic Guide →" secondary onPress={()=>router.push("/assistant")}/>
    </Card>
    <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:8}}>
      <Metric label="Actions recorded" value={data.actions.length}/>
      <Metric label="Reports saved" value={data.reports.length}/>
      <Metric label="Challenge proofs" value={data.proofs.length}/>
      <Metric label="Practice XP" value={points}/>
    </View>
    <CommunityPreview/>
    <Heading muted="Your privately saved activity from this browser.">My recent activity</Heading>
    <Card>
      {recent.length===0?<Empty text="No activity yet. Record your first action or report to populate this dashboard."/>:
      recent.map((item,i)=><View key={item.id} style={{paddingVertical:12,borderBottomWidth:i===recent.length-1?0:1,borderColor:palette.border}}>
        <Text style={{fontWeight:"800",color:palette.ink}}>{item.label} <Text style={{fontWeight:"400",color:palette.muted}}>· {dateLabel(item.createdAt)}</Text></Text>
        <Text numberOfLines={2} style={{color:palette.muted,marginTop:5,lineHeight:21}}>{item.summary}</Text>
      </View>)}
    </Card>
    <Heading>Explore your civic toolkit</Heading>
    <View style={{flexDirection:"row",flexWrap:"wrap",gap:12}}>
      {[
        {name:"📰 Community feed",desc:"Discover contributions from verified members and join the discussion.",to:"/community"},
        {name:"🏆 Leaderboard",desc:"Explore weekly highlighted contributors and rankings.",to:"/leaderboard"},
        {name:"🎯 Civic challenges",desc:"Submit challenge proof and track progress.",to:"/challenges"},
        {name:"📍 Civic insights",desc:"Explore trends in your locally saved reports.",to:"/impact"},
        {name:"💬 Free Civic Guide",desc:"Get prepared civic guidance at no cost. Optional Live AI requires API credits.",to:"/assistant"},
        {name:"👤 Your profile",desc:"View your civic history and update your details.",to:"/profile"},
      ].map(a=><Pressable key={a.to} accessibilityRole="button" onPress={()=>router.push(a.to as any)} style={({pressed})=>({width:"48%",minWidth:260,flexGrow:1,backgroundColor:"#FFF",padding:22,borderWidth:1,borderColor:palette.border,borderRadius:18,opacity:pressed?.75:1})}>
        <Text style={{fontSize:17,fontWeight:"800",color:palette.ink}}>{a.name}</Text>
        <Text style={{color:palette.muted,marginTop:7,lineHeight:21}}>{a.desc}</Text>
        <Text style={{color:palette.orange,fontWeight:"800",marginTop:12}}>Open →</Text>
      </Pressable>)}
    </View>
  </Shell>;
}
