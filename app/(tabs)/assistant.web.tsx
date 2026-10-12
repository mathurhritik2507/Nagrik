import React,{useRef,useState} from "react";
import {ScrollView,Text,View} from "react-native";
import {auth} from "../../firebaseConfig";
import {civicGuideAnswer} from "../../lib/civicGuide";
import {Shell,Card,Heading,Field,Button,Chip,Notice,palette} from "../../components/web/Kit";

type Mode="guide"|"live";
type Message={role:"you"|"ai"|"guide";text:string;delivery?:"pending"|"failed"|"sent";requestId?:number};
const GREETING:Message={role:"guide",text:"Namaste! Free Civic Guide offers prepared answers about safe community action. Choose a topic or type a question. This is not live generative AI and cannot submit a government complaint."};
const starters=[
 "How can I report a pothole responsibly?",
 "How can I organize a neighborhood cleanliness drive?",
 "What can citizens do about air pollution?",
 "How does the weekly reward crate work?",
 "How can I make public spaces more accessible?",
 "How can I request a civic service in my city?"
];

export default function CivicAssistantWeb(){
 const [mode,setMode]=useState<Mode>("guide");
 const [draft,setDraft]=useState("");
 const [messages,setMessages]=useState<Message[]>([GREETING]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const inFlight=useRef(false);
 const requestCounter=useRef(0);

 const switchMode=(next:Mode)=>{
   if(inFlight.current)return;
   setMode(next);setError("");setNotice("");
 };
 const send=async(question:string)=>{
   const text=question.trim();
   if(!text||inFlight.current)return;
   if(text.length>600){setError("Questions must be 600 characters or less.");return;}
   const id=++requestCounter.current;
   setError("");setNotice("");setDraft("");
   setMessages(previous=>{
     const last=previous[previous.length-1];
     const item:Message={role:"you",text,requestId:id,delivery:mode==="guide"?"sent":"pending"};
     if(last.role==="you"&&last.text===text&&last.delivery==="failed")return [...previous.slice(0,-1),item];
     return [...previous,item];
   });
   if(mode==="guide"){
     const answer=civicGuideAnswer(text);
     setMessages(previous=>[...previous,{role:"guide",text:answer.reply}]);
     if(!answer.matched)setNotice("This question isn't covered by a specific prepared guide. Showing general starting points, not a generated answer.");
     return;
   }

   const user=auth.currentUser;
   if(!user){
     setMessages(previous=>previous.map(m=>m.requestId===id?{...m,delivery:"failed" as const}:m));
     setDraft(text);
     setError("Sign in to use Live AI, or switch to Free Civic Guide.");
     return;
   }
   const history=messages.slice(1)
     .filter(m=>m.delivery!=="failed"&&m.delivery!=="pending"&&m.role!=="guide")
     .slice(-6).map(m=>({role:m.role==="you"?"user":"assistant",content:m.text}));
   inFlight.current=true;setBusy(true);
   try{
     const token=await user.getIdToken();
     const response=await fetch("/api/civic-assistant",{
       method:"POST",
       headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
       body:JSON.stringify({message:text,history}),
     });
     let payload:any={};
     try{payload=await response.json();}catch{}
     if(!response.ok)throw new Error(payload.error||"Live AI is unavailable.");
     if(typeof payload.reply!=="string"||!payload.reply.trim())throw new Error("Live AI did not return an answer.");
     setMessages(previous=>[
       ...previous.map(m=>m.requestId===id?{...m,delivery:"sent" as const}:m),
       {role:"ai",text:payload.reply.trim()},
     ]);
   }catch(e:any){
     // Provider failures never masquerade as successful AI responses.
     const reference=civicGuideAnswer(text);
     setMessages(previous=>[
       ...previous.map(m=>m.requestId===id?{...m,delivery:"sent" as const}:m),
       {role:"guide",text:reference.reply},
     ]);
     setNotice("Live AI is unavailable ("+(e?.message||"provider error")+
       "). Showing prepared Civic Guide content instead; no AI answer was generated.");
     setMode("guide");
   }finally{inFlight.current=false;setBusy(false);}
 };

 return <Shell title="Nagrik Civic Assistant" subtitle="Try the free civic reference guide without API billing. Live AI is optional and requires active API credits." eyebrow="COMMUNITY / CIVIC HELP">
   <Card>
     <Notice text="PUBLIC DEMO: The free Civic Guide contains prepared reference material, not generated AI. It has no live government data and cannot submit official grievances. Do not enter personal or sensitive information."/>
     <Heading muted="Choose a free reference guide or optional paid AI mode.">Response mode</Heading>
     <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:8}}>
       <Chip label="Free Civic Guide · Works now" active={mode==="guide"} onPress={()=>switchMode("guide")}/>
       <Chip label="Live AI · Requires credits" active={mode==="live"} onPress={()=>switchMode("live")}/>
     </View>
     <Text style={{color:palette.muted,fontSize:12,lineHeight:20,marginBottom:14}}>
       {mode==="guide"
         ?"Free mode answers supported topics locally in your browser. No network request or OpenAI credits are used."
         :"Live AI sends your question to Nagrik's authenticated backend. If the provider is unavailable, you'll receive a clearly labeled prepared guide instead."}
     </Text>
     <Heading muted="Pick a starter or ask your own civic question.">What would you like to explore?</Heading>
     <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:14}}>
       {starters.map(prompt=><Chip key={prompt} label={prompt} active={false} onPress={()=>send(prompt)}/>)}
     </View>
     <ScrollView style={{maxHeight:450,backgroundColor:"#F8FAFD",borderRadius:16}} contentContainerStyle={{padding:15}}>
       {messages.map((item,index)=><View key={index} style={{
         backgroundColor:item.role==="you"?palette.navy:"#FFF",padding:15,
         alignSelf:item.role==="you"?"flex-end":"flex-start",maxWidth:"94%",
         marginBottom:12,borderRadius:15,borderWidth:item.role==="you"?0:1,borderColor:palette.border
       }}>
         <Text style={{color:item.role==="you"?"#FFC398":palette.orange,fontWeight:"800",fontSize:11,marginBottom:6}}>
           {item.role==="you"?(item.delivery==="failed"?"YOU · NOT ANSWERED":item.delivery==="pending"?"YOU · WAITING FOR AI":"YOU"):
             item.role==="guide"?"NAGRIK CIVIC GUIDE · PREPARED CONTENT":"NAGRIK LIVE AI"}
         </Text>
         <Text style={{color:item.role==="you"?"#FFF":palette.ink,lineHeight:23}}>{item.text}</Text>
       </View>)}
       {busy?<Text style={{color:palette.muted,fontWeight:"700",padding:8}}>Contacting the live AI provider…</Text>:null}
     </ScrollView>
     <View style={{marginTop:16}}>
       <Field label="Ask about civic life (up to 600 characters)" value={draft} onChangeText={setDraft} multiline
         placeholder="For example: How can my neighborhood separate wet and dry waste?"/>
       <Notice text={error} error/>
       <Notice text={notice}/>
       <Button label={mode==="guide"?"Get free civic guidance":"Ask Live AI"} onPress={()=>send(draft)} busy={busy} disabled={!draft.trim()||busy}/>
       <View style={{marginTop:12}}>
         <Button label="Start a new conversation" secondary disabled={busy}
           onPress={()=>{setMessages([GREETING]);setError("");setNotice("");setDraft("");}}/>
       </View>
     </View>
   </Card>
   <Card>
     <Heading>About the public demo</Heading>
     <Text style={{color:palette.muted,lineHeight:22}}>
       The free guide matches common civic topics to curated, safety-conscious suggestions and runs without contacting an AI provider. Questions outside these topics receive general guidance and a clear limitation. Live AI is separate and needs the project owner's API credits. Chat messages are temporary in this browser session. Neither mode files official complaints, verifies photographs, guarantees legal accuracy or awards real vouchers.
     </Text>
   </Card>
 </Shell>;
}
