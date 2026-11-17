import subprocess,sys
SRC=sys.argv[1]; OUT=sys.argv[2]
# (src_in, dur, z0, z1, cx, cy, extra)
E=[(16.6,2.5,1.00,1.10,.5,.35,''),
   (18.9,2.0,1.38,1.44,.5,.22,''),
   (28.1,2.0,1.00,1.10,.5,.5,''),
   (32.0,1.5,1.10,1.18,.5,.4,''),
   (35.6,1.5,1.05,1.14,.4,.4,''),
   (40.2,1.5,1.12,1.04,.5,.5,''),
   (22.6,2.0,1.00,1.10,.45,.6,''),
   (47.1,2.5,1.05,1.18,.45,.3,''),
   (2.0,2.5,1.10,1.30,.35,.55,''),
   (61.2,2.5,1.00,1.12,.5,.3,''),
   (56.1,2.5,1.04,1.14,.5,.4,''),
   (12.1,3.0,1.00,1.08,.5,.4,''),
   (52.1,4.0,1.10,1.20,.5,.5,',gblur=sigma=26,eq=brightness=-0.10')]
fc=[];cat=''
for i,(s,d,z0,z1,cx,cy,ex) in enumerate(E):
    N=int(round(d*30))
    fc.append(f"[0:v]trim=start={s}:duration={d},setpts=PTS-STARTPTS,fps=30,scale=2160:3840:flags=lanczos,"
              f"zoompan=z='{z0}+({z1}-{z0})*on/{N}':x='(iw-iw/zoom)*{cx}':y='(ih-ih/zoom)*{cy}':d=1:s=1080x1920:fps=30,"
              f"trim=end_frame={N},setsar=1{ex}[v{i}]")
    fc.append(f"[0:a]atrim=start={s}:duration={d},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d-0.03}:d=0.03[a{i}]")
    cat+=f"[v{i}][a{i}]"
fc.append(f"{cat}concat=n={len(E)}:v=1:a=1[vc][ac]")
fc.append("[vc]eq=contrast=1.07:brightness=-0.015:saturation=0.86:gamma=0.98,"
          "colorbalance=rs=-0.02:bs=0.03:rh=0.03:bh=-0.02,unsharp=5:5:0.55,vignette=PI/5,"
          "noise=alls=6:allf=t,format=yuv420p[vo]")
cmd=['ffmpeg','-v','error','-y','-i',SRC,'-filter_complex',';'.join(fc),'-map','[vo]','-map','[ac]',
     '-c:v','libx264','-crf','14','-preset','medium','-c:a','pcm_s16le',OUT]
subprocess.run(cmd,check=True)
