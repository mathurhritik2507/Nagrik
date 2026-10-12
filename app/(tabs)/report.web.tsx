import React,{useState} from "react";
import { Image, Text, View } from "react-native";
import { useCivicData } from "../../lib/webCivicStore";
import { pickWebPhoto } from "../../lib/webPhoto";
import { Shell, Card, Heading, Field, Button, Chip, Notice, Empty, palette, dateLabel } from "../../components/web/Kit";

const categories=["Garbage","Road damage","Water leakage","Traffic","Public safety","Other"];
export default function WebReport(){
  const {data,addReport}=useCivicData();
  const [category,setCategory]=useState(categories[0]);
  const [location,setLocation]=useState("");const [description,setDescription]=useState("");
  const [image,setImage]=useState<string|undefined>();const [message,setMessage]=useState("");const [error,setError]=useState(false);
  const choose=async()=>{try{const uri=await pickWebPhoto();if(uri)setImage(uri);}catch(e:any){setError(true);setMessage(e.message||"Unable to attach image.");}};
  const submit=()=>{
    setMessage("");
    try{addReport({category,location,description,image});setDescription("");setLocation("");setImage(undefined);setError(false);setMessage("Report saved locally and added to your dashboard. This does NOT notify government authorities or other users.");}
    catch(e:any){setError(true);setMessage(e.message||"Could not save report.");}
  };
  return <Shell title="Document a civic issue" subtitle="Keep a clear, private record of neighborhood concerns. This beta is not connected to municipal grievance systems." eyebrow="COMMUNITY / REPORTS">
    <Card>
      <Heading muted="For emergencies or urgent safety concerns, use official local emergency services.">New issue report</Heading>
      <Text style={{fontWeight:"700",color:palette.ink,marginBottom:10}}>Issue category</Text>
      <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:12}}>{categories.map(c=><Chip key={c} label={c} active={category===c} onPress={()=>setCategory(c)}/>)}</View>
      <Field label="General location" value={location} onChangeText={setLocation} placeholder="Example: Near Central Market, Pune (avoid private addresses)"/>
      <Field label="Issue description" value={description} onChangeText={setDescription} placeholder="What did you observe? How does it affect the area?" multiline/>
      {image?<Image source={{uri:image}} style={{height:120,width:185,borderRadius:12,marginBottom:12}}/>:null}
      <View style={{flexDirection:"row",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        <Button label={image?"Replace photo":"Attach photo (optional)"} secondary onPress={choose}/>
        {image?<Button label="Remove photo" secondary onPress={()=>setImage(undefined)}/>:null}
      </View>
      <Notice text={message} error={error}/>
      <Button label="Save issue report" onPress={submit}/>
      <Text style={{fontSize:12,color:palette.muted,marginTop:11}}>Saved to this browser only. Nothing is sent to public services. Avoid faces, exact home addresses, and sensitive personal data.</Text>
    </Card>
    <Heading muted="Your privately saved reports, most recent first.">Recorded issues ({data.reports.length})</Heading>
    <Card>{data.reports.length===0?<Empty text="No issues recorded yet."/>:data.reports.map(r=><View key={r.id} style={{paddingVertical:13,borderBottomColor:palette.border,borderBottomWidth:1}}>
      <Text style={{fontWeight:"800",color:palette.ink}}>{r.category} · {r.location}</Text>
      <Text style={{fontSize:12,color:palette.muted,marginTop:5}}>{dateLabel(r.createdAt)} · {r.status}</Text>
      <Text style={{color:palette.ink,marginTop:7,lineHeight:21}}>{r.description}</Text>
      {r.image?<Image source={{uri:r.image}} style={{height:95,width:145,borderRadius:9,marginTop:8}}/>:null}
    </View>)}</Card>
  </Shell>;
}
