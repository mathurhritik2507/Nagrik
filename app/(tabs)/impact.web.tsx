import React from "react";
import {Text,View} from "react-native";
import {router} from "expo-router";
import {useCivicData} from "../../lib/webCivicStore";
import {Shell,Card,Hero,Heading,Metric,Button,Empty,palette} from "../../components/web/Kit";

export default function WebImpact(){
 const {data,points}=useCivicData();
 const counts:Record<string,number>={};
 data.reports.forEach(r=>{counts[r.category]=(counts[r.category]||0)+1;});
 const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 const max=Math.max(1,...entries.map(e=>e[1]));
 return <Shell title="Your civic insights" subtitle="Simple analytics based on your own locally saved activity—not citywide or verified government data." eyebrow="COMMUNITY / INSIGHTS">
   <Hero kicker="MY CIVIC SNAPSHOT" title="From records to insight." description="Explore the issues you've documented, identify recurring categories, and plan your next neighborhood action."/>
   <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:6}}>
     <Metric label="My reports" value={data.reports.length}/>
     <Metric label="My actions" value={data.actions.length}/>
     <Metric label="Practice XP" value={points}/>
   </View>
   <Heading muted="Categories from your submitted reports only.">Issue categories</Heading>
   <Card>{entries.length===0?<Empty text="Save an issue report to see category analytics."/>:
    entries.map(([label,count])=><View key={label} style={{marginVertical:11}}>
      <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:9}}>
       <Text style={{color:palette.ink,fontWeight:"700"}}>{label}</Text>
       <Text style={{color:palette.muted}}>{count} record{count===1?"":"s"}</Text>
      </View>
      <View style={{height:13,backgroundColor:"#EDF2F7",borderRadius:20,overflow:"hidden"}}>
        <View style={{width:`${100*count/max}%`,backgroundColor:palette.orange,height:13,borderRadius:20}}/>
      </View>
    </View>)}
   </Card>
   <Card><Heading>Want to contribute?</Heading>
     <Text style={{color:palette.muted,marginBottom:16,lineHeight:22}}>Identify one local concern and document it. A map with public submissions is planned for a future version after privacy and moderation controls are in place.</Text>
     <Button label="Record an issue ↗" onPress={()=>router.push("/report")}/>
   </Card>
 </Shell>;
}
