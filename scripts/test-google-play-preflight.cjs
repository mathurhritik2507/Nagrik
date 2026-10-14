const assert=require("node:assert/strict");
const fs=require("node:fs");
const app=JSON.parse(fs.readFileSync("app.json","utf8")).expo;
assert.equal(app.android.package,"com.hritikm07.nagrik");
assert.equal(app.extra.eas.projectId,"c3bd157d-2115-4102-a12a-8637df1a69ce");
assert.ok(app.android.permissions.includes("android.permission.CAMERA"));
for(const permission of ["android.permission.RECORD_AUDIO","android.permission.READ_MEDIA_IMAGES","android.permission.READ_MEDIA_VIDEO"]){
  assert.ok(!app.android.permissions.includes(permission),"Sensitive permission explicitly requested: "+permission);
  assert.ok(app.android.blockedPermissions.includes(permission),"Sensitive merged permission not blocked: "+permission);
}
const picker=app.plugins.find(x=>Array.isArray(x)&&x[0]==="expo-image-picker");
assert.ok(picker&&picker[1].microphonePermission===false,"Image picker microphone permission must be disabled");
const eas=JSON.parse(fs.readFileSync("eas.json","utf8"));
assert.ok(eas.build.production,"Production EAS Android profile missing");
for(const path of ["app/(tabs)/report.tsx","app/(tabs)/explore.tsx","app/(tabs)/profile.tsx"]){
  const src=fs.readFileSync(path,"utf8");
  assert.ok(!src.includes("requestMediaLibraryPermissionsAsync()"),path+" still asks for broad photo library permission");
}
assert.ok(!fs.readFileSync("app/(tabs)/report.tsx","utf8").includes("Report submitted successfully"),"A locally saved note must not claim official submission");
assert.ok(fs.existsSync("GOOGLE_PLAY_RELEASE.md"));
console.log("GOOGLE PLAY PREPARATION CHECK PASSED — does not validate compiled Android Manifest, device testing, privacy or Play submission");
