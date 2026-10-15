/**
 * Optional, non-authoritative AI relevance screening of a compressed challenge photo.
 * OFF BY DEFAULT. Set NAGRIK_PHOTO_AI_ENABLED=true and OPENAI_API_KEY on Vercel
 * after providing notice/consent and configuring shared rate limits + billing caps.
 * Never consider the model decision proof that a civic task actually occurred.
 */
const seen=new Map();
const HOUR=60*60*1000,MAX_PER_HOUR=6;
const FIREBASE_WEB_KEY="AIzaSyCX0Vkq75s7D2ag0oQt_JRf-bjfnhQ_7DM";
const challenges={
  clean:"Safely tidy a shared place without handling hazardous items",
  green:"Water or protect a plant, or join a permitted planting activity",
  recycle:"Sort recyclable waste according to local rules",
  water:"Adopt a water-saving habit or repair a safe minor leak",
  learn:"Read and explain civic guidance",
  help:"Help a neighbor or volunteer safely",
  road:"Document a road-safety improvement without entering traffic",
  energy:"Document a safe energy-saving action",
  access:"Document an accessibility barrier without identifying strangers",
  public:"Safely care for a shared public space"
};
const fail=(res,status,message,code)=>res.status(status).json({error:message,code});
async function requestWithDeadline(url,options,ms){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),ms);
  try{return await fetch(url,{...options,signal:controller.signal});}
  finally{clearTimeout(timer);}
}
module.exports=async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return fail(res,405,"POST required.","METHOD");}
  if(process.env.NAGRIK_PHOTO_AI_ENABLED!=="true"||!process.env.OPENAI_API_KEY)
    return fail(res,503,"Photo screening is not enabled yet. No photo has been sent for review.","NOT_CONFIGURED");
  const auth=String(req.headers.authorization||"");
  if(!auth.startsWith("Bearer "))return fail(res,401,"Sign in before requesting review.","AUTH_REQUIRED");
  const token=auth.slice(7).trim();
  if(token.length<60||token.length>4500)return fail(res,401,"Invalid login token.","AUTH_REQUIRED");
  const body=req.body&&typeof req.body==="object"?req.body:{};
  const challengeId=typeof body.challengeId==="string"?body.challengeId:"";
  const description=typeof body.description==="string"?body.description.trim():"";
  const image=typeof body.image==="string"?body.image:"";
  if(!Object.prototype.hasOwnProperty.call(challenges,challengeId))
    return fail(res,400,"Choose a supported challenge.","INVALID_CHALLENGE");
  if(description.length<12||description.length>500)
    return fail(res,400,"Describe your action in 12–500 characters.","INVALID_DESCRIPTION");
  if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image)||image.length>280000||image.length<1000)
    return fail(res,413,"Use a clear, compressed JPEG under 210 KB.","INVALID_IMAGE");
  if(body.consent!==true)return fail(res,400,"Photo-review consent is required.","CONSENT_REQUIRED");
  try{
    const firebase=await requestWithDeadline(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key="+
      encodeURIComponent(process.env.FIREBASE_WEB_API_KEY||FIREBASE_WEB_KEY),
      {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:token})},8000
    );
    if(!firebase.ok)return fail(res,401,"Your sign-in has expired. Please log in again.","AUTH_EXPIRED");
    const profile=await firebase.json();
    const account=profile.users?.[0];
    if(!account?.localId||account.disabled)return fail(res,401,"Sign in to check your photo.","AUTH_REQUIRED");
    const uid=account.localId,now=Date.now();
    if(seen.size>500)seen.clear();
    const previous=seen.get(uid);
    const entry=previous&&now-previous.at<HOUR?previous:{at:now,count:0};
    if(entry.count>=MAX_PER_HOUR)return fail(res,429,"You have reached the hourly photo-check limit.","RATE_LIMIT");
    entry.count++;seen.set(uid,entry);
    // No app-side cloud photo write. Image is sent directly for inference with store:false.
    // Provider data handling/retention still applies; obtain informed consent in the UI.
    const upstream=await requestWithDeadline("https://api.openai.com/v1/chat/completions",{
      method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.OPENAI_API_KEY},
      body:JSON.stringify({
        model:process.env.NAGRIK_PHOTO_AI_MODEL||"gpt-4o-mini",
        store:false,max_completion_tokens:170,
        response_format:{type:"json_object"},
        messages:[
          {role:"system",content:"You screen photos for relevance to civic challenges. This is only a plausibility screening, NOT proof of a real-world action, identity, time or location. Be conservative: screenshots, memes, obvious stock images, unrelated photos, harmful actions, ambiguous evidence, or images that do not plausibly illustrate the specific action must not be accepted. Don't identify people. Never infer that a task definitely occurred. Reply ONLY as JSON with exactly decision ('relevant', 'unclear', or 'irrelevant') and a brief reason under 100 characters."},
          {role:"user",content:[
            {type:"text",text:"Challenge: "+challenges[challengeId]+". User description: "+description+". Assess whether this single image plausibly matches the challenge, not whether it proves completion."},
            {type:"image_url",image_url:{url:image,detail:"low"}}
          ]}
        ]
      })
    },20000);
    if(!upstream.ok){
      // Never log user photos, descriptions, auth tokens or upstream response bodies.
      return fail(res,upstream.status===429?429:503,
        "Photo screening is temporarily unavailable. Please retry later.","AI_UNAVAILABLE");
    }
    const payload=await upstream.json();
    let verdict;
    try{verdict=JSON.parse(payload.choices?.[0]?.message?.content||"");}
    catch{return fail(res,502,"AI returned an unreadable result. Try another photo.","INVALID_RESULT");}
    const decision=["relevant","unclear","irrelevant"].includes(verdict.decision)?verdict.decision:"unclear";
    const reason=typeof verdict.reason==="string"?verdict.reason.slice(0,100):"The image needs another review.";
    return res.status(200).json({decision,reason,
      notice:"AI only screened photo relevance. It cannot confirm the activity happened or award real-world benefits."});
  }catch{
    return fail(res,503,"Photo screening could not connect. Please try again.","NETWORK");
  }
};
