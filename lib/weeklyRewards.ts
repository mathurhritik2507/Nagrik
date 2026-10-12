/** Weekly civic missions: a demonstration reward system. No real-world prizes. */
export const WEEKLY_GOAL = 3;
export const REWARD_BADGES = [
  {id:"green-guardian",name:"Green Guardian",emoji:"🌱",description:"A digital badge celebrating greener habits."},
  {id:"civic-champion",name:"Civic Champion",emoji:"🏅",description:"A digital badge for community-minded action."},
  {id:"community-spark",name:"Community Spark",emoji:"✨",description:"A virtual collectible for positive civic momentum."},
  {id:"neighborhood-hero",name:"Neighborhood Hero",emoji:"🛡️",description:"A digital collectible for taking part."}
] as const;
export type CrateClaim = {weekKey:string;rewardId:string;openedAt:string;kind:"virtual-badge"};
export type ProofLike = {challengeId:string;createdAt:string};

export function weekKeyFor(date:Date){
  if(Number.isNaN(date.valueOf())) return "";
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
  const day=(d.getUTCDay()+6)%7;
  d.setUTCDate(d.getUTCDate()-day);
  return d.toISOString().slice(0,10);
}
export function currentWeekProgress(proofs:ProofLike[],now=new Date()){
  const week=weekKeyFor(now);
  return new Set(proofs.filter(p=>weekKeyFor(new Date(p.createdAt))===week).map(p=>p.challengeId));
}
export function chooseVirtualBadge(uid:string,weekKey:string) {
  const value=uid+weekKey;
  let hash=0;
  for(let i=0;i<value.length;i++)hash=(hash*31+value.charCodeAt(i))>>>0;
  return REWARD_BADGES[hash%REWARD_BADGES.length];
}
export function currentWeekEnds(now=new Date()){
  const monday=new Date(weekKeyFor(now)+"T00:00:00.000Z");
  monday.setUTCDate(monday.getUTCDate()+7);
  return monday;
}
