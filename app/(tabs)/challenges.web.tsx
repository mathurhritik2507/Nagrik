import React,{useState} from "react";
import {Image,Pressable,Text,View} from "react-native";
import {useCivicData} from "../../lib/webCivicStore";
import {pickWebPhoto} from "../../lib/webPhoto";
import {Shell,Card,Heading,Field,Button,Notice,Empty,palette,dateLabel} from "../../components/web/Kit";

const missions=[
 {id:"clean",name:"Cleanliness mission",icon:"🧹",detail:"Pick up litter safely in a public area. Avoid hazardous waste."},
 {id:"green",name:"Green action",icon:"🌱",detail:"Water a community plant or participate in a permitted planting activity."},
 {id:"learn",name:"Civic awareness",icon:"📚",detail:"Share a verified civic information resource with your community."},
 {id:"help",name:"Neighborhood helper",icon:"🤝",detail:"Participate in a local community support or volunteer activity."},
];
export default function WebChallenges(){
 const {data,addProof}=useCivicData();
 const [selected,setSelected]=useState<string|null>(null);
 const [text,setText]=useState("");const [image,setImage]=useState<string|undefined>();
 const [message,setMessage]=useState("");const [error,setError]=useState(false);
 const photo=async()=>{try{const uri=await pickWebPhoto();if(uri)setImage(uri);}catch(e:any){setError(true);setMessage(e.message||"Cannot open image.");}};
 const submit=()=>{setMessage("");try{
   if(!selected)throw new Error("Select a challenge first.");
   if(!image)throw new Error("Please attach a photo to document this challenge.");
   addProof({challengeId:selected,description:text,image});
   setSelected(null);setImage(undefined);setText("");setError(false);
   setMessage("Challenge proof saved on this device as unverified. No reviewer has approved it.");
 }catch(e:any){setError(true);setMessage(e.message||"Could not save proof.");}};
 const completed=new Set(data.proofs.map(p=>p.challengeId));
 return <Shell title="Civic challenges" subtitle="Choose a safe mission, document your effort, and track your own progress. Entries are unverified in this beta." eyebrow="COMMUNITY / CHALLENGES">
   <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:15,gap:12}}>
     <View style={{backgroundColor:palette.navy,borderRadius:18,padding:19,minWidth:190,flexGrow:1}}>
       <Text style={{color:"#CFDDEA"}}>Missions with proof</Text>
       <Text style={{color:"#FFF",fontSize:32,fontWeight:"900",marginTop:6}}>{completed.size} / {missions.length}</Text>
     </View>
     <View style={{backgroundColor:"#FFF",borderRadius:18,padding:19,minWidth:190,flexGrow:1,borderWidth:1,borderColor:palette.border}}>
       <Text style={{color:palette.muted}}>Saved proof submissions</Text>
       <Text style={{fontSize:32,color:palette.ink,fontWeight:"900",marginTop:6}}>{data.proofs.length}</Text>
     </View>
   </View>
   <Heading muted="Choose one to reveal its proof form. Never put yourself at risk for a challenge.">Available missions</Heading>
   <View style={{flexDirection:"row",flexWrap:"wrap",gap:12,marginBottom:15}}>
     {missions.map(m=><Pressable key={m.id} accessibilityRole="button" onPress={()=>{setSelected(m.id);setMessage("");}} style={{flexGrow:1,flexBasis:290,minWidth:250,backgroundColor:"#FFF",borderRadius:18,borderWidth:selected===m.id?2:1,borderColor:selected===m.id?palette.orange:palette.border,padding:20}}>
       <Text style={{fontSize:22}}>{m.icon}</Text>
       <Text style={{fontSize:17,fontWeight:"800",color:palette.ink,marginTop:10}}>{m.name}</Text>
       <Text style={{fontSize:13,color:palette.muted,marginTop:6,lineHeight:20}}>{m.detail}</Text>
       <Text style={{fontWeight:"800",color:completed.has(m.id)?palette.green:palette.orange,marginTop:14}}>{completed.has(m.id)?"Proof submitted ✓":"Select mission →"}</Text>
     </Pressable>)}
   </View>
   {selected?<Card>
      <Heading muted={"Selected mission: "+missions.find(m=>m.id===selected)?.name}>Document your participation</Heading>
      <Field label="Describe what you did (at least 12 characters)" value={text} onChangeText={setText} multiline placeholder="Where, when, and what safe action did you take?"/>
      {image?<Image source={{uri:image}} style={{width:175,height:120,borderRadius:12,marginBottom:12}}/>:null}
      <View style={{marginBottom:12,flexDirection:"row",gap:8,flexWrap:"wrap"}}>
       <Button label="Choose proof photo" secondary onPress={photo}/>
       <Button label="Cancel" secondary onPress={()=>{setSelected(null);setImage(undefined);setText("");}}/>
      </View>
      <Notice text={message} error={error}/>
      <Button label="Save unverified proof" onPress={submit}/>
     </Card>:<Notice text={message} error={error}/>}
   <Heading>Your challenge history</Heading>
   <Card>{data.proofs.length===0?<Empty text="No proof submissions saved yet."/>:data.proofs.map(p=><View key={p.id} style={{paddingVertical:10,borderBottomWidth:1,borderColor:palette.border}}>
     <Text style={{fontWeight:"800",color:palette.ink}}>{missions.find(m=>m.id===p.challengeId)?.name||"Civic mission"} · {dateLabel(p.createdAt)}</Text>
     <Text style={{fontSize:12,color:palette.orange,marginTop:4}}>Unverified local submission</Text>
     <Text style={{color:palette.muted,marginTop:5}}>{p.description}</Text>
     <Image source={{uri:p.image}} style={{width:120,height:80,borderRadius:10,marginTop:8}}/>
   </View>)}</Card>
 </Shell>;
}
