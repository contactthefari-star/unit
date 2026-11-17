const {chromium}=require('playwright');const {spawn,execFileSync}=require('child_process');const path=require('path');
(async()=>{
  const [,,mode,out]=process.argv;
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.goto('file://'+path.resolve('overlay.html'),{waitUntil:'networkidle'});await pg.evaluate(()=>window.ready);
  if(mode==='stills'){
    for(const t of [1.5,3.6,6.0,10.5,15.0,19.6,21.8,24.6,28.0]){
      await pg.evaluate(t=>seek(t),t);await pg.screenshot({path:`ov.png`,omitBackground:true});
      execFileSync('ffmpeg',['-v','error','-y','-ss',''+t,'-i','base.mov','-i','ov.png','-filter_complex','[0:v][1:v]overlay','-frames:v','1',`../st_${t}.png`]);
    }
  } else {
    const ff=spawn('ffmpeg',['-v','error','-y','-i','base.mov','-f','image2pipe','-framerate','30','-i','-','-i','music.wav',
      '-filter_complex',"[0:v][1:v]overlay=format=auto,format=yuv420p[v];[0:a]volume=0.32,highpass=f=80[amb];[2:a]volume=1.0[mu];[amb][mu]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=9[a1]",
      '-map','[v]','-map','[a1]','-c:v','libx264','-crf','17','-preset','slow','-profile:v','high','-r','30','-c:a','aac','-b:a','192k','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
    for(let f=0;f<900;f++){await pg.evaluate(t=>seek(t),f/30);const buf=await pg.screenshot({type:'png',omitBackground:true});
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
