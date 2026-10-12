import React,{useEffect,useState} from "react";
import {Text,View} from "react-native";
import {router} from "expo-router";
import {signOut} from "firebase/auth";
import {auth} from "../../firebaseConfig";
import {useCivicData} from "../../lib/webCivicStore";
import {Shell,Hero,Card,Field,Heading,Button,Notice,Metric,palette} from "../../components/web/Kit";

export default function WebProfile(){
 const {data,saveProfile,points,clearLocalRecords,downloadRecords}=useCivicData();
 const user=auth.currentUser;
 const [city,setCity]=useState(data.profile.city);
 const [bio,setBio]=useState(data.profile.bio);
 const [message,setMessage]=useState("");const [error,setError]=useState(false);
 const [loggingOut,setLoggingOut]=useState(false);
 useEffect(()=>{setCity(data.profile.city);setBio(data.profile.bio);},[data.profile.city,data.profile.bio]);
 const save=()=>{try{saveProfile({city,bio});setError(false);setMessage("Profile saved in this browser. Other devices will not see these edits.");}
 catch(e:any){setError(true);setMessage(e.message||"Could not save profile.");}};
 const logout=async()=>{try{setLoggingOut(true);await signOut(auth);router.replace("/login");}
 catch(e:any){setError(true);setMessage("Could not log out: "+(e.message||"Unknown error"));}
 finally{setLoggingOut(false);}};
 return <Shell title="Your civic profile" subtitle="Your participation at a glance, based only on what you record in this browser." eyebrow="ACCOUNT / PROFILE">
   <Hero kicker="MY CIVIC PROFILE" title={user?.displayName||"Nagrik member"} description={user?.email||"Signed-in account"}>
     <Text style={{color:"#D3E2F0",marginTop:12}}>{data.profile.city} · Beta participant</Text>
   </Hero>
   <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:8}}>
     <Metric label="Practice XP" value={points}/>
     <Metric label="Civic actions" value={data.actions.length}/>
     <Metric label="Saved reports" value={data.reports.length}/>
     <Metric label="Unverified proofs" value={data.proofs.length}/>
   </View>
   <Card>
     <Heading muted="Your profile details remain on this device for now.">Edit profile</Heading>
     <Field label="City" value={city} onChangeText={setCity} placeholder="Your city"/>
     <Field label="Short bio" value={bio} onChangeText={setBio} multiline placeholder="What inspires your interest in civic action?"/>
     <Notice text={message} error={error}/>
     <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
       <Button label="Save profile" onPress={save}/>
       <Button label="Sign out" secondary busy={loggingOut} onPress={logout}/>
     </View>
   </Card>
   <Card>
     <Heading>Manage your local data</Heading>
     <Text style={{color:palette.muted,lineHeight:21,marginBottom:13}}>Back up your records or erase them from this browser. Clearing the data cannot be undone.</Text>
     <View style={{flexDirection:"row",gap:10,flexWrap:"wrap"}}>
       <Button label="Export my records (JSON)" secondary onPress={downloadRecords}/>
       <Button label="Delete all local records" secondary onPress={()=>{
         if(window.confirm("Delete all locally saved actions, reports, proofs and profile details? This cannot be undone.")){
           clearLocalRecords();setMessage("All Nagrik beta records were erased from this browser.");setError(false);
         }
       }}/>
     </View>
   </Card>
   <Card>
     <Heading>How your data works</Heading>
     <Text style={{color:palette.muted,lineHeight:22}}>Firebase secures your login. In this prototype, actions, reports, challenge proof and local profile settings are saved to browser storage for your account, not Firestore. They are not public, not reviewed by an authority, and not synced to other devices.</Text>
   </Card>
 </Shell>;
}
