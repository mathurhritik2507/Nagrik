const assert=require("node:assert/strict");
const handler=require("../api/challenge-photo-review.js");

const originalFetch=global.fetch;
const env={...process.env};
function response(){
  return {
    statusCode:200,
    headers:{},
    setHeader(key,value){this.headers[key]=value;},
    status(code){this.statusCode=code;return this;},
    json(body){this.body=body;return this;}
  };
}
async function invoke(body,token){
  const res=response();
  await handler({method:"POST",headers:token?{authorization:"Bearer "+token}:{},body},res);
  return res;
}
(async()=>{
  const token="a".repeat(120);
  const body={challengeId:"clean",description:"I cleaned a safe shared park area.",
    image:"data:image/jpeg;base64,"+"A".repeat(1200),consent:true};
  process.env.NAGRIK_PHOTO_AI_ENABLED="false";
  process.env.OPENAI_API_KEY="unit-test-not-a-real-key";
  assert.equal((await invoke(body,token)).statusCode,503,"Off by default");
  process.env.NAGRIK_PHOTO_AI_ENABLED="true";
  assert.equal((await invoke(body,null)).statusCode,401,"Require Firebase login");
  assert.equal((await invoke({...body,consent:false},token)).statusCode,400,"Require photo processing consent");
  assert.equal((await invoke({...body,image:"file:///etc/passwd"},token)).statusCode,413,"Reject arbitrary image sources");
  assert.equal((await invoke({...body,challengeId:"unknown"},token)).statusCode,400,"Block unknown missions");
  let providerCalls=0;
  global.fetch=async(url,options)=>{
    if(url.includes("identitytoolkit.googleapis.com")){
      return {ok:true,json:async()=>({users:[{localId:"photo-test-uid",disabled:false}]})};
    }
    assert.ok(url.includes("api.openai.com"));
    providerCalls++;
    assert.equal(JSON.parse(options.body).store,false,"Disable stored AI responses");
    assert.ok(JSON.parse(options.body).messages[1].content[1].image_url.url.startsWith("data:image/jpeg;base64,"));
    return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({
      decision:"relevant",reason:"Plausible cleanup image"
    })}}]})};
  };
  const result=await invoke(body,token);
  assert.equal(result.statusCode,200);
  assert.equal(result.body.decision,"relevant");
  assert.match(result.body.notice,/cannot confirm/i);
  assert.equal(providerCalls,1);
  console.log("PASS: photo screening requires consent/auth, rejects unsafe input and labels AI limits.");
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{
  global.fetch=originalFetch;
  for(const k of ["NAGRIK_PHOTO_AI_ENABLED","OPENAI_API_KEY"]) {
    if(env[k]===undefined)delete process.env[k];
    else process.env[k]=env[k];
  }
});
