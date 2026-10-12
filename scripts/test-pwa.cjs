const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const manifest=JSON.parse(fs.readFileSync("public/manifest.json","utf8"));
assert.equal(manifest.name,"Nagrik - India's Civic Action Platform");
assert.equal(manifest.display,"standalone");
assert.equal(manifest.start_url,"/demo");
assert.equal(manifest.scope,"/");
assert.equal(manifest.theme_color,"#FF6B00");
const html=fs.readFileSync("public/index.html","utf8");
assert.match(html,/<link rel="manifest" href="\/manifest.json"/);
assert.match(html,/<div id="root"><\/div>/);
assert.match(html,/<title>%WEB_TITLE%<\/title>/);
assert.doesNotMatch(html,/serviceWorker\.register/);
for(const px of [192,512]){
 const entry=manifest.icons.find(x=>x.sizes===px+"x"+px);
 assert.ok(entry,"Missing "+px+"px manifest icon");
 const p=path.join("public",path.basename(entry.src));
 const bytes=fs.readFileSync(p);
 assert.equal(bytes.toString("hex",0,8),"89504e470d0a1a0a");
 assert.equal(bytes.readUInt32BE(16),px);
 assert.equal(bytes.readUInt32BE(20),px);
 assert.ok(bytes.length>500);
}
const vercel=JSON.parse(fs.readFileSync("vercel.json","utf8"));
assert.equal(vercel.outputDirectory,"dist");
const route=vercel.rewrites[0].source;
assert.ok(route.includes("manifest.json")&&route.includes("icon-"),"Never rewrite PWA assets as app HTML");
if(fs.existsSync("dist/index.html")){
 const exportHtml=fs.readFileSync("dist/index.html","utf8");
 assert.match(exportHtml,/<link rel="manifest" href="\/manifest.json"/);
 assert.ok(fs.existsSync("dist/manifest.json"),"Manifest missing from Expo export");
 for(const size of [192,512])assert.ok(fs.existsSync(`dist/icon-${size}.png`),"Missing exported icon");
}
console.log("PASS: Nagrik PWA manifest, icon dimensions, safe metadata, Vercel assets and export.");
