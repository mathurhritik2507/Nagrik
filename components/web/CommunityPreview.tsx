import React,{useEffect,useState} from "react";
import {Pressable,Text,View} from "react-native";
import {router} from "expo-router";
import {CommunityPost,communityRanking,subscribeCommunityPosts} from "../../lib/communityCloud";
import {Card,Heading,palette,dateLabel} from "./Kit";

export default function CommunityPreview(){
 const [posts,setPosts]=useState<CommunityPost[]>([]);
 const [state,setState]=useState<"loading"|"ready"|"unavailable">("loading");
 useEffect(()=>subscribeCommunityPosts(p=>{setPosts(p);setState("ready");},()=>setState("unavailable"),30),[]);
 const ranks=communityRanking(posts).slice(0,3);
 return <View>
   <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:8}}>
    <Heading muted="Shared activity from registered members—unverified and published by choice.">Community highlights 🏆</Heading>
    <Pressable accessibilityRole="button" onPress={()=>router.push("/leaderboard")}><Text style={{color:palette.orange,fontWeight:"900"}}>Leaderboard →</Text></Pressable>
   </View>
   <Card>
    {state==="unavailable"?<Text style={{color:palette.muted,lineHeight:21}}>The shared community feed is not available yet. The database may still need configuration.</Text>:
      state==="loading"?<Text style={{color:palette.muted}}>Loading shared activity…</Text>:
      ranks.length===0?<Text style={{color:palette.muted,lineHeight:21}}>No public contributors this week yet. Share your first positive action in the Community Feed.</Text>:
      ranks.map((r,i)=><View key={r.uid} style={{flexDirection:"row",alignItems:"center",paddingVertical:10,borderBottomWidth:i===ranks.length-1?0:1,borderColor:palette.border}}>
        <Text style={{fontSize:24,marginRight:12}}>{["🥇","🥈","🥉"][i]}</Text>
        <View style={{flex:1}}><Text style={{fontWeight:"900",color:palette.ink}}>{r.name}</Text><Text style={{color:palette.muted,fontSize:12}}>{r.city}</Text></View>
        <Text style={{color:palette.orange,fontWeight:"900"}}>{r.count} posts</Text>
      </View>)}
   </Card>
   <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:7}}>
    <Heading muted="Latest posts from members.">From the community</Heading>
    <Pressable accessibilityRole="button" onPress={()=>router.push("/community")}><Text style={{color:palette.orange,fontWeight:"900"}}>Open feed →</Text></Pressable>
   </View>
   <Card>{state==="ready"&&posts.length>0?posts.slice(0,3).map((p,i)=><View key={p.id} style={{paddingVertical:13,borderBottomWidth:i===Math.min(posts.length,3)-1?0:1,borderColor:palette.border}}>
     <Text style={{fontWeight:"900",color:palette.ink}}>{p.authorName} · {p.city}</Text>
     <Text style={{fontSize:12,color:palette.orange,marginTop:4}}>{p.category} · Self-reported</Text>
     <Text numberOfLines={2} style={{color:palette.muted,marginTop:7,lineHeight:21}}>{p.text}</Text>
    </View>):<Text style={{color:palette.muted}}>Visit the Community Feed to see or publish contributions once shared posting is enabled.</Text>}</Card>
 </View>;
}
