const { chromium }=require("playwright-core");
const assert=require("node:assert/strict");
const fs=require("node:fs");
(async()=>{
  const exe=process.env.CHROME_BIN||"/usr/bin/google-chrome";
  const browser=await chromium.launch({headless:true,executablePath:exe,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];
  page.on("pageerror",e=>errors.push("PAGE ERROR "+e.stack));
  page.on("console",m=>{if(m.type()==="error")errors.push("CONSOLE ERROR "+m.text())});
  page.on("requestfailed",r=>errors.push("REQUEST FAILED "+r.url()+" "+r.failure()?.errorText));
  const origin="http://127.0.0.1:3000";
  for (const path of ["/login","/","/community"]){
    console.log("CHECK",path);
    errors.length=0;
    await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:30000});
    await page.waitForTimeout(3000);
    let text=(await page.locator("body").innerText()).slice(0,800);
    console.log("URL",page.url());
    console.log("BODY",JSON.stringify(text));
    console.log("JS_ERRORS",JSON.stringify(errors.slice(0,12)));
    await page.screenshot({path:"smoke-"+(path==="/login"?"login":path==="/"?"home":"community")+".png",fullPage:true});
    if(text.trim().length<12)throw Error("Blank screen at "+path+"; errors: "+errors.join("; "));
    if(path==="/login")assert.match(text,/Welcome back|Sign in|Nagrik/i,"Login screen missing");
    if(errors.some(e=>e.startsWith("PAGE ERROR")))throw Error("Runtime exception at "+path+": "+errors.join("; "));
  }
  console.log("BROWSER SMOKE PASSED");
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
