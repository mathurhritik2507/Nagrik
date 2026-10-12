const assert=require("node:assert/strict");
const fs=require("node:fs");
const ts=require("typescript");
const vm=require("node:vm");

const source=fs.readFileSync("lib/communityCloud.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,
}}).outputText;
const requests=[];
let response={ok:true,status:200};
const exported={};
vm.runInNewContext(compiled,{
  exports:exported,
  require(name){
    if(name==="firebase/firestore")return {};
    if(name==="../config/firestoreDatabase")return {NAGRIK_FIRESTORE_DATABASE_ID:"default"};
    if(name==="../firebaseConfig")return {
      auth:{currentUser:{getIdToken:async()=> "unit-test-id-token"}},
      db:{app:{options:{projectId:"nagrik-5ef31"}}},
    };
    throw Error("Unexpected import "+name);
  },
  fetch:async(url,opts)=>{requests.push({url,opts});return response;},
  AbortController,setTimeout,clearTimeout,Date,Math,Promise,JSON,
  encodeURIComponent,Map,Set,Array,String,Object,Error,
});
(async()=>{
  let result=await exported.checkCommunityRestConnection();
  assert.equal(result.kind,"connected");
  assert.match(result.message,/database 'default'/);
  assert.equal(requests.length,1,"Only the configured database should be queried");
  assert.equal(requests[0].url,
    "https://firestore.googleapis.com/v1/projects/nagrik-5ef31/databases/default/documents:runQuery");
  assert.equal(requests[0].opts.method,"POST");
  assert.equal(JSON.parse(requests[0].opts.body).structuredQuery.from[0].collectionId,"communityPosts");
  assert.equal(requests[0].opts.headers.Authorization,"Bearer unit-test-id-token");
  assert.doesNotMatch(result.message,/unit-test-id-token|DATABASE ID MISMATCH/);

  response={ok:false,status:404,json:async()=>({error:{status:"NOT_FOUND",message:"not found"}})};
  result=await exported.checkCommunityRestConnection();
  assert.equal(result.kind,"error");
  assert.match(result.message,/database 'default'.*404/);
  assert.doesNotMatch(result.message,/unit-test-id-token/);
  response={ok:false,status:403,json:async()=>({error:{status:"PERMISSION_DENIED"}})};
  result=await exported.checkCommunityRestConnection();
  assert.equal(result.kind,"permission-denied");
  assert.match(result.message,/database 'default'/);
  assert.equal(requests.length,3);
  assert.ok(requests.every(r=>r.url.includes("/databases/default/")),
    "Must never falsely fail based on absent (default) database");
  console.log("Firestore HTTPS configured database diagnostics passed.");
})().catch(e=>{console.error(e);process.exitCode=1;});
