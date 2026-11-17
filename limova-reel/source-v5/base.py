import subprocess,sys
SRC=sys.argv[1]; OUT=sys.argv[2]
# (src_in, dur, z0, z1, cx, cy)
E=[(28.0,3.2,1.00,1.10,.5,.45),   # arrivée — hook
   (16.6,3.2,1.12,1.22,.5,.25),   # orateur — "l'IA."
   (40.0,3.0,1.02,1.10,.5,.5),    # foule
   (47.0,3.0,1.04,1.12,.45,.3),   # homme manteau
   (22.4,3.0,1.00,1.08,.45,.6),   # assis
   (61.0,3.0,1.00,1.08,.5,.3),    # Nathan/laptop
   (35.5,3.0,1.04,1.12,.4,.4),    # bar
   (31.75,3.0,1.06,1.14,.5,.4),   # discussion
   (55.6,3.0,1.04,1.12,.5,.4),    # foule sourire
   (2.0,4.6,1.10,1.24,.4,.5)]     # téléphone — CTA
fc=[];cat=''
for i,(s,d,z0,z1,cx,cy) in enumerate(E):
    N=int(round(d*30))
    fc.append(f"[0:v]trim=start={s}:duration={d},setpts=PTS-STARTPTS,fps=30,hqdn3d=1.5:1.5:4:4,scale=2160:3840:flags=lanczos,"
              f"zoompan=z='{z0}+({z1}-{z0})*on/{N}':x='(iw-iw/zoom)*{cx}':y='(ih-ih/zoom)*{cy}':d=1:s=1080x1920:fps=30,trim=end_frame={N},setsar=1[v{i}]")
    fc.append(f"[0:a]atrim=start={s}:duration={d},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={d-0.04}:d=0.04[a{i}]")
    cat+=f"[v{i}][a{i}]"
fc.append(f"{cat}concat=n={len(E)}:v=1:a=1[vc][ac]")
fc.append("[vc]unsharp=5:5:0.7:5:5:0,eq=contrast=1.10:brightness=-0.03:saturation=0.86:gamma=0.97,"
          "colorbalance=rs=-0.03:bs=0.02:rh=0.03:bh=-0.02,vignette=PI/6,noise=alls=4:allf=t,format=yuv420p[vo]")
subprocess.run(['ffmpeg','-v','error','-y','-i',SRC,'-filter_complex',';'.join(fc),'-map','[vo]','-map','[ac]',
     '-c:v','libx264','-crf','14','-preset','medium','-c:a','pcm_s16le',OUT],check=True)
