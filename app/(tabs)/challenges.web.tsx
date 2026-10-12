import React,{useState} from "react";
import {Image,Pressable,Text,View} from "react-native";
import {useCivicData} from "../../lib/webCivicStore";
import {pickWebPhoto} from "../../lib/webPhoto";
import {WEEKLY_GOAL,REWARD_BADGES,currentWeekProgress,currentWeekEnds,weekKeyFor} from "../../lib/weeklyRewards";
import {Shell,Card,Heading,Field,Button,Notice,Empty,palette,dateLabel} from "../../components/web/Kit";

const missions=[
 {id:"clean",name:"Cleanliness mission",icon:"🧹",detail:"Safely tidy a shared space. Never touch sharp or hazardous waste.",category:"Environment"},
 {id:"green",name:"Green guardian",icon:"🌱",detail:"Water a public plant with permission or join an approved planting drive.",category:"Environment"},
 {id:"recycle",name:"Recycling check",icon:"♻️",detail:"Sort accepted recyclable items using your local recycling rules.",category:"Environment"},
 {id:"water",name:"Save water",icon:"💧",detail:"Fix a small safe leak at home or adopt one practical water-saving habit.",category:"Environment"},
 {id:"learn",name:"Civic awareness",icon:"📚",detail:"Read an official civic guideline and share one accurate takeaway.",category:"Learning"},
 {id:"help",name:"Community helper",icon:"🤝",detail:"Volunteer in a permitted local initiative or help a neighbor safely.",category:"Community"},
 {id:"road",name:"Safe streets",icon:"🚦",detail:"Document a safety improvement idea without entering roads or disturbing traffic.",category:"Community"},
 {id:"energy",name:"Energy saver",icon:"⚡",detail:"Reduce wasted electricity and document the change safely.",category:"Everyday habits"},
 {id:"access",name:"Accessible spaces",icon:"♿",detail:"Identify a public accessibility barrier; do not photograph people without consent.",category:"Community"},
 {id:"public",name:"Care for shared spaces",icon:"🏞️",detail:"Contribute to a legal, safe activity benefiting a local public space.",category:"Community"},
];
export default function WebChallenges(){
 const {data,addProof,openWeeklyCrate}=useCivicData();
 const [selected,setSelected]=useState<string|null>(null);
 const [text,setText]=useState("");const [image,setImage]=useState<string|undefined>();
 const [message,setMessage]=useState("");const [error,setError]=useState(false);
 const [crateReveal,setCrateReveal]=useState<string|null>(null);
 const now=new Date();
 const week=weekKeyFor(now);
 const weekProofs=currentWeekProgress(data.proofs,now);
 const claim=data.crateClaims.find(c=>c.weekKey===week);
 const prize=REWARD_BADGES.find(p=>p.id===claim?.rewardId);
 const endDate=currentWeekEnds(now).toLocaleDateString(undefined,{month:"short",day:"numeric",timeZone:"UTC"});
 const done=Math.min(weekProofs.size,WEEKLY_GOAL);
 const photo=async()=>{setMessage("");try{const uri=await pickWebPhoto();if(uri)setImage(uri);}catch(e:any){setError(true);setMessage(e.message||"Could not open image.");}};
 const submit=()=>{setMessage("");try{
   if(!selected)throw new Error("Choose a challenge.");
   if(!image)throw new Error("Please attach a photo showing your action.");
   addProof({challengeId:selected,description:text,image});
   setSelected(null);setImage(undefined);setText("");setError(false);
   setMessage("Challenge proof saved as unverified. Your weekly progress has been updated on this device.");
 }catch(e:any){setError(true);setMessage(e.message||"Could not save proof.");}};
 const open=()=>{setMessage("");try{
   const prize=openWeeklyCrate();
   setCrateReveal(prize.name);setError(false);
   setMessage("Crate opened! Your virtual badge is now in your weekly reward history.");
 }catch(e:any){setError(true);setMessage(e.message||"Cannot open this crate yet.");}};
 return <Shell title="Weekly civic challenges" subtitle="Complete different safe community missions during one UTC calendar week, submit photo evidence, and earn a virtual reward crate." eyebrow="COMMUNITY / WEEKLY MISSIONS">
   <View style={{backgroundColor:palette.navy,borderRadius:24,padding:24,marginBottom:18}}>
     <Text style={{color:"#FFB77F",fontWeight:"800",letterSpacing:1.5,fontSize:12}}>YOUR WEEKLY CHALLENGE</Text>
     <Text style={{fontSize:27,fontWeight:"900",color:"#FFF",marginTop:9}}>{claim?"🎁 Crate opened":weekProofs.size>=WEEKLY_GOAL?"🎁 Your crate is unlocked!":"🎁 Unlock the weekly crate"}</Text>
     <Text style={{color:"#D3E1EE",marginTop:9,lineHeight:22}}>Complete {WEEKLY_GOAL} different missions before {endDate} (UTC). Each mission counts once per week. Every proof remains unverified.</Text>
     <View style={{flexDirection:"row",gap:10,marginTop:17,flexWrap:"wrap"}}>
       <Text style={{fontSize:34,fontWeight:"900",color:"#FFF"}}>{done}/{WEEKLY_GOAL}</Text>
       <View style={{flex:1,minWidth:150,justifyContent:"center"}}><View style={{height:12,backgroundColor:"#344B64",borderRadius:12,overflow:"hidden"}}>
         <View style={{height:12,backgroundColor:palette.orange,width:`${100*done/WEEKLY_GOAL}%`,borderRadius:12}}/>
       </View><Text style={{color:"#C7D4E3",fontSize:12,marginTop:9}}>{weekProofs.size} unique missions submitted this week</Text></View>
     </View>
     <View style={{marginTop:19}}>
       {claim?<View>
         <Text style={{color:"#FFF",fontWeight:"800",fontSize:18}}>Collected: {prize?.emoji} {prize?.name||"Virtual badge"}</Text>
         <Text style={{color:"#CCDAEA",marginTop:6}}>One crate per week. Your badge has no cash value.</Text>
       </View>:<Button label={weekProofs.size>=WEEKLY_GOAL?"Open my weekly crate 🎁":`Complete ${Math.max(0,WEEKLY_GOAL-weekProofs.size)} more different mission(s)`}
         disabled={weekProofs.size<WEEKLY_GOAL} onPress={open}/>}
     </View>
   </View>
   <Notice text={message} error={error}/>
   {crateReveal?<Card><Text style={{fontWeight:"900",fontSize:23,color:palette.orange}}>🎉 Congratulations!</Text>
     <Text style={{fontWeight:"800",fontSize:17,color:palette.ink,marginTop:8}}>You unlocked {crateReveal}.</Text>
     <Text style={{color:palette.muted,marginTop:9,lineHeight:21}}>This is a demonstration collectible, not a redeemable voucher, cash prize, or verified community impact award.</Text>
     <View style={{marginTop:13}}><Button secondary label="Close reward" onPress={()=>setCrateReveal(null)}/></View></Card>:null}
   <Heading muted="Choose one of the ten missions. Complete three different ones this week.">Explore missions</Heading>
   <View style={{flexDirection:"row",flexWrap:"wrap",gap:12,marginBottom:15}}>
     {missions.map(m=><Pressable key={m.id} accessibilityRole="button" accessibilityLabel={`Select ${m.name}`}
       onPress={()=>{setSelected(m.id);setMessage("");setError(false);}} style={({pressed})=>({flexGrow:1,flexBasis:255,minWidth:230,backgroundColor:"#FFF",borderRadius:18,borderWidth:selected===m.id?2:1,borderColor:selected===m.id?palette.orange:palette.border,padding:20,opacity:pressed?.8:1})}>
       <Text style={{fontSize:25}}>{m.icon}</Text>
       <Text style={{fontSize:17,fontWeight:"800",color:palette.ink,marginTop:10}}>{m.name}</Text>
       <Text style={{fontSize:12,color:palette.orange,fontWeight:"700",marginTop:5}}>{m.category}</Text>
       <Text style={{fontSize:13,color:palette.muted,marginTop:8,lineHeight:20}}>{m.detail}</Text>
       <Text style={{fontWeight:"800",color:weekProofs.has(m.id)?palette.green:palette.orange,marginTop:13}}>{weekProofs.has(m.id)?"Submitted this week ✓":selected===m.id?"Selected ●":"Select mission →"}</Text>
     </Pressable>)}
   </View>
   {selected?<Card>
       <Heading muted={`Mission: ${missions.find(m=>m.id===selected)?.name||"Civic challenge"}`}>Document your action</Heading>
       {weekProofs.has(selected)?<Notice text="You've already submitted this mission this week. Select a different mission to make progress." error/>:<>
         <Field label="What did you do? (minimum 12 characters)" value={text} onChangeText={setText} multiline placeholder="Briefly explain your action. Avoid identifying strangers or giving sensitive locations."/>
         {image?<Image source={{uri:image}} style={{width:190,height:122,borderRadius:12,marginBottom:12}}/>:null}
         <View style={{flexDirection:"row",gap:9,flexWrap:"wrap",marginBottom:12}}>
           <Button label="Select photo evidence" secondary onPress={photo}/>
           <Button label="Cancel" secondary onPress={()=>{setSelected(null);setImage(undefined);setText("");}}/>
         </View>
         <Button label="Save unverified challenge proof" onPress={submit}/>
       </>}
     </Card>:null}
   <Heading muted="Your local records and opened demo crates.">My weekly history</Heading>
   <Card>{data.proofs.length===0?<Empty text="No missions submitted yet."/>:data.proofs.map(p=><View key={p.id} style={{paddingVertical:12,borderBottomWidth:1,borderColor:palette.border}}>
     <Text style={{fontWeight:"800",color:palette.ink}}>{missions.find(m=>m.id===p.challengeId)?.name||"Civic mission"} · {dateLabel(p.createdAt)}</Text>
     <Text style={{color:palette.orange,fontSize:12,marginTop:4}}>Unverified proof · {weekKeyFor(new Date(p.createdAt))}</Text>
     <Text style={{color:palette.muted,marginTop:6,lineHeight:19}}>{p.description}</Text>
     <Image source={{uri:p.image}} style={{height:76,width:120,borderRadius:9,marginTop:8}}/>
   </View>)}</Card>
   <Card><Heading>How the crate works</Heading>
     <Text style={{color:palette.muted,lineHeight:22}}>Submit photo and a description for {WEEKLY_GOAL} distinct safe missions during a Monday–Sunday UTC week. Open your crate once to reveal one virtual collectible badge. The current system runs locally in your browser and does not verify proof. Actual vouchers require sponsors, audited eligibility, anti-fraud checks and a secure server-side redemption system; none are offered yet.</Text>
   </Card>
 </Shell>;
}
