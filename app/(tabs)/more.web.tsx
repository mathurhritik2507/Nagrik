import React from "react";
import { Text, View } from "react-native";
import { FeatureTile, NagrikFeature } from "../../components/web/FeatureTile";
import { Heading, Shell, palette } from "../../components/web/Kit";

const groups:{heading:string;subtitle:string;features:NagrikFeature[]}[]=[
  {heading:"Take action",subtitle:"Save a private record or try a community mission.",features:[
    {title:"Record an action",summary:"Track something positive you've done.",icon:"add-circle-outline",href:"/explore",tone:"orange"},
    {title:"Issue notes",summary:"Privately document a neighborhood concern.",icon:"document-text-outline",href:"/report",tone:"blue"},
    {title:"Weekly challenges",summary:"Explore safe missions and virtual badges.",icon:"flag-outline",href:"/challenges",tone:"mint"},
  ]},
  {heading:"Connect with others",subtitle:"See contributions shared by Nagrik members.",features:[
    {title:"Community feed",summary:"Read posts and share with your permission.",icon:"people-outline",href:"/community",tone:"blue"},
    {title:"Leaderboard",summary:"Browse self-reported weekly contributions.",icon:"trophy-outline",href:"/leaderboard",tone:"orange"},
  ]},
  {heading:"Learn and manage",subtitle:"Useful guidance and your personal workspace.",features:[
    {title:"Free Civic Guide",summary:"Prepared civic answers, no paid AI needed.",icon:"chatbubbles-outline",href:"/assistant",tone:"mint"},
    {title:"Civic insights",summary:"Review trends in notes saved on this device.",icon:"bar-chart-outline",href:"/impact",tone:"blue"},
    {title:"My profile",summary:"Manage your profile and browser-saved data.",icon:"person-circle-outline",href:"/profile",tone:"orange"},
    {title:"Account & security",summary:"Manage sign-in details and password.",icon:"shield-checkmark-outline",href:"/account-help",tone:"blue"},
  ]},
];

export default function MoreWeb(){
 return <Shell title="Explore Nagrik" subtitle="Everything in one place. Pick what you need." eyebrow="NAGRIK / ALL FEATURES">
  {groups.map(group=><View key={group.heading} style={{marginBottom:18}}>
    <Heading muted={group.subtitle}>{group.heading}</Heading>
    <View style={{flexDirection:"row",flexWrap:"wrap",gap:12}}>
      {group.features.map(item=><FeatureTile key={item.href} item={item}/>)}
    </View>
  </View>)}
  <View style={{padding:16,borderRadius:14,backgroundColor:"#EAF1F8",marginTop:5}}>
    <Text style={{color:palette.navy,fontSize:13,fontWeight:"800",marginBottom:4}}>A note about Nagrik beta</Text>
    <Text style={{color:palette.muted,fontSize:12,lineHeight:20}}>
      Private reports and challenge photos are saved on this browser. Community contributions are self-reported, the Civic Guide uses prepared answers, and weekly rewards are virtual badges only.
    </Text>
  </View>
 </Shell>;
}
