import React,{useState} from "react";
import {ScrollView,Text,View} from "react-native";
import {router} from "expo-router";
import {civicGuideAnswer} from "../lib/civicGuide";
import {Button,Card,Chip,Field,Heading,Notice,palette} from "../components/web/Kit";

const starters=[
 "How can I report a pothole responsibly?",
 "How can I organize a neighborhood cleanliness drive?",
 "How can we separate wet and dry waste?",
 "What can citizens do about air pollution?",
 "How do weekly reward crates work?"
];
export default function GuestDemo(){
 const [question,setQuestion]=useState("");
 const [answer,setAnswer]=useState<ReturnType<typeof civicGuideAnswer>|null>(null);
 const [error,setError]=useState("");
 const ask=(text:string)=>{
   const clean=text.trim();
   if(clean.length<2||clean.length>600){setError("Enter a civic question between 2 and 600 characters.");return;}
   setError("");setQuestion(clean);setAnswer(civicGuideAnswer(clean));
 };
 return <ScrollView style={{flex:1,backgroundColor:palette.bg}} contentContainerStyle={{flexGrow:1,padding:18,paddingBottom:50}}>
   <View style={{width:"100%",maxWidth:900,alignSelf:"center"}}>
     <View style={{backgroundColor:palette.navy,borderRadius:24,padding:26,marginBottom:18}}>
       <Text style={{fontSize:15,color:"#FFB883",fontWeight:"900",letterSpacing:1.4}}>NAGRIK · FREE PUBLIC DEMO</Text>
       <Text style={{fontSize:30,fontWeight:"900",color:"#FFF",marginTop:12}}>Explore civic action before signing up.</Text>
       <Text style={{color:"#E0EAF3",marginTop:10,lineHeight:23}}>Try the free, prepared Civic Guide with no account or API payment. Join Nagrik when you're ready to record actions, try virtual weekly challenges, or use the shared Community Feed.</Text>
     </View>
     <Card>
       <Heading muted="Prepared guidance, not generative AI or legal advice. Runs in this browser without contacting OpenAI.">Try the free Civic Guide</Heading>
       <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:12}}>
         {starters.map(q=><Chip key={q} label={q} active={question===q} onPress={()=>ask(q)}/>)}
       </View>
       <Field label="Ask a civic question" value={question} onChangeText={setQuestion}
          multiline placeholder="For example: What can I do about street lighting?"/>
       <Notice text={error} error/>
       <Button label="Get free guidance" onPress={()=>ask(question)}/>
       {answer?<View style={{marginTop:19,backgroundColor:"#F6F9FD",borderRadius:14,padding:16}}>
          <Text style={{color:palette.orange,fontWeight:"900",fontSize:12,marginBottom:8}}>
             {answer.matched?"PREPARED CIVIC REFERENCE":"GENERAL GUIDANCE · TOPIC NOT COVERED"}
          </Text>
          <Text style={{color:palette.ink,lineHeight:23}}>{answer.reply}</Text>
       </View>:null}
       <Text style={{fontSize:12,color:palette.muted,marginTop:13,lineHeight:20}}>
         This guide does not use live data, verify local laws, respond to emergencies, or submit grievances.
         Do not enter private information, passwords or exact home addresses.
       </Text>
     </Card>
     <Card>
       <Heading>What else can you try with an account?</Heading>
       <Text style={{color:palette.muted,lineHeight:24}}>
         • Record personal civic actions and issue reports in this browser{"\n"}
         • Complete safe challenges with photo proof (unverified){"\n"}
         • Earn a virtual weekly badge after three distinct missions — no real vouchers{"\n"}
         • Share opted-in text contributions with verified members through Firebase{"\n"}
         • Explore public community posts and a self-reported weekly leaderboard
       </Text>
       <Text style={{color:palette.muted,marginVertical:14,lineHeight:20}}>
         These features require sign-in. Browser-saved actions, reports and proof are not automatically shared or synced across devices. Nagrik is not an official government service.
       </Text>
       <View style={{gap:10}}>
         <Button label="Create a free Nagrik account" onPress={()=>router.push("/signup")}/>
         <Button label="Already registered? Sign in" secondary onPress={()=>router.push("/login")}/>
       </View>
     </Card>
   </View>
 </ScrollView>;
}
