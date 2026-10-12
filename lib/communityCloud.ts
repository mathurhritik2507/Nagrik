/**
 * Nagrik community beta: Firebase Firestore shared text posts.
 *
 * This is separate from browser-private issue reports, photo proofs, and XP.
 * Publishing requires a verified email and explicit user action.
 * Rankings measure self-reported public contributions, NOT verified impact.
 */
import { auth, db } from "../firebaseConfig";
import {
  addDoc, collection, deleteDoc, doc, getDoc, limit,
  onSnapshot, orderBy, query, serverTimestamp, setDoc,
  type Unsubscribe,
} from "firebase/firestore";

export type CommunityPost = {
  id:string;
  authorUid:string;
  authorName:string;
  city:string;
  category:string;
  text:string;
  createdAt?:{seconds:number};
  moderation:"unverified";
  syncState?:"pending"|"cached"|"confirmed";
};
export type CommunityComment = {
  id:string;
  authorUid:string;
  authorName:string;
  text:string;
  createdAt?:{seconds:number};
};
export const categories = ["Cleanliness","Environment","Accessibility","Volunteering","Community","Civic learning","Other"];
const names=(value:string,max=60)=>value.replace(/[<>]/g,"").trim().replace(/\s+/g," ").slice(0,max);
const currentUser=()=>{const u=auth.currentUser;if(!u)throw new Error("Please sign in.");return u;};
const requireEmail=()=>{const u=currentUser();if(!u.emailVerified)throw new Error("Verify your email address before publishing publicly.");return u;};
const cleanText=(input:string,min:number,max:number,what:string)=>{
  const v=input.trim().replace(/[\u0000-\u001f\u007f]/g," ");
  if(v.length<min||v.length>max)throw new Error(`${what} must be ${min}–${max} characters.`);
  return v;
};
export async function publishCommunityPost(input:{text:string;city:string;category:string}){
  const u=requireEmail();
  if(!categories.includes(input.category))throw new Error("Choose a valid category.");
  const text=cleanText(input.text,20,650,"Post");
  const city=cleanText(input.city,2,65,"City");
  await addDoc(collection(db,"communityPosts"),{
    authorUid:u.uid,
    authorName:names(u.displayName||"Nagrik member"),
    city:names(city,65),
    category:input.category,
    text,
    createdAt:serverTimestamp(),
    moderation:"unverified",
  });
}
export function subscribeCommunityPosts(onData:(items:CommunityPost[])=>void,onError:(message:string)=>void,max=40):Unsubscribe{
  // Firestore applies local writes optimistically. Include metadata changes so
  // the feed can distinguish pending, cached and server-confirmed documents.
  return onSnapshot(query(collection(db,"communityPosts"),orderBy("createdAt","desc"),limit(max)),
    {includeMetadataChanges:true},
    snap=>onData(snap.docs.map(d=>({
      id:d.id,
      ...d.data(),
      syncState:d.metadata.hasPendingWrites?"pending":snap.metadata.fromCache?"cached":"confirmed",
    } as CommunityPost))),
    err=>onError(err.code==="permission-denied"?
      "Firestore denied feed access. Check email verification, authentication and the published security rules.":"Unable to load the community feed: "+(err.code||err.message)));
}
export async function deleteCommunityPost(item:CommunityPost){
  const u=currentUser();
  if(item.authorUid!==u.uid)throw new Error("You may only delete your own post.");
  await deleteDoc(doc(db,"communityPosts",item.id));
}
export async function setPostLike(postId:string,liked:boolean){
  const u=requireEmail();
  const ref=doc(db,"communityPosts",postId,"likes",u.uid);
  if(liked)await deleteDoc(ref);
  else await setDoc(ref,{uid:u.uid,createdAt:serverTimestamp()});
}
export function subscribeLikes(postId:string,onData:(uids:string[])=>void,onError?:(s:string)=>void):Unsubscribe{
  return onSnapshot(collection(db,"communityPosts",postId,"likes"),
    snap=>onData(snap.docs.map(x=>x.id)),
    err=>onError?.("Could not load reactions: "+err.message));
}
export async function addCommunityComment(postId:string,input:string){
  const u=requireEmail();
  await addDoc(collection(db,"communityPosts",postId,"comments"),{
    authorUid:u.uid,
    authorName:names(u.displayName||"Nagrik member"),
    text:cleanText(input,3,300,"Comment"),
    createdAt:serverTimestamp(),
  });
}
export function subscribeComments(postId:string,onData:(items:CommunityComment[])=>void,onError:(s:string)=>void):Unsubscribe{
  return onSnapshot(query(collection(db,"communityPosts",postId,"comments"),orderBy("createdAt","desc"),limit(30)),
    snap=>onData(snap.docs.map(d=>({id:d.id,...d.data()} as CommunityComment))),
    err=>onError("Comments unavailable: "+err.message));
}
export async function deleteCommunityComment(postId:string,comment:CommunityComment){
  const u=currentUser();
  if(comment.authorUid!==u.uid)throw new Error("Only your own comment can be removed.");
  await deleteDoc(doc(db,"communityPosts",postId,"comments",comment.id));
}
export async function flagCommunityPost(postId:string,reason:string){
  const u=currentUser();
  if(!["Spam","Harassment","Privacy concern","Misleading or unsafe","Other"].includes(reason))throw new Error("Choose a reporting reason.");
  await setDoc(doc(db,"communityFlags",postId+"_"+u.uid),{
    postId,reporterUid:u.uid,reason,createdAt:serverTimestamp(),status:"pending",
  });
}
export function communityRanking(posts:CommunityPost[],now=new Date()){
  const weekStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
  weekStart.setUTCDate(weekStart.getUTCDate()-((weekStart.getUTCDay()+6)%7));
  const scores=new Map<string,{uid:string;name:string;city:string;count:number}>();
  for(const post of posts){
    if(post.syncState==="pending"||post.syncState==="cached")continue;
    if(!post.createdAt||post.createdAt.seconds*1000<weekStart.getTime())continue;
    const v=scores.get(post.authorUid)||{uid:post.authorUid,name:post.authorName,city:post.city,count:0};
    v.count+=1;
    scores.set(post.authorUid,v);
  }
  return [...scores.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
}
