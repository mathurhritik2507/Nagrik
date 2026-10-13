const assert=require("node:assert/strict");
const fs=require("node:fs");

const source=(path)=>fs.readFileSync(path,"utf8");
const layout=source("app/(tabs)/_layout.web.tsx");
const home=source("app/(tabs)/index.web.tsx");
const more=source("app/(tabs)/more.web.tsx");
const fallback=source("app/(tabs)/more.tsx");
const tile=source("components/web/FeatureTile.tsx");

for(const route of ["index","community","challenges","more"]){
 assert.ok(layout.includes('<Tabs.Screen name="'+route+'" options={{title:'),"Missing visible tab: "+route);
}
for(const route of ["explore","report","profile","leaderboard","assistant","impact"]){
 assert.ok(layout.includes('<Tabs.Screen name="'+route+'" options={{href:null}}'),"Missing hidden route: "+route);
}
assert.equal(layout.split("options={{title:").length-1,4,"Exactly four visible tabs");
assert.match(home,/Record an action/);
assert.match(home,/Save an issue note/);
assert.match(home,/Explore all Nagrik features/);
assert.doesNotMatch(home,/CommunityPreview|Explore your civic toolkit|<Metric|<Hero/,"Don't reintroduce crowded Home panels");
for(const route of ["/explore","/report","/challenges","/community","/leaderboard","/assistant","/impact","/profile","/account-help"]){
 assert.ok(more.includes('href:"'+route+'"'),"Missing More directory route "+route);
}
assert.match(more,/Everything in one place/);
assert.match(fallback,/Explore Nagrik/);
assert.match(tile,/accessibilityRole="button"/);
console.log("PASS: focused Home, four-tab navigation, accessible feature directory and complete routes.");
