import React,{useEffect,useState} from "react";
import {Text,View,Pressable} from "react-native";
import {router} from "expo-router";
import {auth} from "../../firebaseConfig";
import {CommunityPost,communityRanking,subscribeCommunityPosts} from "../../lib/communityCloud";
import {Card,Empty,Heading,Hero,Notice,Shell,palette} from "../../components/web/Kit";

export default function PublicLeaderboard(){
 const [posts,setPosts]=useState<CommunityPost[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>subscribeCommunityPosts(p=>{setPosts(p);setLoading(false);setError("");},e=>{setError(e);setLoading(false);},100),[]);
 const ranked=communityRanking(posts);
 const uid=auth.currentUser?.uid;
 const yourRank=ranked.findIndex(p=>p.uid===uid);
 return <Shell title="Community leaderboard" subtitle="Highlighting neighbors who publicly share civic contributions. Every position reflects self-reported posts, not independently verified impact." eyebrow="COMMUNITY / CONTRIBUTOR HIGHLIGHTS">
  <Hero kicker="WEEKLY COMMUNITY BOARD" title="People making a difference 🏆" description="The leaderboard resets each UTC Monday and ranks contributors by the number of shared posts during the current week. It uses at most the latest 100 available posts."/>
  {yourRank>=0?<Card>
    <Text style={{fontSize:12,color:palette.muted}}>Your current position within this sample</Text>
    <Text style={{fontWeight:"900",fontSize:28,color:palette.orange,marginTop:5}}>#{yourRank+1} · {ranked[yourRank].count} contribution{ranked[yourRank].count===1?"":"s"}</Text>
  </Card>:null}
  <Heading muted="Names appear only when members explicitly share a public post.">Weekly highlights</Heading>
  {error?<Notice text={error} error/>:null}
  <Card>
    {loading?<Text style={{color:palette.muted}}>Loading community contributors…</Text>:
     ranked.length===0?<Empty text="No public contributions this week yet. Verified members can share their first one in the Feed."/>:
     ranked.map((person,i)=><View key={person.uid} style={{
        flexDirection:"row",alignItems:"center",paddingVertical:15,
        paddingHorizontal:8,borderBottomWidth:i===ranked.length-1?0:1,
        borderColor:palette.border,backgroundColor:uid===person.uid?"#FFF5EB":"#FFF",borderRadius:8
      }}>
       <Text style={{fontSize:25,marginRight:13}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":"🏅"}</Text>
       <View style={{flex:1}}>
        <Text style={{fontWeight:"900",color:palette.ink,fontSize:16}}>#{i+1} {person.name}{uid===person.uid?"  ·  You":""}</Text>
        <Text style={{color:palette.muted,marginTop:4}}>{person.city} · Unverified civic activity</Text>
       </View>
       <View style={{paddingVertical:8,paddingHorizontal:12,backgroundColor:"#EFF5FC",borderRadius:18}}>
        <Text style={{color:palette.orange,fontWeight:"900"}}>{person.count} post{person.count===1?"":"s"}</Text>
       </View>
     </View>)}
  </Card>
  <Card>
    <Text style={{fontWeight:"900",color:palette.ink,fontSize:17,marginBottom:7}}>How ranking works</Text>
    <Text style={{color:palette.muted,lineHeight:22}}>This is a community-activity indicator calculated from recent public text posts, not an audited civic-impact score. It does not grant vouchers or verify participation. Scores can be influenced by self-reported activity, so they must not be used to determine financial rewards.</Text>
    <Pressable accessibilityRole="button" onPress={()=>router.push("/community")} style={{paddingTop:16}}>
      <Text style={{color:palette.orange,fontWeight:"900"}}>Explore the community feed →</Text>
    </Pressable>
  </Card>
 </Shell>;
}
