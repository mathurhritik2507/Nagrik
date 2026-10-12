import React,{useState} from "react";
import {ScrollView,Text,View} from "react-native";
import {Shell,Card,Heading,Field,Button,Chip,Notice,palette} from "../../components/web/Kit";

type Message={role:"you"|"guide";text:string};
const prompts=["How do I report an issue?","What civic challenge can I try?","How does XP work?","How can I volunteer?"];
function answer(input:string){
 const text=input.toLowerCase();
 if(/emergency|urgent|fire|accident|danger/.test(text))return "For emergencies, contact official emergency services immediately. Nagrik is not an emergency reporting platform.";
 if(/report|issue|garbage|road|pothole|water/.test(text))return "Use the Report tab, choose a category, provide a general location and a clear description. Your beta report is stored only in this browser; it is not forwarded to authorities.";
 if(/challenge|mission|proof/.test(text))return "Open Challenges, select a safe mission, write what you did and attach a photo. The result stays unverified; the app does not automatically approve proof.";
 if(/score|xp|point|reward/.test(text))return "Practice XP is based on locally recorded actions and issue reports (50 per action, 20 per report). It is a prototype engagement score, not verified civic impact.";
 if(/volunteer|help|community|action/.test(text))return "Start with a small, safe activity: community cleanup, verified donation drives, recycling, or local volunteering. Follow local rules and seek permission where required.";
 return "I can guide you through reporting, civic challenges, XP and community participation. Choose a suggested question to explore.";
}
export default function WebGuide(){
 const [draft,setDraft]=useState("");
 const [messages,setMessages]=useState<Message[]>([{role:"guide",text:"Namaste! I'm the Nagrik civic guide. Ask how to record an action, save an issue, or join a challenge."}]);
 const send=(value:string)=>{const v=value.trim();if(!v)return;setMessages(prev=>[...prev,{role:"you",text:v},{role:"guide",text:answer(v)}]);setDraft("");};
 return <Shell title="Your civic guide" subtitle="Practical community participation guidance in a simple conversation." eyebrow="COMMUNITY / GUIDE">
   <Card><Notice text="This assistant is rule-based, not an AI language model. It does not provide legal advice or contact authorities."/>
     <Heading muted="Choose a suggestion or type your own question.">Quick questions</Heading>
     <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:12}}>{prompts.map(p=><Chip key={p} label={p} active={false} onPress={()=>send(p)}/>)}</View>
     <View style={{maxHeight:390}}>
     <ScrollView style={{maxHeight:390}} contentContainerStyle={{paddingVertical:8}}>
       {messages.map((m,i)=><View key={i} style={{alignSelf:m.role==="you"?"flex-end":"flex-start",backgroundColor:m.role==="you"?palette.navy:"#F0F4F8",padding:14,maxWidth:"87%",borderRadius:14,marginBottom:10}}>
         <Text style={{fontSize:11,fontWeight:"800",color:m.role==="you"?"#FFBD85":palette.muted,marginBottom:4}}>{m.role==="you"?"YOU":"NAGRIK GUIDE"}</Text>
         <Text style={{color:m.role==="you"?"#FFF":palette.ink,lineHeight:22}}>{m.text}</Text>
       </View>)}
     </ScrollView></View>
     <Field label="Your question" value={draft} onChangeText={setDraft} placeholder="Ask a civic question..."/>
     <Button label="Send message" onPress={()=>send(draft)}/>
   </Card>
 </Shell>;
}
