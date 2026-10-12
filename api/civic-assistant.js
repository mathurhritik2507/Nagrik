/**
 * Authenticated Nagrik Civic AI backend for Vercel.
 *
 * Configure OPENAI_API_KEY in Vercel Project > Settings > Environment Variables.
 * Never put the API key in source code, EXPO_PUBLIC_* values or the browser.
 * Rate limits below are best-effort per warm serverless instance; configure a
 * shared rate limiter and provider budget before promoting to large public traffic.
 */
const attempts = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const FIREBASE_PUBLIC_WEB_KEY = "AIzaSyCX0Vkq75s7D2ag0oQt_JRf-bjfnhQ_7DM";

function reply(res,status,message,code){
 return res.status(status).json(code?{error:message,code}:{error:message});
}

/** Distinguish provider credit/spend exhaustion from a temporary 429 rate limit.
 * Only return stable error labels to the browser, never the provider error body.
 */
function classifyProviderError(status,raw){
 const error=raw&&typeof raw==="object"&&raw.error&&typeof raw.error==="object"?raw.error:{};
 const code=typeof error.code==="string"?error.code:"";
 const type=typeof error.type==="string"?error.type:"";
 const quotaCodes=new Set([
   "insufficient_quota","credit_balance_exhausted",
   "organization_usage_limit_exceeded","organization_spend_limit_exceeded",
   "project_spend_limit_exceeded","billing_hard_limit_reached",
 ]);
 if(status===429){
   if(quotaCodes.has(code)||quotaCodes.has(type))return {
     httpStatus:503,code:"AI_QUOTA_EXHAUSTED",
     message:"Nagrik Civic AI is temporarily unavailable because its API credit or spending limit has been reached. The app owner must check API billing."
   };
   return {httpStatus:429,code:"AI_RATE_LIMITED",
     message:"Nagrik Civic AI has hit a temporary API rate limit. Please wait a minute before trying again."};
 }
 if(status===401||status===403)return {httpStatus:503,code:"AI_PROVIDER_AUTH",
   message:"The Civic AI provider configuration needs attention from the Nagrik owner."};
 if(status===404||status===400)return {httpStatus:503,code:"AI_PROVIDER_CONFIGURATION",
   message:"The Civic AI model or provider configuration needs attention from the Nagrik owner."};
 return {httpStatus:502,code:"AI_PROVIDER_UNAVAILABLE",
   message:"The AI provider is unavailable right now. Please try again later."};
}
function normalizeHistory(raw){
 if(!Array.isArray(raw))return [];
 return raw.slice(-6).filter(m=>m&&["user","assistant"].includes(m.role)&&typeof m.content==="string")
   .map(m=>({role:m.role,content:m.content.slice(0,500)}));
}
async function fetchWithDeadline(url,options,ms=15000){
 const abort=new AbortController();
 const timer=setTimeout(()=>abort.abort(),ms);
 try{return await fetch(url,{...options,signal:abort.signal});}finally{clearTimeout(timer);}
}

module.exports = async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 res.setHeader("X-Content-Type-Options","nosniff");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return reply(res,405,"Only POST requests are supported.");}
 if(!process.env.OPENAI_API_KEY){
   return reply(res,503,"AI civic assistant is not configured yet. The owner must add OPENAI_API_KEY to Vercel.","AI_NOT_CONFIGURED");
 }
 const authorization=String(req.headers.authorization||"");
 if(!authorization.startsWith("Bearer "))return reply(res,401,"Sign in to use the civic assistant.");
 const token=authorization.slice(7).trim();
 if(token.length<60||token.length>4500)return reply(res,401,"Invalid sign-in token.");
 const body=req.body&&typeof req.body==="object"?req.body:{};
 const message=typeof body.message==="string"?body.message.trim():"";
 if(message.length<2||message.length>600)return reply(res,400,"Write a civic question between 2 and 600 characters.");
 const history=normalizeHistory(body.history);
 try {
   const firebase=await fetchWithDeadline(
     "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key="+encodeURIComponent(process.env.FIREBASE_WEB_API_KEY||FIREBASE_PUBLIC_WEB_KEY),
     {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:token})},8000
   );
   if(!firebase.ok)return reply(res,401,"Your login has expired. Sign in again.");
   const account=await firebase.json();
   const user=account.users&&account.users[0];
   if(!user||!user.localId||user.disabled)return reply(res,401,"Sign in to use the civic assistant.");
   const uid=user.localId;
   const now=Date.now();
   if(attempts.size>500)attempts.clear();
   const previous=attempts.get(uid);
   const entry=previous&&now-previous.since<WINDOW_MS?previous:{since:now,count:0};
   if(entry.count>=MAX_PER_WINDOW)return reply(res,429,"You've reached the hourly demo limit. Please come back later.");
   entry.count++;
   attempts.set(uid,entry);
   const messages=[
     {role:"system",content:`You are Nagrik Civic AI, a practical and respectful civic-literacy assistant.
Answer ANY relevant civic question naturally, including waste, air/water pollution, sanitation, roads, accessibility, urban planning, community organizing, volunteering, local administration, civic education, sustainable habits, public services, resident communication, citizen rights and general reporting.
Be helpful in English or Hindi according to the user's language. Give concrete, safe, actionable steps.
Do not claim to have submitted reports, verified claims, accessed local live data, consulted authorities, or made a real-world intervention. If a user asks about city-specific laws, tell them to confirm through official local sources; never invent a number, address, rule or contact.
Clarify that Nagrik currently saves actions, issue reports and challenge submissions in the user's browser only. Nagrik is NOT an official municipality grievance or emergency service.
Weekly reward crates in the beta award demonstration digital badges after three distinct challenge submissions during the UTC week; proof is unverified and no real voucher or money is offered.
For immediate threats, suggest contacting local emergency services directly. Do not encourage unsafe cleanup, trespassing, harassment, photographing uninvolved people, or exposing private data.
For unrelated requests, politely steer back to civic topics. Keep answers concise (usually under 180 words), specific and clear.`},
     ...history,
     {role:"user",content:message}
   ];
   const result=await fetchWithDeadline("https://api.openai.com/v1/chat/completions",{
     method:"POST",
     headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
     body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",messages,max_completion_tokens:420,store:false})
   },18000);
   if(!result.ok){
     let providerError={};
     try{providerError=await result.json();}catch{}
     const category=classifyProviderError(result.status,providerError);
     // Log only non-sensitive diagnostics: never API keys, bearer tokens,
     // user prompts or unfiltered upstream messages.
     const p=providerError?.error||{};
     const upstreamCode=typeof p.code==="string"?p.code.slice(0,70):"unknown";
     const upstreamType=typeof p.type==="string"?p.type.slice(0,70):"unknown";
     console.warn("nagrik_civic_ai_upstream_error",{
       httpStatus:result.status,category:category.code,
       upstreamCode,upstreamType,
     });
     return reply(res,category.httpStatus,category.message,category.code);
   }
   const payload=await result.json();
   const answer=payload.choices?.[0]?.message?.content;
   if(typeof answer!=="string"||!answer.trim())return reply(res,502,"The AI did not return an answer. Please try again.");
   return res.status(200).json({reply:answer.trim().slice(0,2400),poweredBy:"AI",disclaimer:"General civic guidance only; verify local rules with official sources."});
 }catch(e){
   return reply(res,502,"The civic assistant could not reach its services. Please try again shortly.");
 }
};
