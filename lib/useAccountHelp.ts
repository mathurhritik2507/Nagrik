import { useCallback, useEffect, useState } from "react";
import {
  EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential,
  updatePassword, verifyBeforeUpdateEmail,
  type User,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

/** Firebase does not expose whether an email was delivered to an inbox. */
export function explainAccountError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (!code && error instanceof Error) return error.message;
  const map: Record<string,string> = {
    "auth/too-many-requests": "Firebase is temporarily limiting requests. Wait before trying again.",
    "auth/network-request-failed": "Cannot contact Firebase. Check your connection.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/unauthorized-domain": "This website needs to be allowed in Firebase Authentication authorized domains.",
    "auth/operation-not-allowed": "This sign-in method is disabled in Firebase Authentication.",
    "auth/requires-recent-login": "Please sign out and sign back in to confirm this sensitive change.",
    "auth/wrong-password": "The current password is not correct.",
    "auth/invalid-credential": "The current password is incorrect, or this account needs to be signed in again.",
    "auth/weak-password": "Choose a stronger password of at least 8 characters.",
    "auth/user-token-expired": "Your session has expired. Sign in again.",
    "auth/invalid-user-token": "Your session has expired. Sign in again.",
    "auth/user-disabled": "This account is disabled. Contact the application owner.",
    "auth/email-already-in-use": "That email address is associated with another account. Try signing in to it instead.",
    "auth/unsupported-first-factor": "This account cannot use password authentication for this operation.",
    "auth/provider-already-linked": "This sign-in method is already connected.",
  };
  return (map[code || ""] || "Firebase could not complete this request.") + " (" + (code || "unknown") + ")";
}

export function useAccountHelp() {
  const [user,setUser] = useState<User | null>(auth.currentUser);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [info,setInfo] = useState("");
  useEffect(() => onAuthStateChanged(auth, u => {setUser(u);setLoading(false);}), []);

  const run = useCallback(async (action:() => Promise<string>) => {
    setBusy(true);setError("");setInfo("");
    try{setInfo(await action());}
    catch(e){setError(explainAccountError(e));}
    finally{setBusy(false);}
  },[]);

  const changePassword = (currentPassword:string,newPassword:string,confirmPassword:string) => run(async()=>{
    const u=auth.currentUser;
    if(!u||!u.email)throw Object.assign(new Error("Sign in first"),{code:"auth/invalid-user-token"});
    if(!currentPassword||newPassword.length<8||newPassword!==confirmPassword) {
      throw new Error("Enter your current password and matching new passwords of at least 8 characters.");
    }
    await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,currentPassword));
    await updatePassword(u,newPassword);
    return "Your password was changed successfully. You can now sign in with the new password without waiting for an email.";
  });

  const changeEmail = (currentPassword:string,newEmail:string) => run(async()=>{
    const u=auth.currentUser;
    if(!u||!u.email)throw Object.assign(new Error("Sign in first"),{code:"auth/invalid-user-token"});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim()))throw new Error("Enter a valid new email address.");
    if(newEmail.trim().toLowerCase()===u.email.toLowerCase())throw new Error("That is already your sign-in email.");
    if(!currentPassword)throw new Error("Enter your current password to request an email change.");
    await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,currentPassword));
    await verifyBeforeUpdateEmail(u,newEmail.trim());
    return "Firebase accepted the email-change request. Open the confirmation link sent to the NEW email address. Your sign-in address will not change until that link is confirmed.";
  });

  return {user,loading,busy,error,info,changePassword,changeEmail,clear:()=>{setError("");setInfo("");}};
}
