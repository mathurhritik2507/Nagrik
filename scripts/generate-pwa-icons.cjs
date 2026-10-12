// Dependency-free PNG icon generator for Nagrik's Expo web export.
// Deterministic Node built-ins only. Does not touch users' images or data.
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

function crc32(bytes) {
 let crc=0xffffffff;
 for(const b of bytes){
  crc^=b;
  for(let k=0;k<8;k++)crc=(crc&1)?(crc>>>1)^0xedb88320:crc>>>1;
 }
 return (crc^0xffffffff)>>>0;
}
function chunk(name,data){
 const kind=Buffer.from(name,"ascii");
 const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);
 const check=Buffer.alloc(4);check.writeUInt32BE(crc32(Buffer.concat([kind,data])),0);
 return Buffer.concat([len,kind,data,check]);
}
function pointInPolygon(x,y,polygon){
 let hit=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
 }
 return hit;
}
function createPng(size){
 const scanlines=Buffer.alloc(size*(1+size*4));
 const orange=[255,106,0,255],white=[255,255,255,255],clear=[0,0,0,0];
 const stems=[
  [[.26,.24],[.38,.24],[.38,.76],[.26,.76]],
  [[.62,.24],[.74,.24],[.74,.76],[.62,.76]],
  [[.35,.24],[.47,.24],[.69,.76],[.57,.76]]
 ];
 for(let y=0;y<size;y++){
  const py=(y+.5)/size;
  let offset=y*(1+size*4);scanlines[offset++]=0;
  for(let x=0;x<size;x++){
   const px=(x+.5)/size,dx=Math.min(px,1-px),dy=Math.min(py,1-py),r=.205;
   let inside=true;
   if(dx<r&&dy<r)inside=(r-dx)**2+(r-dy)**2<=r*r;
   const isN=stems.some(poly=>pointInPolygon(px,py,poly));
   const pixel=!inside?clear:isN?white:orange;
   for(let j=0;j<4;j++)scanlines[offset++]=pixel[j];
  }
 }
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);
 ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk("IHDR",ihdr),
  chunk("IDAT",zlib.deflateSync(scanlines,{level:9})),
  chunk("IEND",Buffer.alloc(0))
 ]);
}
const output=path.join(__dirname,"..","public");
fs.mkdirSync(output,{recursive:true});
for(const size of [192,512]){
 const file=path.join(output,`icon-${size}.png`);
 fs.writeFileSync(file,createPng(size));
 console.log("Generated Nagrik PWA icon",size,"px");
}
