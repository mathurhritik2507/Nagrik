const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const source = fs.readFileSync("lib/weeklyRewards.ts","utf8");
const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const context={exports:{},Date,Set};
vm.runInNewContext(js,context);
const {weekKeyFor,currentWeekProgress,currentWeekEnds,chooseVirtualBadge,WEEKLY_GOAL}=context.exports;
assert.equal(WEEKLY_GOAL,3);
assert.equal(weekKeyFor(new Date("2026-10-12T00:00:00Z")),"2026-10-12");
assert.equal(weekKeyFor(new Date("2026-10-18T23:59:59Z")),"2026-10-12");
assert.equal(weekKeyFor(new Date("2026-10-19T00:00:00Z")),"2026-10-19");
assert.equal(weekKeyFor(new Date("2027-01-01T01:00:00Z")),"2026-12-28");
const now=new Date("2026-10-15T13:00:00Z");
const done=currentWeekProgress([
{challengeId:"clean",createdAt:"2026-10-13T08:00:00Z"},
{challengeId:"clean",createdAt:"2026-10-14T09:00:00Z"},
{challengeId:"green",createdAt:"2026-10-16T09:00:00Z"},
{challengeId:"help",createdAt:"2026-10-11T10:00:00Z"}
],now);
assert.equal(done.size,2);
assert.equal(currentWeekEnds(now).toISOString(),"2026-10-19T00:00:00.000Z");
const first=chooseVirtualBadge("sample-user","2026-10-12");
const second=chooseVirtualBadge("sample-user","2026-10-12");
assert.equal(first.id,second.id);
assert.ok(first.name && first.emoji);
console.log("Weekly civic reward rules: all checks passed.");
