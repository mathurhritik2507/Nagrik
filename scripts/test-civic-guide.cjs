const assert=require("node:assert/strict");
const fs=require("node:fs");
const ts=require("typescript");
const vm=require("node:vm");
const source=fs.readFileSync("lib/civicGuide.ts","utf8");
const transformed=ts.transpileModule(source,{compilerOptions:{
  target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS
}}).outputText;
const guide={};
vm.runInNewContext(transformed,{exports:guide,String,Array,Math,Number,Error});
const topics=[
 ["How can I report a pothole responsibly?","Potholes and damaged roads"],
 ["How can I organize a neighborhood cleanliness drive?","Neighborhood cleanliness drives"],
 ["What can citizens do about air pollution?","Air pollution"],
 ["How does the weekly reward crate work?","Weekly missions and reward crates"],
 ["How can I make public spaces more accessible?","Making public spaces accessible"],
 ["How can I request a civic service in my city?","Reporting a public-service issue"],
 ["How can I separate wet and dry waste?","Waste separation and recycling"],
 ["There is waterlogging by an open drain.","Drainage and flooding"],
 ["The streetlight outside has stopped working.","Streetlights and public lighting"],
 ["How do we help a neighbor volunteer?","Volunteering and helping neighbors"],
];
for(const [question,title] of topics){
 const answer=guide.civicGuideAnswer(question);
 assert.equal(answer.topic,title,`Wrong topic for: ${question}`);
 assert.equal(answer.matched,true);
 assert.match(answer.reply,/\n1\. /);
 assert.doesNotMatch(answer.reply,/https?:\/\//);
}
const unknown=guide.civicGuideAnswer("How do I change an image filter algorithm?");
assert.equal(unknown.matched,false);
assert.match(unknown.reply,/don't have a specific prepared guide/);
assert.match(guide.civicGuideAnswer("How do I earn the weekly voucher?").reply,/no real vouchers/i);
assert.match(guide.civicGuideAnswer("I need a civic service").reply,/does not send it to government/i);
assert.ok(guide.CIVIC_GUIDE_TOPICS.length>=12);
const ui=fs.readFileSync("app/(tabs)/assistant.web.tsx","utf8");
assert.match(ui,/useState<Mode>\("guide"\)/);
assert.match(ui,/mode==="guide"/);
assert.match(ui,/civicGuideAnswer\(text\)/);
assert.match(ui,/Free Civic Guide/);
assert.match(ui,/no AI answer was generated/);
console.log("PASS: offline Civic Guide covers starter topics, safety disclaimers and opt-in Live AI.");
