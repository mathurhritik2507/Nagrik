/**
 * Nagrik community beta: Firebase Firestore shared text posts.
 *
 * This is separate from browser-private issue reports, photo proofs, and XP.
 * Publishing requires a verified email and explicit user action.
 * Rankings measure self-reported public contributions, NOT verified impact.
 */
import { auth, db } from "../firebaseConfig";
import { NAGRIK_FIRESTORE_DATABASE_ID } from "../config/firestoreDatabase";
import {
  addDoc, collection, deleteDoc, doc, getDocFromServer, getDocsFromServer, limit,
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
// Using a stable document ID for an identical submission on the same UTC day
// reduces accidental duplicate posts after retries/refreshes. This is not an
// anti-spam replacement for server-side controls or moderator review.
export function communitySubmissionId(userId:string,category:string,city:string,text:string,utcDay:string):string{
  const normalized=[userId,utcDay,category,city.trim().toLowerCase(),text.trim().toLowerCase()].join("\\u001f");
  let a=2166136261,b=3339675911;
  for(let i=0;i<normalized.length;i++){
    const n=normalized.charCodeAt(i);
    a=Math.imul(a^n,16777619)>>>0;
    b=Math.imul(b^(n+i),2246822519)>>>0;
  }
  return "p_"+a.toString(36).padStart(7,"0")+b.toString(36).padStart(7,"0");
}

export async function publishCommunityPost(input:{text:string;city:string;category:string}):Promise<"posted"|"already-posted">{
  const u=requireEmail();
  if(!categories.includes(input.category))throw new Error("Choose a valid category.");
  const text=cleanText(input.text,20,650,"Post");
  const city=cleanText(input.city,2,65,"City");
  const id=communitySubmissionId(u.uid,input.category,city,text,new Date().toISOString().slice(0,10));
  const ref=doc(db,"communityPosts",id);
  // A server-only preflight prevents a cached/pending post from looking like
  // a successful write and makes same-content retries idempotent.
  const existing=await getDocFromServer(ref);
  if(existing.exists()){
    if(existing.data().authorUid===u.uid && existing.data().text===text)return "already-posted";
    throw new Error("A conflicting post ID already exists. Try again with different wording.");
  }
  await setDoc(ref,{
    authorUid:u.uid,
    authorName:names(u.displayName||"Nagrik member"),
    city:names(city,65),
    category:input.category,
    text,
    createdAt:serverTimestamp(),
    moderation:"unverified",
  });
  return "posted";
}
export type CommunityConnectionStatus =
  | {kind:"connected";message:string}
  | {kind:"unauthenticated"|"permission-denied"|"timeout"|"offline"|"error";message:string};

/** Check the server, not just locally cached documents. */
export async function checkCommunityConnection(timeoutMs=12000):Promise<CommunityConnectionStatus>{
  const u=auth.currentUser;
  if(!u)return {kind:"unauthenticated",message:"Sign in to test the community database."};
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
    await u.getIdToken();
    const read=getDocsFromServer(query(collection(db,"communityPosts"),limit(1)));
    await Promise.race([read,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error("check-timed-out")),timeoutMs);})]);
    return {kind:"connected",message:"Firestore server reachable. Community posts can be read."};
  }catch(e:any){
    const code=e?.code||"unknown";
    if(e?.message==="check-timed-out")return {kind:"timeout",message:"Firestore server did not respond within "+Math.round(timeoutMs/1000)+" seconds. Try disabling VPN, ad-blockers or browser privacy extensions and allow firestore.googleapis.com."};
    if(code==="permission-denied")return {kind:"permission-denied",message:"Firestore denied the server read. Check signed-in status and published community security rules."};
    if(code==="unavailable"||code==="deadline-exceeded")return {kind:"offline",message:"Firestore is unreachable. Check your internet connection or browser/network restrictions."};
    return {kind:"error",message:"Firestore request failed ("+code+"). Inspect the browser Network panel for firestore.googleapis.com."};
  }finally{if(timer)clearTimeout(timer);}
}

