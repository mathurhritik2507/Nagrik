import React,{useEffect,useRef,useState} from "react";
import {Pressable,Text,View} from "react-native";
import {router} from "expo-router";
import {reload,sendEmailVerification} from "firebase/auth";
import {auth} from "../../firebaseConfig";
import {categories,CommunityPost,CommunityConnectionStatus,checkCommunityConnection,communityRanking,publishCommunityPost,subscribeCommunityPosts} from "../../lib/communityCloud";
import {useCivicData} from "../../lib/webCivicStore";
import {CommunityPostCard} from "../../components/web/CommunityPostCard";
import {Button,Card,Chip,Empty,Field,Heading,Hero,Notice,Shell,palette} from "../../components/web/Kit";

export default function CommunityFeed(){
 const {data}=useCivicData();
 const [posts,setPosts]=useState<CommunityPost[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [feedError,setFeedError]=useState("");
 const [waitingForServer,setWaitingForServer]=useState(false);
 const publishingRef=useRef(false);
 const confirmationTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [success,setSuccess]=useState("");
 const [content,setContent]=useState("");
 const [city,setCity]=useState(data.profile.city||"Pune");
 const [category,setCategory]=useState(categories[0]);
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [verified,setVerified]=useState(auth.currentUser?.emailVerified===true);
 const [verifyBusy,setVerifyBusy]=useState(false);
 const [connection,setConnection]=useState<CommunityConnectionStatus | {kind:"checking";message:string}>({kind:"checking",message:"Testing a real Firestore server connection…"});
 const [checking,setChecking]=useState(false);
 const runConnectionCheck=async()=>{
   setChecking(true);setConnection({kind:"checking",message:"Testing a real Firestore server connection…"});
   try{setConnection(await checkCommunityConnection());}
   finally{setChecking(false);}
 };
 useEffect(()=>{
   const sub=subscribeCommunityPosts(items=>{setPosts(items);setFeedError("");setLoading(false);},
     msg=>{setFeedError(msg);setLoading(false);},50);
   return sub;
 },[]);
 useEffect(()=>()=>{if(confirmationTimer.current)clearTimeout(confirmationTimer.current);},[]);
 useEffect(()=>{void runConnectionCheck();},[]);
 useEffect(()=>{if(data.profile.city&&city==="Pune")setCity(data.profile.city);},[data.profile.city]);
 const emailAction=async(send:boolean)=>{
   const user=auth.currentUser;if(!user)return;
   setVerifyBusy(true);setError("");setSuccess("");
   try{
     if(send){
       if(user.emailVerified){setVerified(true);setSuccess("Your email is already verified.");return;}
       await sendEmailVerification(user);
       setSuccess("Firebase accepted a verification-email request for your sign-in address. Delivery is not guaranteed: check spam, Promotions, and your Firebase Authentication email settings.");
     }else{
       await reload(user);
       await user.getIdToken(true);
       setVerified(user.emailVerified);
       setSuccess(user.emailVerified?"Your email is verified. You can publish.":"Firebase still marks your account as unverified. Confirm you opened the verification link for this same account.");
     }
   }catch(e:any){
     const code=e?.code||"unknown";
     const messages:Record<string,string>={
       "auth/too-many-requests":"Firebase has temporarily rate-limited these requests. Please wait before trying again.",
       "auth/network-request-failed":"Cannot reach Firebase. Check your internet connection.",
       "auth/unauthorized-domain":"This app domain is not authorized in Firebase Authentication settings.",
       "auth/invalid-user-token":"Your session has expired. Sign out and sign in again.",
       "auth/user-token-expired":"Your session has expired. Sign out and sign in again.",
     };
     setError((messages[code]||"Firebase rejected the email operation.")+" ("+code+")");
   }
   finally{setVerifyBusy(false);}
 };
 const publish=async()=>{
   // Firestore may render a local copy BEFORE addDoc receives server approval.
   // Guard synchronously so double clicks cannot create two documents.
   if(publishingRef.current)return;
   setError("");setSuccess("");
   if(!consent){setError("You must opt in before making a public post.");return;}
   if(content.trim().length<20||content.trim().length>650){
     setError("Write a contribution between 20 and 650 characters.");return;
   }
   if(!verified){setError("Verify your Firebase email before publishing.");return;}
   if(connection.kind!=="connected"){
     setError("The app has not confirmed a Firestore server connection. Use ‘Recheck connection’ below; do not submit another post until the database is reachable.");
     return;
   }
   publishingRef.current=true;
   setBusy(true);setWaitingForServer(false);
   confirmationTimer.current=setTimeout(()=>{
     setWaitingForServer(true);
     setSuccess("Still waiting for confirmation from Firebase. A post shown below as Pending is not yet saved on the server. Please do not submit again.");
   },8000);
   try{
     await publishCommunityPost({text:content,city,category});
     setContent("");setConsent(false);
     setSuccess("Firebase confirmed your public contribution. It is now visible to other signed-in Nagrik members.");
   }catch(e:any){
     const code=e?.code||"unknown";
     const explanations:Record<string,string>={
       "permission-denied":"Firebase rejected your post. Check that your email is verified and that the community rules permit posting.",
       "unavailable":"Firebase is unavailable or your connection is offline. The post may have appeared locally but is not confirmed.",
       "unauthenticated":"Your login has expired. Sign in again.",
       "failed-precondition":"Firebase rejected the write because a database requirement was not met.",
     };
     setSuccess("");
     setError((explanations[code]||"Firestore could not confirm your contribution.")+" ("+code+"). Do not retry until you check whether the post exists in Firestore.");
   }finally{
     if(confirmationTimer.current)clearTimeout(confirmationTimer.current);
     confirmationTimer.current=null;
     publishingRef.current=false;
     setWaitingForServer(false);
     setBusy(false);
   }
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
   <Heading muted="A post appearing locally does not mean it reached Firebase. This test contacts the server directly.">Firestore connection</Heading>
   <Notice text={connection.message} error={connection.kind!=="connected"&&connection.kind!=="checking"}/>
   <View style={{marginTop:12}}><Button label="Recheck Firestore connection" secondary busy={checking} onPress={runConnectionCheck}/></View>
   <Text style={{color:palette.muted,marginTop:10,fontSize:12,lineHeight:19}}>If this check times out, disable browser extensions or VPN temporarily and try again. Do not submit the same post twice.</Text>
  </Card>
  <Card>
   <Heading muted="Posting is optional. Only publish information you want other signed-in members to see.">Share a civic contribution</Heading>
   {!verified?<View style={{marginBottom:15}}>
     <Notice error text="For community safety, verified email is required before sharing a public post."/>
     <Text style={{color:palette.ink,fontWeight:"700",marginBottom:8}}>Firebase sign-in address: {auth.currentUser?.email||"Unavailable"}</Text>
     <Text style={{color:palette.muted,fontSize:12,lineHeight:19,marginBottom:12}}>Verification is sent to this address, not necessarily the email shown in an older profile. Sending a request does not confirm inbox delivery.</Text>
     <View style={{marginBottom:12}}><Button label="Account help · check email or change password" secondary onPress={()=>router.push("/account-help")}/></View>
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
   <Button label={waitingForServer?"Awaiting Firebase confirmation — do not resubmit":"Publish to community feed"} disabled={!verified||!consent||content.trim().length<20||busy||connection.kind!=="connected"} busy={busy&&!waitingForServer} onPress={publish}/>
   <Text style={{color:palette.muted,fontSize:12,marginTop:12,lineHeight:19}}>Public feed posts are text-only in this version. Your separately saved issue reports, challenge proof photos and private actions are not automatically published.</Text>
  </Card>
  <Heading muted="Latest self-reported activity from signed-in community members.">Latest contributions</Heading>
  {feedError?<Notice text={feedError} error/>:null}
  {loading?<Card><Text style={{color:palette.muted}}>Loading community posts…</Text></Card>:
   posts.length===0?<Card><Empty text={feedError?"Unable to display shared contributions. Check the error above.":"No confirmed public contributions yet. Be the first verified member to share a civic action."}/></Card>:
   posts.map(p=><CommunityPostCard key={p.id} post={p}/>)}
 </Shell>;
}
