const {chromium}=require('playwright');
const {spawn}=require('child_process');
const path=require('path');
(async()=>{
  const [,,html,out,mode]=process.argv;
  const b=await chromium.launch();
  const pg=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await pg.goto('file://'+path.resolve(html),{waitUntil:'networkidle'});
  await pg.evaluate(async()=>{
    await window.ready;
    const urls=[...document.querySelectorAll('*')].map(e=>getComputedStyle(e).backgroundImage).filter(s=>s.startsWith('url(')).map(s=>s.slice(5,-2));
    await Promise.all(urls.map(u=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src=u;})));
  });
  if(mode==='stills'){
    for(const t of [1.6,4.8,8.6,13,16.8,20.6,24.6,29]){await pg.evaluate(t=>seek(t),t);await pg.screenshot({path:`../still_${t}.png`});}
  } else {
    const FPS=30,T=31;
    const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+FPS,'-i','-','-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-shortest','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-profile:v','high','-c:a','aac','-movflags','+faststart',out],{stdio:['pipe','ignore','inherit']});
    for(let f=0;f<FPS*T;f++){
      await pg.evaluate(t=>seek(t),f/FPS);
      const buf=await pg.screenshot({type:'jpeg',quality:95});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
