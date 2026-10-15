import {auth} from "../firebaseConfig";

export type PhotoReviewResult={decision:"relevant"|"unclear"|"irrelevant";reason:string;notice:string};

/** Sends one locally compressed photo to an opt-in backend for relevance screening.
 * The provider may process the image; it is not written to Nagrik cloud storage.
 * This result is not proof of a completed activity or eligible for monetary rewards.
 */
export async function reviewChallengePhoto(challengeId:string,description:string,image:string):Promise<PhotoReviewResult>{
  const user=auth.currentUser;
  if(!user)throw new Error("Please sign in before checking challenge evidence.");
  const response=await fetch("/api/challenge-photo-review",{
    method:"POST",
    headers:{"Authorization":"Bearer "+await user.getIdToken(),"Content-Type":"application/json"},
    cache:"no-store",
    body:JSON.stringify({challengeId,description,image,consent:true})
  });
  let payload:any={};
  try{payload=await response.json();}catch{}
  if(!response.ok)throw new Error(
    typeof payload.error==="string"?payload.error:"Photo review failed. Please try again later."
  );
  if(!["relevant","unclear","irrelevant"].includes(payload.decision))
    throw new Error("Could not interpret the AI result. Please retry.");
  return {
    decision:payload.decision,
    reason:typeof payload.reason==="string"?payload.reason.slice(0,100):"No reason provided.",
    notice:typeof payload.notice==="string"?payload.notice:"AI screening cannot prove completion."
  };
}
