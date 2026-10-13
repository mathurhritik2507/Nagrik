const assert=require("node:assert/strict");
const fs=require("node:fs");

const source=(path)=>fs.readFileSync(path,"utf8");
const layout=source("app/(tabs)/_layout.web.tsx");
const home=source("app/(tabs)/index.web.tsx");
const more=source("app/(tabs)/more.web.tsx");
const fallback=source("app/(tabs)/more.tsx");
const tile=source("components/web/FeatureTile.tsx");

for(const route of ["index","community","challenges","more"]){
 assert.match(layout,new RegExp('<Tabs\\.Screen name="'+route+'" options=\\{\\{title:'),"Required visible tab: "+route);
}
for(const route of ["explore","report","profile","leaderboard","assistant","impact"]){
 assert.match(layout,new RegExp('<Tabs\\.Screen name="'+route+'" options=\\{\\{href:null\\}\\}'),"Keep alternate route hidden from primary tabs: "+route);
}
assert.equal((layout.match(/options=\\{\\{title:/g)||[]).length,4,"Exactly four visible tabs");
assert.match(home,/Record an action/);
assert.match(home,/Save an issue note/);
assert.match(home,/Explore all Nagrik features/);
assert.doesNotMatch(home,/CommunityPreview|Explore your civic toolkit|<Metric|<Hero/,"Home must not reintroduce crowded feed and catalog");
for(const route of ["/explore","/report","/challenges","/community","/leaderboard","/assistant","/impact","/profile","/account-help"]){
 assert.ok(more.includes('href:"'+route+'"'),"More directory is missing route "+route);
}
assert.match(more,/Everything in one place/);
assert.match(fallback,/Explore Nagrik/);
assert.match(tile,/accessibilityRole="button"/);
console.log("PASS: Nagrik focused Home, four-tab navigation, accessible More directory, and complete routes.");
