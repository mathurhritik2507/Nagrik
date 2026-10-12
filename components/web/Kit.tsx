import React, { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";

export const palette = {
  ink:"#16243A", muted:"#66758A", orange:"#FF6B00", navy:"#102238",
  bg:"#F4F7FB", white:"#FFFFFF", border:"#E5EBF2", green:"#13795B", red:"#B42318",
};
export function Shell({ title, subtitle, eyebrow="NAGRIK / CIVIC SPACE", children }:{ title:string;subtitle:string;eyebrow?:string;children:ReactNode }) {
  const {width}=useWindowDimensions();
  const wide=width>=850;
  return <ScrollView style={{flex:1,backgroundColor:palette.bg}} contentContainerStyle={{flexGrow:1}}>
    <View style={{width:"100%",maxWidth:1130,alignSelf:"center",paddingHorizontal:wide?32:16,paddingTop:wide?34:20,paddingBottom:130}}>
      <View style={{marginBottom:23}}>
        <Text style={{fontSize:11,fontWeight:"800",letterSpacing:2,color:palette.orange,marginBottom:8}}>{eyebrow}</Text>
        <Text style={{fontSize:wide?35:28,fontWeight:"900",color:palette.navy}}>{title}</Text>
        <Text style={{fontSize:14,color:palette.muted,marginTop:8,lineHeight:22}}>{subtitle}</Text>
      </View>
      {children}
      <Text style={{textAlign:"center",fontSize:11,color:palette.muted,marginTop:30}}>
        Nagrik public beta · Records on this website are stored in this browser only. Not an official municipal reporting service.
      </Text>
    </View>
  </ScrollView>;
}
export function Card({children,style}:{children:ReactNode;style?:any}){
  return <View style={[{backgroundColor:palette.white,borderWidth:1,borderColor:palette.border,borderRadius:20,padding:20,marginBottom:15},style]}>{children}</View>;
}
export function Hero({kicker,title,description,children}:{kicker:string;title:string;description:string;children?:ReactNode}){
  return <View style={{backgroundColor:palette.navy,padding:26,borderRadius:24,marginBottom:18}}>
    <Text style={{fontSize:11,fontWeight:"800",letterSpacing:1.5,color:"#FFBB81"}}>{kicker.toUpperCase()}</Text>
    <Text style={{fontSize:29,fontWeight:"900",color:"white",marginTop:8}}>{title}</Text>
    <Text style={{color:"#C9D8E8",marginTop:8,lineHeight:22}}>{description}</Text>
    {children}
  </View>;
}
export function Heading({children,muted}:{children:ReactNode;muted?:string}){
  return <View style={{marginBottom:14,marginTop:7}}><Text style={{fontSize:19,fontWeight:"800",color:palette.ink}}>{children}</Text>{muted?<Text style={{fontSize:12,color:palette.muted,marginTop:3}}>{muted}</Text>:null}</View>;
}
export function Button({label,onPress,secondary=false,disabled=false,busy=false}:{label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;busy?:boolean}){
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled||busy} onPress={onPress}
    style={({pressed})=>({backgroundColor:disabled?"#C6CFD9":secondary?"#E9F1F9":palette.orange,paddingVertical:13,paddingHorizontal:19,borderRadius:12,opacity:pressed?.8:1,alignItems:"center",minHeight:45,justifyContent:"center"})}>
    {busy?<ActivityIndicator color={secondary?palette.ink:"#FFF"}/>:<Text style={{fontWeight:"800",fontSize:14,color:secondary?palette.navy:"#FFF"}}>{label}</Text>}
  </Pressable>;
}
export function Field({label,value,onChangeText,placeholder,multiline=false,secure=false}:{label:string;value:string;onChangeText:(v:string)=>void;placeholder?:string;multiline?:boolean;secure?:boolean}){
  return <View style={{marginBottom:15}}>
    <Text style={{fontWeight:"700",fontSize:13,color:palette.ink,marginBottom:7}}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#94A0B1"
      multiline={multiline} secureTextEntry={secure} textAlignVertical={multiline?"top":"center"}
      style={{borderWidth:1,borderColor:"#CFDAE5",borderRadius:12,paddingHorizontal:13,paddingVertical:12,backgroundColor:"#FCFDFE",color:palette.ink,
        minHeight:multiline?110:45,fontSize:14}}/>
  </View>;
}
export function Notice({text,error=false}:{text:string;error?:boolean}){
  if(!text)return null;
  return <View accessibilityRole="alert" style={{backgroundColor:error?"#FEF0EE":"#E9F8F0",borderColor:error?"#F7C8C2":"#C0E9D3",borderWidth:1,borderRadius:12,padding:12,marginBottom:14}}>
    <Text style={{color:error?palette.red:palette.green,fontWeight:"700",lineHeight:20}}>{text}</Text>
  </View>;
}
export function Chip({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}){
  return <Pressable accessibilityRole="button" onPress={onPress} style={{paddingHorizontal:13,paddingVertical:10,backgroundColor:active?palette.navy:"#F0F3F7",borderRadius:20,marginRight:7,marginBottom:8}}>
    <Text style={{color:active?"#FFF":palette.ink,fontSize:12,fontWeight:"700"}}>{label}</Text>
  </Pressable>;
}
export function Metric({label,value}:{label:string;value:string|number}){
  return <View style={{flexGrow:1,flexBasis:155,minWidth:125,backgroundColor:"#FFF",padding:19,borderRadius:18,borderWidth:1,borderColor:palette.border,marginRight:12,marginBottom:12}}>
    <Text style={{color:palette.muted,fontSize:12}}>{label}</Text><Text style={{fontWeight:"900",color:palette.navy,fontSize:28,marginTop:5}}>{value}</Text>
  </View>;
}
export function Empty({text}:{text:string}){
  return <View style={{paddingVertical:24}}><Text style={{textAlign:"center",color:palette.muted,fontSize:14}}>{text}</Text></View>;
}
export const dateLabel=(iso:string)=>{try{return new Date(iso).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}catch{return ""}};
