const assert=require("node:assert/strict");
const handler=require("../api/civic-assistant.js");

function response(){
 return {statusCode:200,headers:{},body:null,
  setHeader(k,v){this.headers[k]=v;return this},
  status(n){this.statusCode=n;return this},
  json(obj){this.body=obj;return this}
 };
}
const token="x".repeat(100);
function request(question="How can I help my city?"){
 return {method:"POST",headers:{authorization:"Bearer "+token},body:{message:question,history:[]}};
}
async function run(){
 const oldKey=process.env.OPENAI_API_KEY;
 const originalFetch=global.fetch;
 const originalWarn=console.warn;
 const logEvents=[];
 try{
  delete process.env.OPENAI_API_KEY;
  let r=response();
  await handler(request(),r);
  assert.equal(r.statusCode,503);
  assert.equal(r.body.code,"AI_NOT_CONFIGURED");

  process.env.OPENAI_API_KEY="test-only";
  r=response();
  await handler({method:"POST",headers:{},body:{message:"how to help my city"}},r);
  assert.equal(r.statusCode,401);
  r=response();
  await handler(request("x".repeat(601)),r);
  assert.equal(r.statusCode,400);
  r=response();
  await handler({method:"GET",headers:{},body:{}},r);
  assert.equal(r.statusCode,405);

  let providerResponse={status:200,body:{choices:[{message:{content:"Organize a safe, voluntary neighborhood cleanup with local permission."}}]}};
  global.fetch=async(url,options)=>{
   if(url.includes("identitytoolkit.googleapis.com"))
     return {ok:true,status:200,json:async()=>({users:[{localId:"test-account",email:"test@example.invalid"}]})};
   if(url.includes("api.openai.com"))
     return {ok:providerResponse.status>=200&&providerResponse.status<300,
       status:providerResponse.status,json:async()=>providerResponse.body};
   throw Error("Unexpected remote request");
  };
  console.warn=(...args)=>logEvents.push(args);

  r=response();
  await handler(request("What can I do about litter?"),r);
  assert.equal(r.statusCode,200);
  assert.match(r.body.reply,/neighborhood cleanup/);

  const testError=async(upstreamCode,upstreamType,expectedStatus,expectedCode)=>{
   providerResponse={status:429,body:{error:{
     code:upstreamCode,type:upstreamType,message:"Sensitive upstream information should never go to the browser."}
   }};
   const result=response();
   await handler(request("What are responsible civic reporting steps?"),result);
   assert.equal(result.statusCode,expectedStatus);
   assert.equal(result.body.code,expectedCode);
   assert.doesNotMatch(result.body.error,/Sensitive upstream/);
  };
  await testError("insufficient_quota","insufficient_quota",503,"AI_QUOTA_EXHAUSTED");
  await testError("credit_balance_exhausted","insufficient_quota",503,"AI_QUOTA_EXHAUSTED");
  await testError("project_spend_limit_exceeded","insufficient_quota",503,"AI_QUOTA_EXHAUSTED");
  await testError("rate_limit_exceeded","rate_limit_exceeded",429,"AI_RATE_LIMITED");

  providerResponse={status:401,body:{error:{code:"invalid_api_key",type:"invalid_request_error"}}};
  r=response();await handler(request(),r);
  assert.equal(r.statusCode,503);
  assert.equal(r.body.code,"AI_PROVIDER_AUTH");

  assert.ok(logEvents.length>=5);
  assert.ok(logEvents.every(event=>!JSON.stringify(event).includes("test-only")));
  assert.ok(logEvents.every(event=>!JSON.stringify(event).includes(token)));
  console.log("Civic AI: success, auth, quota, rate limiting and provider failures validated.");
 }finally{
  global.fetch=originalFetch;
  console.warn=originalWarn;
  if(oldKey===undefined)delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=oldKey;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
