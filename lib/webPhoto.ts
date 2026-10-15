import * as ImagePicker from "expo-image-picker";

/** Web-only: launch picker directly from a user click, then compress to a local thumbnail. */
export async function pickWebPhoto(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],quality:.7,allowsEditing:false});
  if (result.canceled || !result.assets?.length) return undefined;
  const asset=result.assets[0];
  if(asset.fileSize && asset.fileSize>6*1024*1024)
    throw new Error("Photo exceeds 6 MB. Choose a smaller image.");
  if(asset.width && asset.height && (asset.width<240||asset.height<240))
    throw new Error("Photo resolution is too low. Choose a clearer image.");
  const uri = asset.uri;
  return new Promise((resolve,reject)=>{
    const img = new window.Image();
    img.onload=()=>{
      try{
        if(img.naturalWidth<240||img.naturalHeight<240)
          throw new Error("Choose a clearer photo (at least 240 pixels per side).");
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
