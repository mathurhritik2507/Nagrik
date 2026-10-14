import React,{useState} from "react";
import {Text,View} from "react-native";
import {router} from "expo-router";
import {signOut} from "firebase/auth";
import {auth} from "../firebaseConfig";
import {useAccountHelp} from "../lib/useAccountHelp";
import {Button,Card,Field,Heading,Notice,Shell,palette} from "../components/web/Kit";

export default function AccountHelpWeb(){
 const {user,loading,busy,error,info,changePassword,changeEmail,clear}=useAccountHelp();
 const [currentPassword,setCurrentPassword]=useState("");
 const [newPassword,setNewPassword]=useState("");
 const [confirmPassword,setConfirmPassword]=useState("");
 const [nextEmail,setNextEmail]=useState("");
 const [newEmailPassword,setNewEmailPassword]=useState("");
 const [passwordOpen,setPasswordOpen]=useState(false);
 const [emailOpen,setEmailOpen]=useState(false);
 if(loading)return <Shell title="Account help" subtitle="Checking Firebase Authentication…"><Card><Text>Loading account…</Text></Card></Shell>;
 if(!user)return <Shell title="Account help" subtitle="Sign in to view your verified account details.">
   <Card><Text style={{color:palette.muted,marginBottom:16}}>For a forgotten password, use the email reset form. If you are already signed in, you can change your password without email delivery.</Text>
    <Button label="Sign in" onPress={()=>router.replace("/login")}/>
    <View style={{marginTop:12}}><Button label="Forgot password?" secondary onPress={()=>router.push("/forgot-password")}/></View>
   </Card>
 </Shell>;
 const changeNow=async()=>{
   await changePassword(currentPassword,newPassword,confirmPassword);
   // Credential fields should not be retained once submitted, regardless of result.
   setCurrentPassword("");setNewPassword("");setConfirmPassword("");
 };
 const updateEmail=async()=>{
   await changeEmail(newEmailPassword,nextEmail);
   setNewEmailPassword("");setNextEmail("");
 };
 return <Shell title="Account & email help" subtitle="Check your Firebase sign-in address and manage your password or account details." eyebrow="ACCOUNT / SECURITY">
   <Card>
     <Heading>Your actual sign-in account</Heading>
     <Text selectable style={{fontSize:17,fontWeight:"900",color:palette.ink,marginBottom:9}}>{user.email||"No email address found"}</Text>
     <Text style={{fontSize:13,color:palette.muted,marginBottom:12}}>This is your actual Firebase sign-in and password recovery address.</Text>
     <Text style={{color:palette.muted,fontSize:13,lineHeight:21,marginBottom:13}}>Email verification is not required to use Nagrik or share a community contribution during beta. Keep access to this address for password recovery.</Text>
     <View style={{marginTop:12}}><Button label="Switch to a different Nagrik account" secondary onPress={async()=>{await signOut(auth);router.replace("/login");}}/></View>
   </Card>
   <Notice text={error} error/><Notice text={info}/>
   <Card>
     <Heading>Change password without an email</Heading>
     <Text style={{color:palette.muted,marginBottom:15,lineHeight:21}}>If you are signed in and know your existing password, change it immediately without waiting for a password-reset email.</Text>
     {!passwordOpen?<Button label="Change my password" secondary onPress={()=>{clear();setPasswordOpen(true);}}/>:<>
       <Field label="Current password" secure value={currentPassword} onChangeText={setCurrentPassword}/>
       <Field label="New password (8+ characters)" secure value={newPassword} onChangeText={setNewPassword}/>
       <Field label="Confirm new password" secure value={confirmPassword} onChangeText={setConfirmPassword}/>
       <View style={{flexDirection:"row",gap:10,flexWrap:"wrap"}}>
         <Button label="Save new password" busy={busy} onPress={changeNow}/>
         <Button label="Cancel" secondary onPress={()=>{setCurrentPassword("");setNewPassword("");setConfirmPassword("");setPasswordOpen(false);}}/>
       </View>
     </>}
   </Card>
   <Card>
     <Heading>Wrong email address?</Heading>
     <Text style={{color:palette.muted,marginBottom:15,lineHeight:21}}>If the address shown above is incorrect, you can request a secure change to an email address you control. Firebase must deliver a confirmation to the new inbox before changing your sign-in address.</Text>
     {!emailOpen?<Button label="Request an email address change" secondary onPress={()=>{clear();setEmailOpen(true);}}/>:<>
       <Field label="New email address" value={nextEmail} onChangeText={setNextEmail} placeholder="your-new-email@example.com"/>
       <Field label="Current password" secure value={newEmailPassword} onChangeText={setNewEmailPassword}/>
       <View style={{flexDirection:"row",gap:10,flexWrap:"wrap"}}>
         <Button label="Request email change" busy={busy} onPress={updateEmail}/>
         <Button label="Cancel" secondary onPress={()=>{setNewEmailPassword("");setNextEmail("");setEmailOpen(false);}}/>
       </View>
     </>}
   </Card>
   <Card>
     <Heading>Forgot your current password?</Heading>
     <Text style={{color:palette.muted,marginBottom:15,lineHeight:21}}>Use Firebase password-reset email. If emails aren't arriving and you cannot authenticate with your current password, an administrator will need to help restore the account; this app cannot safely bypass Firebase verification.</Text>
     <Button label="Open password reset" secondary onPress={()=>router.push("/forgot-password")}/>
   </Card>
 </Shell>;
}
