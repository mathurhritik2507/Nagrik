const assert=require("node:assert/strict");
const handler=require("../api/civic-assistant.js");
function response(){
 return {statusCode:200,headers:{},body:null,
  setHeader(k,v){this.headers[k]=v;return this},
  status(n){this.statusCode=n;return this},
  json(obj){this.body=obj;return this}
 };
}
async function run(){
 const old=process.env.OPENAI_API_KEY;
 delete process.env.OPENAI_API_KEY;
 const unconfigured=response();
 await handler({method:"POST",headers:{authorization:"Bearer fake"},body:{message:"how to help my city"}},unconfigured);
 assert.equal(unconfigured.statusCode,503);
 process.env.OPENAI_API_KEY="test-only";
 const unauthenticated=response();
 await handler({method:"POST",headers:{},body:{message:"how to help my city"}},unauthenticated);
 assert.equal(unauthenticated.statusCode,401);
 const badInput=response();
 await handler({method:"POST",headers:{authorization:"Bearer "+"x".repeat(100)},body:{message:"x".repeat(601)}},badInput);
 assert.equal(badInput.statusCode,400);
 const wrongMethod=response();
 await handler({method:"GET",headers:{},body:{}},wrongMethod);
 assert.equal(wrongMethod.statusCode,405);
 const originalFetch=global.fetch;
 global.fetch=async(url,options)=>{
   if(url.includes("identitytoolkit.googleapis.com"))return {ok:true,json:async()=>({users:[{localId:"test-account",email:"test@example.invalid"}]})};
   if(url.includes("api.openai.com"))return {ok:true,json:async()=>({choices:[{message:{content:"Organize a safe, voluntary neighborhood cleanup with local permission."}}]})};
   throw Error("Unexpected remote request");
 };
 try{
 const ok=response();
 await handler({method:"POST",headers:{authorization:"Bearer "+"x".repeat(100)},body:{message:"What can I do about litter?",history:[]}},ok);
 assert.equal(ok.statusCode,200);
 assert.match(ok.body.reply,/neighborhood cleanup/);
 }finally{
 global.fetch=originalFetch;
 if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old;
 }
 console.log("Civic AI backend: mocked response, auth and validation tests passed.");
}
run().catch(e=>{console.error(e);process.exitCode=1});
