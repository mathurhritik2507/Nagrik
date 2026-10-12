import React,{useEffect,useState} from "react";
import {Pressable,Text,View} from "react-native";
import {router} from "expo-router";
import {reload,sendEmailVerification} from "firebase/auth";
import {auth} from "../../firebaseConfig";
import {categories,CommunityPost,communityRanking,publishCommunityPost,subscribeCommunityPosts} from "../../lib/communityCloud";
import {useCivicData} from "../../lib/webCivicStore";
import {CommunityPostCard} from "../../components/web/CommunityPostCard";
import {Button,Card,Chip,Empty,Field,Heading,Hero,Notice,Shell,palette} from "../../components/web/Kit";

export default function CommunityFeed(){
 const {data}=useCivicData();
 const [posts,setPosts]=useState<CommunityPost[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [content,setContent]=useState("");
 const [city,setCity]=useState(data.profile.city||"Pune");
 const [category,setCategory]=useState(categories[0]);
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [verified,setVerified]=useState(auth.currentUser?.emailVerified===true);
 const [verifyBusy,setVerifyBusy]=useState(false);
 useEffect(()=>{const sub=subscribeCommunityPosts(items=>{setPosts(items);setError("");setLoading(false);},
   msg=>{setError(msg);setLoading(false);},50);return sub;},[]);
 useEffect(()=>{if(data.profile.city&&city==="Pune")setCity(data.profile.city);},[data.profile.city]);
 const emailAction=async(send:boolean)=>{
   const user=auth.currentUser;if(!user)return;
   setVerifyBusy(true);setError("");setSuccess("");
   try{
     if(send){await sendEmailVerification(user);setSuccess("Verification email requested. Check your inbox and spam folder.");}
     else{await reload(user);await user.getIdToken(true);setVerified(user.emailVerified);
       setSuccess(user.emailVerified?"Your email is verified. You can publish.":"Your email isn't verified yet. Open the link in the email, then try again.");}
   }catch(e:any){setError(e.code==="auth/too-many-requests"?"Please wait before requesting another email.":e.message||"Unable to verify email.");}
   finally{setVerifyBusy(false);}
 };
 const publish=async()=>{
   setError("");setSuccess("");
   if(!consent){setError("You must opt in before making a public post.");return;}
   setBusy(true);
   try{
     await publishCommunityPost({text:content,city,category});
     setContent("");setConsent(false);
     setSuccess("Your community contribution was published. It is self-reported and visible to other signed-in members.");
   }catch(e:any){setError(e.message||"Unable to publish. Check that the Firestore database and security rules are configured.");}
   finally{setBusy(false);}
 };
 const rank=communityRanking(posts).slice(0,3);
 return <Shell title="Community feed" subtitle="Celebrate neighbors making a difference. Real posts from Nagrik members, not sample content." eyebrow="COMMUNITY / SHARED CONTRIBUTIONS">
  <Hero kicker="COMMUNITY IN ACTION" title="The good we do, together." description="Share a positive initiative, support civic contributors, and learn from people improving their neighborhoods. Posts are self-reported and not independently verified."/>
  <View style={{flexDirection:"row",flexWrap:"wrap",gap:12,marginBottom:20}}>
   <Pressable accessibilityRole="button" onPress={()=>router.push("/leaderboard")} style={{backgroundColor:"#FFF",borderWidth:1,borderColor:palette.border,borderRadius:16,padding:20,flexGrow:1,minWidth:220}}>
     <Text style={{fontSize:18,fontWeight:"900",color:palette.ink}}>🏆 Weekly highlights</Text>
     <Text style={{color:palette.muted,marginTop:7}}>View contributors ranked by shared posts.</Text>
     <Text style={{color:palette.orange,marginTop:12,fontWeight:"800"}}>Open leaderboard →</Text>
   </Pressable>
   <Pressable accessibilityRole="button" onPress={()=>router.push("/explore")} style={{backgroundColor:"#FFF",borderWidth:1,borderColor:palette.border,borderRadius:16,padding:20,flexGrow:1,minWidth:220}}>
     <Text style={{fontSize:18,fontWeight:"900",color:palette.ink}}>🌱 My civic actions</Text>
     <Text style={{color:palette.muted,marginTop:7}}>Keep your actions and photos private.</Text>
     <Text style={{color:palette.orange,marginTop:12,fontWeight:"800"}}>Record an action →</Text>
   </Pressable>
  </View>
  {rank.length>0?<Card>
    <Heading muted="Among this feed's most recent 50 public posts; participation is unverified.">This week's highlighted contributors</Heading>
    <View style={{flexDirection:"row",gap:10,flexWrap:"wrap"}}>
      {rank.map((p,i)=><View key={p.uid} style={{flexGrow:1,minWidth:150,backgroundColor:"#F3F7FC",padding:15,borderRadius:12}}>
       <Text style={{fontSize:21}}>{["🥇","🥈","🥉"][i]}</Text>
       <Text style={{fontWeight:"900",color:palette.ink,marginTop:6}}>{p.name}</Text>
       <Text style={{color:palette.muted,fontSize:12,marginTop:3}}>{p.city} · {p.count} post{p.count===1?"":"s"}</Text>
      </View>)}
    </View>
  </Card>:null}
  <Card>
   <Heading muted="Posting is optional. Only publish information you want other signed-in members to see.">Share a civic contribution</Heading>
   {!verified?<View style={{marginBottom:15}}>
     <Notice error text="For community safety, verified email is required before sharing a public post."/>
     <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
       <Button secondary busy={verifyBusy} label="Send verification email" onPress={()=>emailAction(true)}/>
       <Button secondary busy={verifyBusy} label="I've verified — check again" onPress={()=>emailAction(false)}/>
     </View>
   </View>:null}
   <Field label="Your city (shown publicly)" value={city} onChangeText={setCity} placeholder="Enter your city"/>
   <Text style={{fontWeight:"800",color:palette.ink,marginBottom:9}}>Category</Text>
   <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:11}}>{categories.map(c=><Chip key={c} label={c} active={category===c} onPress={()=>setCategory(c)}/>)}</View>
   <Field label="What positive civic action or useful tip would you like to share?" value={content} onChangeText={setContent} multiline placeholder="I joined a permitted community cleanup and learned how to safely segregate recyclable waste..."/>
   <Pressable accessibilityRole="checkbox" accessibilityState={{checked:consent}} onPress={()=>setConsent(x=>!x)}
     style={{flexDirection:"row",alignItems:"flex-start",marginBottom:16,padding:10,backgroundColor:"#F6F8FC",borderRadius:10}}>
     <Text style={{fontSize:20,color:palette.orange,marginRight:9}}>{consent?"☑":"☐"}</Text>
     <Text style={{color:palette.ink,flex:1,lineHeight:22,fontSize:13}}>I agree to publish my name, city and this message to other signed-in Nagrik members. I will not include phone numbers, private addresses, pictures of strangers or sensitive information.</Text>
   </Pressable>
   <Notice text={error} error/><Notice text={success}/>
   <Button label="Publish to community feed" disabled={!verified||!consent||!content.trim()} busy={busy} onPress={publish}/>
   <Text style={{color:palette.muted,fontSize:12,marginTop:12,lineHeight:19}}>Public feed posts are text-only in this version. Your separately saved issue reports, challenge proof photos and private actions are not automatically published.</Text>
  </Card>
  <Heading muted="Latest self-reported activity from signed-in community members.">Latest contributions</Heading>
  {loading?<Card><Text style={{color:palette.muted}}>Loading community posts…</Text></Card>:
   posts.length===0?<Card><Empty text={error?"Community feed is unavailable until database rules are configured.":"No public contributions yet. Be the first verified member to share a civic action."}/></Card>:
   posts.map(p=><CommunityPostCard key={p.id} post={p}/>)}
 </Shell>;
}
