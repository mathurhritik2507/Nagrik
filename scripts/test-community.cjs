const assert=require("node:assert/strict");
const fs=require("node:fs");
const ts=require("typescript");
const vm=require("node:vm");

const source=fs.readFileSync("lib/communityCloud.ts","utf8");
const transpiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const moduleExports={};
vm.runInNewContext(transpiled,{
 exports:moduleExports,
 require:(name)=>{
  if(name==="firebase/firestore")return {};
  if(name==="../firebaseConfig")return {auth:{currentUser:null},db:{}};
  throw Error("Unexpected module "+name);
 },
 Map,Date,Set,Math,Array,String,Object
});
const {communityRanking,categories}=moduleExports;
assert.ok(categories.includes("Cleanliness"));
const now=new Date("2026-10-15T12:00:00Z");
const sample=[
 {authorUid:"A",authorName:"Anita",city:"Pune",createdAt:{seconds:Date.parse("2026-10-14T12:00:00Z")/1000}},
 {authorUid:"B",authorName:"Bharat",city:"Mumbai",createdAt:{seconds:Date.parse("2026-10-14T15:00:00Z")/1000}},
 {authorUid:"A",authorName:"Anita",city:"Pune",createdAt:{seconds:Date.parse("2026-10-15T11:00:00Z")/1000}},
 {authorUid:"C",authorName:"Chitra",city:"Delhi",createdAt:{seconds:Date.parse("2026-10-11T12:00:00Z")/1000}}
];
const ranked=communityRanking(sample,now);
assert.equal(ranked.length,2);
assert.equal(ranked[0].uid,"A");
assert.equal(ranked[0].count,2);
assert.equal(ranked[1].uid,"B");
assert.equal(ranked[1].count,1);
console.log("Community ranking tests passed.");

const rules=fs.readFileSync("firestore.community.rules","utf8");
assert.match(rules,/email_verified/);
assert.match(rules,/request\.auth\.uid/);
assert.match(rules,/communityPosts/);
assert.match(rules,/communityFlags/);
assert.doesNotMatch(rules,/allow read, write: if true/);
console.log("Community security rules baseline checks passed.");
