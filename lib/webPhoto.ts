import * as ImagePicker from "expo-image-picker";

/** Web-only: launch picker directly from a user click, then compress to a local thumbnail. */
export async function pickWebPhoto(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],quality:.7,allowsEditing:false});
  if (result.canceled || !result.assets?.length) return undefined;
  const uri = result.assets[0].uri;
  return new Promise((resolve,reject)=>{
    const img = new window.Image();
    img.onload=()=>{
      try{
        const ratio=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));
        canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
        const ctx=canvas.getContext("2d");
        if(!ctx) throw new Error("Your browser cannot prepare this image.");
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const thumb=canvas.toDataURL("image/jpeg",.58);
        if(thumb.length>280000) throw new Error("Photo is too large. Please choose a smaller image.");
        resolve(thumb);
      }catch(error){reject(error)}
    };
    img.onerror=()=>reject(new Error("Could not open that photo. Try another image."));
    img.src=uri;
  });
}
