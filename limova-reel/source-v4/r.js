const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{
  const [,,mode,out]=process.argv;
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
  pg.on('pageerror',e=>console.error('PAGEERR',e.message));
  await pg.goto('file://'+path.resolve('film.html'),{waitUntil:'networkidle'});await pg.evaluate(()=>window.ready);
  if(mode==='stills'){const ts=out.split(',').map(Number);
    for(const t of ts){await pg.evaluate(t=>seek(t),t);await pg.screenshot({path:`st_${t}.png`});}
  } else {
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-i','-','-i','music.wav','-map','0:v','-map','1:a',
      '-c:v','libx264','-preset','slow','-crf','18','-maxrate','12M','-bufsize','24M','-profile:v','high','-pix_fmt','yuv420p',
      '-af','loudnorm=I=-14:TP=-1.0','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
    for(let f=0;f<900;f++){await pg.evaluate(t=>seek(t),f/30);const buf=await pg.screenshot({type:'jpeg',quality:96});
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
