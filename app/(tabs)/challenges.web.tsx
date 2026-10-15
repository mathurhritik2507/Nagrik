import React,{useState} from "react";
import {Image,Pressable,Text,View} from "react-native";
import {useCivicData} from "../../lib/webCivicStore";
import {pickWebPhoto} from "../../lib/webPhoto";
import {reviewChallengePhoto} from "../../lib/challengeReview";
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
 const [photoConsent,setPhotoConsent]=useState(false);
 const [reviewing,setReviewing]=useState(false);
 const [crateReveal,setCrateReveal]=useState<string|null>(null);
 const now=new Date();
 const week=weekKeyFor(now);
 const weekProofs=currentWeekProgress(data.proofs,now);
 const claim=data.crateClaims.find(c=>c.weekKey===week);
 const prize=REWARD_BADGES.find(p=>p.id===claim?.rewardId);
 const endDate=currentWeekEnds(now).toLocaleDateString(undefined,{month:"short",day:"numeric",timeZone:"UTC"});
 const done=Math.min(weekProofs.size,WEEKLY_GOAL);
 const photo=async()=>{setMessage("");try{const uri=await pickWebPhoto();if(uri){setImage(uri);setPhotoConsent(false);}}catch(e:any){setError(true);setMessage(e.message||"Could not open image.");}};
 const submit=async()=>{
   if(reviewing)return;
   setMessage("");setError(false);
   try{
     if(!selected)throw new Error("Choose a challenge.");
     if(!image)throw new Error("Please attach a photo showing your action.");
     if(text.trim().length<12)throw new Error("Describe your action in at least 12 characters.");
     if(!photoConsent)throw new Error("Please consent before sending the photo for AI screening.");
     setReviewing(true);
     const review=await reviewChallengePhoto(selected,text.trim(),image);
     if(review.decision!=="relevant"){
       setError(true);
       setMessage("Photo not accepted for automatic screening: "+review.reason+
         " Please try clearer evidence, or wait for a future manual-review option.");
       return;
     }
     addProof({challengeId:selected,description:text,image,status:"AI-screened"});
     setSelected(null);setImage(undefined);setText("");setPhotoConsent(false);
     setMessage("AI screened this image as likely relevant. This is NOT independent proof of completing the task. A demonstration badge may count this local entry.");
   }catch(e:any){setError(true);setMessage(e.message||"Photo screening failed. No proof was saved.");}
   finally{setReviewing(false);}
 };
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
         disabled={weekProofs.size<WEEKLY_GOAL} onPress={open} help="After three different locally saved challenges, open one demonstration badge crate per UTC week. Badges have no real-world value."/>}
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
       onPress={()=>{setSelected(m.id);setImage(undefined);setText("");setPhotoConsent(false);setMessage("");setError(false);}} style={({pressed})=>({flexGrow:1,flexBasis:255,minWidth:230,backgroundColor:"#FFF",borderRadius:18,borderWidth:selected===m.id?2:1,borderColor:selected===m.id?palette.orange:palette.border,padding:20,opacity:pressed?.8:1})}>
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
           <Button label="Select photo evidence" secondary onPress={photo} help="Choose one photo. Nagrik resizes it in your browser to reduce data use before AI review."/>
           <Button label="Cancel" secondary onPress={()=>{setSelected(null);setImage(undefined);setText("");setPhotoConsent(false);}}/>
         </View>
         <Pressable accessibilityRole="checkbox" accessibilityState={{checked:photoConsent}}
           onPress={()=>setPhotoConsent(v=>!v)}
           style={{flexDirection:"row",alignItems:"flex-start",gap:10,marginBottom:14,padding:8}}>
           <Text style={{fontSize:20,color:palette.navy}}>{photoConsent?"☑":"☐"}</Text>
           <Text style={{flex:1,color:palette.muted,fontSize:12,lineHeight:19}}>
             I agree to send this resized photo and my description to an AI provider for one-time relevance screening.
             It is not uploaded to Nagrik cloud storage, but provider processing and retention policies apply.
             An AI result cannot prove that I completed the challenge.
           </Text>
         </Pressable>
         <Button label={reviewing?"Checking photo…":"Check photo and save proof"} busy={reviewing} onPress={submit}
           help="A signed-in AI service checks whether the photo seems related to this challenge. Unclear or unrelated photos will not be saved. No real reward is awarded."/>
         <Text style={{fontSize:12,color:palette.muted,marginTop:10,lineHeight:18}}>
           AI checks are optional to enable in this beta. If the service is unavailable, no proof is saved. Please try again later.
         </Text>
       </>}
     </Card>:null}
   <Heading muted="Your local records and opened demo crates.">My weekly history</Heading>
   <Card>{data.proofs.length===0?<Empty text="No missions submitted yet."/>:data.proofs.map(p=><View key={p.id} style={{paddingVertical:12,borderBottomWidth:1,borderColor:palette.border}}>
     <Text style={{fontWeight:"800",color:palette.ink}}>{missions.find(m=>m.id===p.challengeId)?.name||"Civic mission"} · {dateLabel(p.createdAt)}</Text>
     <Text style={{color:palette.orange,fontSize:12,marginTop:4}}>{p.status==="AI-screened"?"AI-screened (not independently verified)":"Unverified proof"} · {weekKeyFor(new Date(p.createdAt))}</Text>
     <Text style={{color:palette.muted,marginTop:6,lineHeight:19}}>{p.description}</Text>
     <Image source={{uri:p.image}} style={{height:76,width:120,borderRadius:9,marginTop:8}}/>
   </View>)}</Card>
   <Heading muted="A history of virtual badges unlocked on this device.">Reward cabinet</Heading>
   <Card>{data.crateClaims.length===0?<Empty text="Open your first weekly crate to collect a digital badge."/>:
     data.crateClaims.map(c=>{
       const badge=REWARD_BADGES.find(b=>b.id===c.rewardId);
       return <View key={c.weekKey} style={{paddingVertical:12,borderBottomWidth:1,borderColor:palette.border}}>
         <Text style={{fontSize:18,fontWeight:"800",color:palette.ink}}>{badge?.emoji||"🏅"} {badge?.name||"Virtual badge"}</Text>
         <Text style={{color:palette.muted,marginTop:5}}>Week of {c.weekKey} · Opened {dateLabel(c.openedAt)}</Text>
         <Text style={{color:palette.orange,fontSize:12,marginTop:4}}>Digital collectible · No monetary value</Text>
       </View>;
     })}</Card>
   <Card><Heading>How the crate works</Heading>
     <Text style={{color:palette.muted,lineHeight:22}}>Submit photo and a description for {WEEKLY_GOAL} distinct safe missions during a Monday–Sunday UTC week. Open your crate once to reveal one virtual collectible badge. Proofs and demo badges remain saved locally in your browser. New photos may undergo optional AI relevance screening, which cannot prove completion and does not prevent all fraud. Actual vouchers require server-verified eligibility, anti-fraud controls, sponsors, and secure redemption; none are offered yet.</Text>
   </Card>
 </Shell>;
}
