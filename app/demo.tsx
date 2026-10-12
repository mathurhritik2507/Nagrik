import React,{useState} from "react";
import {ScrollView,Text,TextInput,TouchableOpacity,View} from "react-native";
import {router} from "expo-router";
import {civicGuideAnswer} from "../lib/civicGuide";

// Required platform-independent companion to demo.web.tsx for Expo Router.
const palette={navy:"#102238",orange:"#FF6B00",muted:"#66758A",bg:"#F4F7FB"};
const starters=[
 "How can I report a pothole responsibly?",
 "How can I organize a neighborhood cleanliness drive?",
 "What can citizens do about air pollution?",
 "How do weekly reward crates work?"
];
export default function NativeGuestDemo(){
 const [question,setQuestion]=useState("");
 const [answer,setAnswer]=useState("");
 const [error,setError]=useState("");
 const ask=(q:string)=>{
   const text=q.trim();
   if(text.length<2||text.length>600){setError("Enter a civic question between 2 and 600 characters.");return;}
   setQuestion(text);setError("");setAnswer(civicGuideAnswer(text).reply);
 };
 return <ScrollView style={{flex:1,backgroundColor:palette.bg}} contentContainerStyle={{padding:20,paddingBottom:60}}>
   <View style={{backgroundColor:palette.navy,borderRadius:22,padding:22,marginBottom:18}}>
     <Text style={{color:"#FFB883",fontWeight:"900",fontSize:12}}>NAGRIK · FREE PUBLIC DEMO</Text>
     <Text style={{color:"#FFF",fontWeight:"900",fontSize:28,marginTop:10}}>Explore civic life.</Text>
     <Text style={{color:"#D7E4EF",lineHeight:23,marginTop:9}}>
       Prepared civic-reference guidance that runs without signup or paid AI credits. Not an official government service.
     </Text>
   </View>
   <Text style={{fontWeight:"900",fontSize:21,color:palette.navy,marginBottom:12}}>Try a free civic question</Text>
   {starters.map(q=><TouchableOpacity key={q} accessibilityRole="button" onPress={()=>ask(q)}
      style={{padding:12,borderRadius:13,backgroundColor:"#FFF",marginBottom:8}}>
     <Text style={{fontWeight:"700",color:palette.navy}}>{q}</Text>
   </TouchableOpacity>)}
   <TextInput accessibilityLabel="Ask a civic question" placeholder="Ask a civic question"
      value={question} onChangeText={setQuestion} multiline
      style={{backgroundColor:"#FFF",borderWidth:1,borderColor:"#D3DEE9",borderRadius:12,minHeight:100,padding:12,marginTop:12,textAlignVertical:"top"}}/>
   {error?<Text style={{color:"#B42318",marginTop:9}}>{error}</Text>:null}
   <TouchableOpacity accessibilityRole="button" onPress={()=>ask(question)}
      style={{backgroundColor:palette.orange,padding:14,alignItems:"center",borderRadius:12,marginTop:13}}>
     <Text style={{color:"#FFF",fontWeight:"900"}}>Get free guidance</Text>
   </TouchableOpacity>
   {answer?<View style={{backgroundColor:"#FFF",borderRadius:12,padding:16,marginTop:15}}>
     <Text style={{color:palette.orange,fontWeight:"900",marginBottom:8}}>PREPARED CIVIC GUIDE · NOT LIVE AI</Text>
     <Text style={{color:palette.navy,lineHeight:22}}>{answer}</Text>
   </View>:null}
   <Text style={{color:palette.muted,marginVertical:18,lineHeight:21}}>
     Guidance is general and not live government information or legal advice. No civic report is filed. Do not share personal details.
   </Text>
   <TouchableOpacity accessibilityRole="button" onPress={()=>router.push("/signup")}
      style={{backgroundColor:palette.navy,borderRadius:12,padding:14,alignItems:"center",marginBottom:10}}>
     <Text style={{color:"#FFF",fontWeight:"800"}}>Create an account for more features</Text>
   </TouchableOpacity>
   <TouchableOpacity accessibilityRole="button" onPress={()=>router.push("/login")}
      style={{backgroundColor:"#E5EEF8",borderRadius:12,padding:14,alignItems:"center"}}>
     <Text style={{color:palette.navy,fontWeight:"800"}}>Already registered? Sign in</Text>
   </TouchableOpacity>
 </ScrollView>;
}
