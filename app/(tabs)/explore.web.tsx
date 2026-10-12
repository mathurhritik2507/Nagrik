import React, {useState} from "react";
import { Image, Text, View } from "react-native";
import { useCivicData } from "../../lib/webCivicStore";
import { pickWebPhoto } from "../../lib/webPhoto";
import { Shell, Card, Chip, Field, Button, Heading, Notice, Empty, palette, dateLabel } from "../../components/web/Kit";

const categories=["Cleanliness","Tree planting","Community support","Awareness","Other"];
export default function WebActions(){
  const {data,addAction}=useCivicData();
  const [category,setCategory]=useState(categories[0]);const [description,setDescription]=useState("");const [image,setImage]=useState<string|undefined>();
  const [message,setMessage]=useState("");const [error,setError]=useState(false);const [busy,setBusy]=useState(false);
  const selectPhoto=async()=>{try{const uri=await pickWebPhoto();if(uri)setImage(uri);}catch(e:any){setError(true);setMessage(e.message||"Unable to select a photo.");}};
  const submit=()=>{
    setMessage("");setBusy(true);
    try{addAction({category,description,image});setDescription("");setImage(undefined);setError(false);setMessage("Action saved in this browser. +50 practice XP. It is not independently verified or shared publicly.");}
    catch(e:any){setError(true);setMessage(e.message||"Could not save this action.");}
    finally{setBusy(false);}
  };
  return <Shell title="Record a civic action" subtitle="Document something positive you did for your community. Your entry stays private to this browser in the current beta." eyebrow="COMMUNITY / ACTIONS">
    <Card>
      <Heading muted="Choose an activity, describe what happened, and optionally attach a photo.">New action</Heading>
      <Text style={{fontWeight:"700",marginBottom:10,color:palette.ink}}>Activity category</Text>
      <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:10}}>{categories.map(c=><Chip key={c} label={c} active={category===c} onPress={()=>setCategory(c)}/>)}</View>
      <Field label="What did you do?" value={description} onChangeText={setDescription} multiline placeholder="Example: Helped clean a public footpath near my neighborhood."/>
      {image?<Image source={{uri:image}} style={{width:185,height:120,borderRadius:12,marginBottom:12}}/>:null}
      <View style={{flexDirection:"row",flexWrap:"wrap",gap:10,marginBottom:12}}>
        <Button label={image?"Change photo":"Add photo (optional)"} secondary onPress={selectPhoto}/>
        {image?<Button label="Remove photo" secondary onPress={()=>setImage(undefined)}/>:null}
      </View>
      <Notice text={message} error={error}/>
      <Button label="Save civic action" busy={busy} onPress={submit}/>
      <Text style={{fontSize:12,color:palette.muted,marginTop:12}}>Photo thumbnails are saved on this device only, not uploaded to cloud storage.</Text>
    </Card>
    <Heading muted="Entries you have recorded in this browser.">My civic actions</Heading>
    <Card>
      {data.actions.length===0?<Empty text="Nothing recorded yet."/>:data.actions.map(a=><View key={a.id} style={{borderBottomWidth:1,borderColor:palette.border,paddingVertical:13}}>
        <Text style={{fontWeight:"800",color:palette.ink}}>{a.category}  ·  {dateLabel(a.createdAt)}</Text>
        <Text style={{color:palette.muted,marginTop:6,lineHeight:20}}>{a.description}</Text>
        {a.image?<Image source={{uri:a.image}} style={{height:95,width:140,borderRadius:9,marginTop:9}}/>:null}
      </View>)}
    </Card>
  </Shell>;
}
