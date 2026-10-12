const assert=require("node:assert/strict");
const fs=require("node:fs");
const ts=require("typescript");
const vm=require("node:vm");
const source=fs.readFileSync("lib/communityCloud.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
let requests=[];
let defaultResponse={ok:true,status:200};
let namedResponse={ok:true,status:200};
const ex={};
vm.runInNewContext(compiled,{
  exports:ex,
  require(name){
    if(name==="firebase/firestore")return {};
    if(name==="../firebaseConfig")return {
      auth:{currentUser:{getIdToken:async()=> "unit-test-id-token"}},
      db:{app:{options:{projectId:"nagrik-5ef31"}}},
    };
    throw Error("Unexpected import "+name);
  },
  fetch:async(url,opts)=>{requests.push({url,opts});return url.includes("/databases/(default)/")?defaultResponse:namedResponse;},
  AbortController, setTimeout, clearTimeout, Date, Math, Promise, JSON,
  encodeURIComponent,Map,Set,Array,String,Object,Error,
});
(async()=>{
  let result=await ex.checkCommunityRestConnection();
  assert.equal(result.kind,"connected");
  assert.equal(requests[0].url,"https://firestore.googleapis.com/v1/projects/nagrik-5ef31/databases/(default)/documents:runQuery");
  assert.equal(requests[1].url,"https://firestore.googleapis.com/v1/projects/nagrik-5ef31/databases/default/documents:runQuery");
  assert.equal(requests[0].opts.method,"POST");
  assert.equal(JSON.parse(requests[0].opts.body).structuredQuery.from[0].collectionId,"communityPosts");
  assert.equal(requests[0].opts.headers.Authorization,"Bearer unit-test-id-token");
  assert.doesNotMatch(result.message,/unit-test-id-token/);
  defaultResponse={ok:false,status:404,json:async()=>({error:{status:"NOT_FOUND",message:"Requested database was not found."}})};
  // A named database with ID 'default' can exist separately from '(default)'.
  // This is the key suspected configuration mismatch.
  result=await ex.checkCommunityRestConnection();
  assert.equal(result.kind,"error");
  assert.match(result.message,/DATABASE ID MISMATCH/);
  assert.match(result.message,/named database 'default'/);
  assert.doesNotMatch(result.message,/unit-test-id-token/);

  namedResponse={ok:false,status:404,json:async()=>({error:{status:"NOT_FOUND",message:"Requested database was not found."}})};
  result=await ex.checkCommunityRestConnection();
  assert.equal(result.kind,"error");
  assert.match(result.message,/Requested database was not found/);

  defaultResponse={ok:false,status:403,json:async()=>({error:{status:"PERMISSION_DENIED",message:"Missing or insufficient permissions."}})};
  result=await ex.checkCommunityRestConnection();
  assert.equal(result.kind,"permission-denied");
  assert.match(result.message,/permission/i);
  console.log("Firestore HTTPS query diagnostics passed.");
})().catch(e=>{console.error(e);process.exitCode=1;});
