import React,{useState} from "react";
import {ScrollView,Text,View} from "react-native";
import {auth} from "../../firebaseConfig";
import {Shell,Card,Heading,Field,Button,Chip,Notice,palette} from "../../components/web/Kit";

type Message={role:"you"|"ai";text:string};
const starters=[
 "How can I report a pothole responsibly?",
 "How can I organize a neighborhood cleanliness drive?",
 "What can citizens do about air pollution?",
 "How does the weekly reward crate work?",
 "How can I make public spaces more accessible?",
 "How can I request a civic service in my city?"
];
export default function CivicAIWeb(){
 const [draft,setDraft]=useState("");
 const [messages,setMessages]=useState<Message[]>([
   {role:"ai",text:"Namaste! Ask me about civic rights, sanitation, waste, roads, accessibility, volunteering, sustainability, neighborhood improvements and more."}
 ]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const send=async(question:string)=>{
   const text=question.trim();
   if(!text||busy)return;
   if(text.length>600){setError("Questions must be 600 characters or less.");return;}
   const user=auth.currentUser;
   if(!user){setError("Please sign in again to use the civic assistant.");return;}
   setError("");setDraft("");
   const next=[...messages,{role:"you" as const,text}];
   setMessages(next);
   setBusy(true);
   try{
     const token=await user.getIdToken();
     const history=messages.slice(1).slice(-6).map(m=>({role:m.role==="you"?"user":"assistant",content:m.text}));
     const response=await fetch("/api/civic-assistant",{
       method:"POST",
       headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
       body:JSON.stringify({message:text,history})
     });
     let payload:any={};
     try{payload=await response.json();}catch{}
     if(!response.ok)throw new Error(payload.error||"The AI service isn't available right now. Please try again later.");
     if(!payload.reply)throw new Error("No response received. Please try again.");
     setMessages(previous=>[...previous,{role:"ai",text:payload.reply}]);
   }catch(e:any){
     // Preserve the unanswered question for an intentional retry, rather than
     // silently discarding it when the provider hits a quota or temporary limit.
     setDraft(previous=>previous.trim()?previous:text);
     setError(e.message||"Unable to send your question.");
   }finally{setBusy(false);}
 };
 return <Shell title="Nagrik Civic AI" subtitle="Ask open-ended questions about civic life, public services, local problems, and practical community participation." eyebrow="COMMUNITY / AI ASSISTANT">
   <Card>
     <Notice text="AI answers are general guidance, not verified legal advice or live government information. Nagrik cannot submit grievances for you. Please don't enter personal or sensitive details."/>
     <Heading muted="Pick a starter or ask your own question.">What would you like to explore?</Heading>
     <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:14}}>
       {starters.map(prompt=><Chip key={prompt} label={prompt} active={false} onPress={()=>send(prompt)}/>)}
     </View>
     <ScrollView style={{maxHeight:450,backgroundColor:"#F8FAFD",borderRadius:16}} contentContainerStyle={{padding:15}}>
       {messages.map((item,index)=><View key={index} style={{backgroundColor:item.role==="you"?palette.navy:"#FFF",padding:15,alignSelf:item.role==="you"?"flex-end":"flex-start",maxWidth:"94%",marginBottom:12,borderRadius:15,borderWidth:item.role==="ai"?1:0,borderColor:palette.border}}>
         <Text style={{color:item.role==="you"?"#FFC398":palette.orange,fontWeight:"800",fontSize:11,marginBottom:6}}>{item.role==="you"?"YOU":"NAGRIK CIVIC AI"}</Text>
         <Text style={{color:item.role==="you"?"#FFF":palette.ink,lineHeight:23}}>{item.text}</Text>
       </View>)}
       {busy?<Text style={{color:palette.muted,fontWeight:"700",padding:8}}>Nagrik AI is preparing a response…</Text>:null}
     </ScrollView>
     <View style={{marginTop:16}}>
       <Field label="Ask anything related to civic life (up to 600 characters)" value={draft} onChangeText={setDraft} multiline placeholder="For example: How can I get my neighborhood to separate wet and dry waste?"/>
       <Notice text={error} error/>
       <Button label="Ask Nagrik AI" onPress={()=>send(draft)} busy={busy} disabled={!draft.trim()}/>
       <View style={{marginTop:12}}><Button label="Start a new conversation" secondary onPress={()=>{setMessages(messages.slice(0,1));setError("");setDraft("");}}/></View>
     </View>
   </Card>
   <Card>
     <Heading>How the assistant works</Heading>
     <Text style={{color:palette.muted,lineHeight:22}}>Questions are sent securely from your authenticated session to a Vercel server function, which requests an AI-generated response. The API key stays on the server. The conversation is temporary and not saved in the Nagrik browser activity store. AI usage depends on the owner's API configuration and limits.</Text>
   </Card>
 </Shell>;
}
