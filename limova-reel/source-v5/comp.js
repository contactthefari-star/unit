const {chromium}=require('playwright');const {spawn,execFileSync}=require('child_process');const path=require('path');
(async()=>{
  const [,,mode,out]=process.argv;
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.goto('file://'+path.resolve('ov.html'),{waitUntil:'networkidle'});await pg.evaluate(()=>window.ready);
  if(mode==='stills'){for(const t of out.split(',').map(Number)){
      await pg.evaluate(t=>seek(t),t);await pg.screenshot({path:'ov.png',omitBackground:true});
      execFileSync('ffmpeg',['-v','error','-y','-ss',''+t,'-i','base.mov','-i','ov.png','-filter_complex','[0:v][1:v]overlay','-frames:v','1',`st_${t}.png`]);}
  } else {
    const ff=spawn('ffmpeg',['-v','error','-y','-i','base.mov','-f','image2pipe','-framerate','30','-i','-','-i','music.wav',
      '-filter_complex',"[0:v][1:v]overlay=format=auto,format=yuv420p[v];[0:a]volume=0.30,highpass=f=80[amb];[amb][2:a]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=9[a]",
      '-map','[v]','-map','[a]','-c:v','libx264','-preset','slow','-crf','19','-maxrate','10M','-bufsize','20M','-profile:v','high','-r','30','-c:a','aac','-b:a','192k','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
    for(let f=0;f<960;f++){await pg.evaluate(t=>seek(t),f/30);const buf=await pg.screenshot({type:'png',omitBackground:true});
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