/**
 * Independent HTTPS diagnostic: Firestore REST does not use the SDK WebChannel
 * streaming transport. Uses the CURRENT Firebase user's ID token, so Firestore
 * Security Rules still apply. Never show/log the token or response body.
 */
/** Independent authenticated HTTPS query to the SAME named database as the SDK.
 * Do not probe "(default)": it is a different, absent database in Nagrik and
 * must not be presented as a failure when the configured database works.
 */
export async function checkCommunityRestConnection(timeoutMs=12000):Promise<CommunityConnectionStatus>{
  const user=auth.currentUser;
  if(!user)return {kind:"unauthenticated",message:"Sign in to test Firestore HTTPS access."};
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const projectId=db.app.options.projectId;
    if(!projectId)return {kind:"error",message:"Firebase project ID is missing from web configuration."};
    const token=await user.getIdToken();
    if(controller.signal.aborted)return {kind:"timeout",message:"Firebase token retrieval timed out."};
    const databaseId=NAGRIK_FIRESTORE_DATABASE_ID;
    const url="https://firestore.googleapis.com/v1/projects/"+
      encodeURIComponent(projectId)+"/databases/"+
      encodeURIComponent(databaseId)+"/documents:runQuery";
    const response=await fetch(url,{
      method:"POST",
      headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({structuredQuery:{from:[{collectionId:"communityPosts"}],limit:1}}),
      cache:"no-store",
      signal:controller.signal,
    });
    if(response.ok)return {
      kind:"connected",
      message:"Firestore HTTPS connected to database '"+databaseId+"' (HTTP "+
        response.status+"). Read access confirmed, including when the feed is empty.",
    };
    let status="UNKNOWN";
    // Only disclose standard error status: never expose credentials or response contents.
    try{
      const json=await response.json();
      if(typeof json?.error?.status==="string")status=json.error.status.slice(0,45);
    }catch{}
    if(response.status===401||response.status===403)return {
      kind:"permission-denied",
      message:"Firestore HTTPS access denied for database '"+databaseId+
        "' (HTTP "+response.status+", "+status+"). Review sign-in and database security rules.",
    };
    if(response.status===404)return {
      kind:"error",
      message:"Firestore HTTPS database '"+databaseId+"' returned HTTP 404 ("+status+
        "). Confirm this named database exists and is accessible for the deployed Firebase project.",
    };
    if(response.status===429)return {
      kind:"error",message:"Firestore HTTPS was rate limited (HTTP 429). Retry later.",
    };
    return {kind:"error",message:"Firestore HTTPS database '"+databaseId+
      "' returned HTTP "+response.status+" ("+status+")."};
  }catch(e:any){
    if(e?.name==="AbortError")return {
      kind:"timeout",message:"Firestore HTTPS query timed out. Check the browser network, VPN and extensions.",
    };
    return {kind:"offline",message:"Firestore HTTPS request failed. Check browser access to firestore.googleapis.com."};
  }finally{clearTimeout(timer);}
}

export function communitySyncState(hasPendingWrites:boolean,fromCache:boolean):NonNullable<CommunityPost["syncState"]>{
  if(hasPendingWrites)return "pending";
  return fromCache?"cached":"confirmed";
}

export function subscribeCommunityPosts(onData:(items:CommunityPost[])=>void,onError:(message:string)=>void,max=40):Unsubscribe{
  // Firestore applies local writes optimistically. Include metadata changes so
  // the feed can distinguish pending, cached and server-confirmed documents.
  return onSnapshot(query(collection(db,"communityPosts"),orderBy("createdAt","desc"),limit(max)),
    {includeMetadataChanges:true},
    snap=>onData(snap.docs.map(d=>({
      id:d.id,
      ...d.data(),
      syncState:communitySyncState(d.metadata.hasPendingWrites,snap.metadata.fromCache),
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
