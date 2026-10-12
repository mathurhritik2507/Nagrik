// Regression test: Nagrik's actual database is named 'default', NOT '(default)'.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const ts=require("typescript");
const idSource=fs.readFileSync("config/firestoreDatabase.js","utf8");
const match=idSource.match(/export const NAGRIK_FIRESTORE_DATABASE_ID = "([^"]+)"/);
assert.ok(match,"Firestore database ID must be centralized");
assert.equal(match[1],"default");
const id=match[1];

function load(file,overrides){
  const compiled=ts.transpileModule(fs.readFileSync(file,"utf8"),{
    fileName:file.endsWith(".js")?file.replace(/\.js$/,".ts"):file,
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
  }).outputText;
  const e={};
  vm.runInNewContext(compiled,{
    exports:e,
    require(name){
      if(name==="./config/firestoreDatabase")return {NAGRIK_FIRESTORE_DATABASE_ID:id};
      if(name in overrides)return overrides[name];
      throw Error("Unexpected import: "+name);
    },
  });
  return e;
}

const mockApp={name:"[DEFAULT]"};
let webCall;
const web=load("firebaseConfig.web.js",{
  "firebase/app":{initializeApp:()=>mockApp,getApps:()=>[],getApp:()=>mockApp},
  "firebase/auth":{getAuth:()=>({})},
  "firebase/firestore":{
    initializeFirestore:(app,settings,databaseId)=>{
      webCall={app,settings,databaseId};return {databaseId};
    },
  },
});
assert.equal(webCall.app,mockApp);
assert.equal(webCall.databaseId,"default");
assert.equal(web.db.databaseId,"default");
assert.ok(webCall.settings.experimentalForceLongPolling===true);

let nativeCall;
const native=load("firebaseConfig.js",{
  "@react-native-async-storage/async-storage":{default:{}},
  "firebase/app":{initializeApp:()=>mockApp},
  "firebase/auth":{getReactNativePersistence:()=>({}),initializeAuth:()=>({})},
  "firebase/firestore":{
    getFirestore:(app,databaseId)=>{
      nativeCall={app,databaseId};return {databaseId};
    },
  },
});
assert.equal(nativeCall.app,mockApp);
assert.equal(nativeCall.databaseId,"default");
assert.equal(native.db.databaseId,"default");
console.log("PASS: Web and native Firestore use the existing named database ID 'default'.");
