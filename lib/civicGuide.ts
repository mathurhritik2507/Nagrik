/**
 * Offline, curated civic education. This is NOT a generative AI system.
 * No network request or API key is required and it cannot submit complaints.
 * Keep claims location-agnostic unless they are backed by verified official data.
 */
export type CivicGuideReply = {
  topic:string;
  reply:string;
  matched:boolean;
};

type Topic = {title:string;keywords:string[];steps:string[];note:string};

const TOPICS:Topic[]=[
 {
  title:"Potholes and damaged roads",
  keywords:["pothole","broken road","road damage","crater","road hazard","uneven road","footpath damage"],
  steps:[
   "Stay out of traffic. From a safe location, note a nearby landmark, road name and approximate location.",
   "Take a photo only if it is safe and does not expose identifiable people or private details.",
   "Find your city's official municipal road-maintenance or grievance portal and file a factual report.",
   "Keep the reference number, follow up after the published response window, and avoid making unauthorized repairs."
  ],
  note:"Nagrik's local issue record is a personal log; it is not an official municipal complaint."
 },
 {
  title:"Neighborhood cleanliness drives",
  keywords:["cleanliness drive","cleanup","clean up","litter","street cleaning","community cleaning","neighborhood cleanliness","ngO for cleanup"],
  steps:[
   "Choose a safe public area and ask the relevant property manager or local authority for any required permission.",
   "Invite volunteers, arrange gloves and collection bags, and agree on a short, realistic cleanup plan.",
   "Avoid sharps, medical waste, chemicals, exposed wiring, busy roads and unknown waste. Ask professionals to handle hazards.",
   "Separate collected waste according to local collection rules and agree who will transport it to an approved pickup point.",
   "Share what was accomplished without publishing private addresses or pictures of people without consent."
  ],
  note:"Only report activities you actually completed; Nagrik cannot verify uploaded proof."
 },
 {
  title:"Waste separation and recycling",
  keywords:["recycl","segregat","wet and dry","dry and wet","compost","plastic waste","sort waste","garbage segregation","waste management"],
  steps:[
   "Check your municipality's list of accepted recyclable, organic and hazardous waste.",
   "Separate material into the appropriate streams at home or in a permitted shared space.",
   "Rinse packaging only where required; keep electronic, medical and chemical waste out of ordinary recycling.",
   "Share official collection schedules with neighbors and label containers clearly."
  ],
  note:"Accepted materials differ by city; verify with your local waste department."
 },
 {
  title:"Air pollution",
  keywords:["air pollution","smog","particulate","air quality","aqi","vehicle emission","burning trash","smoke"],
  steps:[
   "Check public air-quality updates from official or trusted monitoring agencies; readings vary by location.",
   "Avoid burning waste and encourage maintenance of vehicles and legal control of dust from construction.",
   "Report recurring unsafe dust or open burning through the applicable municipal or pollution-control authority.",
   "Reduce exposure during poor air-quality periods, especially for vulnerable people, following public health guidance."
  ],
  note:"Do not treat the guide as a real-time AQI reading or medical advice."
 },
 {
  title:"Drinking water, leaks and pollution",
  keywords:["water leak","drinking water","water supply","water pollution","contaminated water","sewage","water shortage","save water","water conservation"],
  steps:[
   "Identify whether the issue concerns a private pipe, public line, water quality or sewage overflow.",
   "For contamination or suspected unsafe drinking water, follow official health guidance and contact the water utility.",
   "Report a public leak or sewage problem through your city's water or sanitation service with an approximate location.",
   "For conservation, fix safe household leaks, reuse water where appropriate and avoid waste."
  ],
  note:"Do not approach contaminated water, electrical hazards or open drains."
 },
 {
  title:"Streetlights and public lighting",
  keywords:["streetlight","street light","lamp post","dark street","lighting issue","broken light","street lighting"],
  steps:[
   "Note the nearest pole number or landmark from a safe location.",
   "Report the failed light to the official municipal street-light or utility maintenance channel.",
   "Include the approximate time, area and whether pedestrians are affected.",
   "Do not touch poles, wires or electrical equipment; follow up using the ticket number."
  ],
  note:"Emergency electrical hazards should go directly to the utility or local emergency services."
 },
 {
  title:"Drainage and flooding",
  keywords:["flood","waterlogging","blocked drain","drainage","open drain","stormwater","sewer overflow"],
  steps:[
   "Keep away from fast-moving water, manholes and potentially energized floodwater.",
   "Report the approximate area and visible blockage through your municipality's drainage or emergency channel.",
   "Photograph only from a safe location and provide a recognizable public landmark if possible.",
   "Follow local advisories and avoid attempting to clear deep or hazardous drainage yourself."
  ],
  note:"For an immediate threat to life or property, contact local emergency responders directly."
 },
 {
  title:"Making public spaces accessible",
  keywords:["accessib","wheelchair","ramp","disabil","tactile","accessible space","sidewalk barrier","inclusive"],
  steps:[
   "Identify a specific barrier such as missing ramps, unusable sidewalks or blocked accessible entrances.",
   "Ask affected users what would help, without assuming their needs or photographing them without consent.",
   "Check applicable local accessibility standards and contact the responsible property manager or city department.",
   "Document the barrier from a safe public vantage point and request a measurable improvement."
  ],
  note:"Detailed accessibility requirements differ by jurisdiction."
 },
 {
  title:"Volunteering and helping neighbors",
  keywords:["volunteer","donat","ngo","community service","help neighbors","community helper","charity","organize volunteers"],
  steps:[
   "Find a reputable local nonprofit, resident association or approved community program.",
   "Ask about safeguarding, permissions, age requirements and needed materials before attending.",
   "Choose activities matching your skills and schedule; never pressure others to participate.",
   "Record only truthful contributions and respect volunteers' and beneficiaries' privacy."
  ],
  note:"Nagrik does not verify charities or collect donations."
 },
 {
  title:"Reporting a public-service issue",
  keywords:["report","complain","grievance","municipal","civic service","request a service","government service","contact city","file a complaint","public service","civic issue"],
  steps:[
   "Identify the responsible agency: municipal services, utilities, transport, public works or another authority.",
   "Use the agency's official website or published customer-service channel; verify the address yourself.",
   "Describe the problem factually with approximate location, timing, impact and safe-to-share evidence.",
   "Save the official reference number and follow up through the same agency if needed."
  ],
  note:"Saving a report in Nagrik does not send it to government authorities."
 },
 {
  title:"Weekly missions and reward crates",
  keywords:["crate","weekly reward","voucher","badge","reward","challenge","missions","xp","points","streak"],
  steps:[
   "Open Challenges and choose a safe mission you genuinely completed.",
   "Upload a photo and short description; submissions are unverified and saved in this browser.",
   "Complete three different missions during the same UTC Monday–Sunday week to unlock one crate.",
   "Open the crate to receive a demonstration digital badge that remains in your local history."
  ],
  note:"There are no real vouchers, discounts, cash or redeemable prizes in the current beta."
 },
 {
  title:"Civic rights and local responsibilities",
  keywords:["civic right","citizen rights","citizen duty","responsibilit","local law","constitution","right to information","public participation","resident rights"],
  steps:[
   "Start with your jurisdiction's official government and municipal information, including civic participation channels.",
   "Check how to attend permitted public consultations, lodge feedback or request publicly available information.",
   "Keep communications factual, lawful and respectful; document public-service concerns without exposing others.",
   "For legal deadlines or disputes, consult a qualified local professional or official help service."
  ],
  note:"This is civic education, not legal advice. Local laws differ."
 },
 {
  title:"Safer streets and traffic concerns",
  keywords:["traffic","crosswalk","pedestrian","road safety","speeding","unsafe intersection","footpath","sidewalk","traffic light"],
  steps:[
   "Identify the unsafe location, approximate time and type of road-user risk.",
   "Observe from a safe location; never stand in a travel lane to take photos.",
   "Submit a factual report to the correct road authority or traffic enforcement agency.",
   "Request a specific feasible intervention, such as signage, visibility or crossing review."
  ],
  note:"Call emergency responders directly for an active collision or immediate danger."
 },
 {
  title:"Parks, trees and public greenery",
  keywords:["park","tree plant","green space","garden","urban greenery","green guardian","planting","public plant"],
  steps:[
   "Ask the park or land manager for permission before planting or altering a public space.",
   "Choose native or approved plants suited to the location and check local maintenance requirements.",
   "Organize watering or cleanup only where access is permitted and safe.",
   "Document the outcome without disturbing wildlife or other park users."
  ],
  note:"Nagrik's missions are voluntary and do not grant permission to modify public land."
 },
 {
  title:"Noise and neighborhood disputes",
  keywords:["noise","loud music","construction sound","neighbour dispute","neighbor dispute","disturbance"],
  steps:[
   "Document approximate times and impacts without recording private conversations or confronting anyone aggressively.",
   "Check applicable housing rules and official local noise regulations.",
   "Use a respectful conversation, building management or the appropriate municipal complaint process.",
   "If you feel unsafe, avoid direct confrontation and contact the appropriate local authority."
  ],
  note:"Noise limits and enforcement channels vary by municipality."
 }
];

