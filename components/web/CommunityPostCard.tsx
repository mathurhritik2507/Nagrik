import React,{useEffect,useState} from "react";
import {Pressable,Text,View} from "react-native";
import {auth} from "../../firebaseConfig";
import {
  CommunityPost,CommunityComment,addCommunityComment,deleteCommunityComment,
  deleteCommunityPost,flagCommunityPost,setPostLike,
  subscribeComments,subscribeLikes
} from "../../lib/communityCloud";
import {Card,Button,Field,Notice,palette,dateLabel} from "./Kit";

export function CommunityPostCard({post}:{post:CommunityPost}){
 const uid=auth.currentUser?.uid;
 const own=post.authorUid===uid;
 const [likers,setLikers]=useState<string[]>([]);
 const [comments,setComments]=useState<CommunityComment[]>([]);
 const [expanded,setExpanded]=useState(false);
 const [draft,setDraft]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [status,setStatus]=useState("");
 const [flagging,setFlagging]=useState(false);
 useEffect(()=>subscribeLikes(post.id,setLikers,setError),[post.id]);
 useEffect(()=>{
  if(!expanded)return;
  return subscribeComments(post.id,setComments,setError);
 },[post.id,expanded]);
 const tryAction=async(fn:()=>Promise<void>,message:string)=>{
  setError("");setStatus("");setBusy(true);
  try{await fn();setStatus(message);}catch(e:any){setError(e.message||"The action could not be completed.");}
  finally{setBusy(false);}
 };
 const date=post.createdAt?.seconds?dateLabel(new Date(post.createdAt.seconds*1000).toISOString()):"Just now";
 return <Card>
  <View style={{flexDirection:"row",alignItems:"center",gap:12,marginBottom:13}}>
   <View style={{backgroundColor:"#FFE5D3",borderRadius:24,width:46,height:46,alignItems:"center",justifyContent:"center"}}>
     <Text style={{color:palette.orange,fontWeight:"900",fontSize:20}}>{(post.authorName||"N")[0]?.toUpperCase()}</Text>
   </View>
   <View style={{flex:1}}>
     <Text style={{fontWeight:"900",fontSize:16,color:palette.ink}}>{post.authorName}{own?"  ·  You":""}</Text>
     <Text style={{color:palette.muted,fontSize:12,marginTop:3}}>{post.city} · {date} · Community contribution</Text>
   </View>
  </View>
  <Text style={{color:palette.orange,fontWeight:"800",fontSize:12,marginBottom:8}}>{post.category} · Self-reported / unverified</Text>
  <Text style={{color:palette.ink,lineHeight:23,fontSize:14,marginBottom:14}}>{post.text}</Text>
  <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
   <Button label={`${likers.includes(uid||"")?"♥ Liked":"♡ Like"} · ${likers.length}`} secondary busy={busy} onPress={()=>tryAction(()=>setPostLike(post.id,likers.includes(uid||"")),"Reaction saved.")}/>
   <Button label={expanded?"Hide comments":"Comments"} secondary onPress={()=>setExpanded(v=>!v)}/>
   {own?<Button label="Delete" secondary busy={busy} onPress={()=>{
     if(typeof window==="undefined"||window.confirm("Delete your public community post?")){
       tryAction(()=>deleteCommunityPost(post),"Post deleted.");
     }
   }}/>:<Button label={flagging?"Hide report":"Report post"} secondary onPress={()=>setFlagging(v=>!v)}/>}
  </View>
  {flagging&&!own?<View style={{marginTop:12}}>
    <Text style={{fontSize:12,color:palette.muted,marginBottom:7}}>Why are you reporting this post?</Text>
    <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
      {["Spam","Harassment","Privacy concern","Misleading or unsafe","Other"].map(reason=>
        <Pressable key={reason} accessibilityRole="button" disabled={busy} onPress={()=>tryAction(()=>flagCommunityPost(post.id,reason),"Report submitted for review.").then(()=>setFlagging(false))}
        style={{backgroundColor:"#FFF0E6",padding:10,borderRadius:10}}>
         <Text style={{color:palette.orange,fontWeight:"700",fontSize:12}}>{reason}</Text>
        </Pressable>)}
    </View>
  </View>:null}
  {expanded?<View style={{borderTopWidth:1,borderColor:palette.border,marginTop:17,paddingTop:12}}>
    <Text style={{fontWeight:"800",color:palette.ink,marginBottom:8}}>Community discussion</Text>
    {comments.length===0?<Text style={{color:palette.muted,marginBottom:12}}>No comments yet. Start a helpful discussion.</Text>:
      comments.map(comment=><View key={comment.id} style={{paddingVertical:9,borderBottomWidth:1,borderColor:palette.border}}>
        <Text style={{fontWeight:"800",color:palette.ink}}>{comment.authorName}{comment.authorUid===uid?" · You":""}</Text>
        <Text style={{color:palette.muted,lineHeight:21,marginTop:4}}>{comment.text}</Text>
        {comment.authorUid===uid?<Pressable accessibilityRole="button" onPress={()=>tryAction(()=>deleteCommunityComment(post.id,comment),"Comment deleted.")}>
          <Text style={{color:palette.orange,fontSize:12,marginTop:6}}>Delete comment</Text></Pressable>:null}
      </View>)}
    <View style={{marginTop:12}}>
      <Field label="Add a respectful comment (3–300 characters)" value={draft} onChangeText={setDraft} placeholder="Share a practical suggestion..."/>
      <Button label="Publish comment" disabled={!draft.trim()} busy={busy} onPress={()=>tryAction(()=>addCommunityComment(post.id,draft),"Comment published.").then(()=>setDraft(""))}/>
    </View>
  </View>:null}
  <View style={{marginTop:error||status?12:0}}><Notice text={error} error/><Notice text={status}/></View>
 </Card>;
}
