import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { HelpTip, palette } from "./Kit";

export type NagrikFeature = {
  title: string;
  summary: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  tone?: "orange" | "blue" | "mint";
};

const tones = {
  orange:{bg:"#FFF0E4",icon:"#E76800"},
  blue:{bg:"#EAF1FA",icon:"#315D91"},
  mint:{bg:"#E8F7EF",icon:"#197653"},
};

export function FeatureTile({item,compact=false}:{
  item:NagrikFeature;
  compact?:boolean;
}){
  const tone=tones[item.tone||"blue"];
  return <View style={{flexBasis:compact?195:250,flexGrow:1,minWidth:compact?170:230,position:"relative",zIndex:1}}>
    <Pressable accessibilityRole="button" accessibilityLabel={item.title}
    onPress={()=>router.push(item.href as any)}
    style={({pressed})=>({
      flex:1,
      padding:compact?16:19,backgroundColor:"#FFF",borderColor:palette.border,
      borderWidth:1,borderRadius:18,
      opacity:pressed?.78:1,
    })}>
    <View style={{height:42,width:42,borderRadius:13,backgroundColor:tone.bg,alignItems:"center",justifyContent:"center",marginBottom:13}}>
      <Ionicons name={item.icon} color={tone.icon} size={22}/>
    </View>
    <Text style={{fontSize:16,fontWeight:"900",color:palette.ink,marginBottom:5}}>{item.title}</Text>
    <Text style={{fontSize:12,color:palette.muted,lineHeight:19,minHeight:compact?38:36}}>{item.summary}</Text>
    <View style={{flexDirection:"row",alignItems:"center",gap:6,marginTop:12}}>
      <Text style={{fontSize:12,fontWeight:"800",color:palette.orange}}>Open</Text>
      <Ionicons name="arrow-forward-outline" size={14} color={palette.orange}/>
    </View>
    </Pressable>
    <View style={{position:"absolute",top:11,right:11,zIndex:30}}>
      <HelpTip label={item.title} text={item.summary+" Tap the tile to open this feature."}/>
    </View>
  </View>;
}