const GENERAL=[
 "Choose a specific civic issue and identify who is responsible for it (municipality, utility, local organization or residents).",
 "Check your city government's official website before relying on contact details or legal requirements.",
 "Gather only safe, non-sensitive observations and report through an official channel when appropriate.",
 "Track the outcome; Nagrik does not submit official reports on your behalf."
];

function clean(input:string){return String(input||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
export function civicGuideAnswer(input:string):CivicGuideReply{
 const q=clean(input).slice(0,600);
 if(q.length<2)return {topic:"Ask a civic question",matched:false,reply:"Please describe a civic topic, such as potholes, waste, cleanliness drives, accessibility, recycling or local services."};
 let best:Topic|undefined;let bestScore=0;
 for(const topic of TOPICS){
  let score=0;
  for(const word of topic.keywords){
   const key=clean(word);
   if(key&&q.includes(key))score+=key.includes(" ")?5:2;
  }
  if(score>bestScore){best=topic;bestScore=score;}
 }
 if(!best)return {
  topic:"General civic guidance",
  matched:false,
  reply:"I don't have a specific prepared guide for that question. Here is a safe starting point:\n"+
    GENERAL.map((x,i)=>(i+1)+". "+x).join("\n")+
    "\n\nTry asking about potholes, waste, cleanliness drives, public services, accessibility, air pollution or weekly rewards."
 };
 return {
  topic:best.title,matched:true,
  reply:best.title+"\n"+best.steps.map((x,i)=>(i+1)+". "+x).join("\n")+
   "\n\nImportant: "+best.note
 };
}
export const CIVIC_GUIDE_TOPICS=TOPICS.map(x=>x.title);
