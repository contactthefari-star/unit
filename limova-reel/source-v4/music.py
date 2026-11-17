import numpy as np, wave
SR=44100; T=30.0; n=int(SR*T); t=np.arange(n)/SR
BPM=120; B=60/BPM
out=np.zeros(n); rng=np.random.default_rng(7)
def add(sig,at,g=1.0):
    i=int(at*SR); j=min(n,i+len(sig)); out[i:j]+=g*sig[:j-i]
def lp(x,a):  # one-pole lowpass (a scalar or per-sample)
    a=np.broadcast_to(np.asarray(a,float),x.shape)
    y=np.empty_like(x); s=0.0
    for k in range(len(x)): s+=a[k]*(x[k]-s); y[k]=s
    return y
# kick
kt=np.arange(int(.45*SR))/SR
f=48+90*np.exp(-kt*28); kick=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-kt*7.5); kick+=0.25*np.sin(2*np.pi*np.cumsum(f)/SR*2)*np.exp(-kt*30)
# hat
ht=np.arange(int(.06*SR))/SR; hn=rng.standard_normal(len(ht)); hat=(hn-lp(hn,0.6))*np.exp(-ht*70)
# clap-ish snap
st=np.arange(int(.2*SR))/SR; sn=rng.standard_normal(len(st)); snap=(sn-lp(sn,0.15))*np.exp(-st*22)
# pad: Am9 - Fmaj7 - Cmaj7 - G6 (2s each)
ch=[[57,60,64,67,71],[53,57,60,64,69],[48,55,59,64,67],[55,59,62,64,71]]
roots=[45,41,48,43]
mf=lambda m:440*2**((m-69)/12)
pad=np.zeros(n); bass=np.zeros(n)
for bar in range(int(T/2)+1):
    c=ch[bar%4]; a=bar*2.0
    seg=np.arange(int(2.0*SR))/SR
    env=np.minimum(1,seg/0.5)*np.minimum(1,(2.0-seg)/0.4)
    s=np.zeros(len(seg))
    for m in c:
        for dt in (-0.08,0.08): s+=np.sin(2*np.pi*mf(m+dt)*seg)+0.3*np.sin(2*np.pi*2*mf(m+dt)*seg)
    add(s*env/12,a,1)
    r=mf(roots[bar%4]); b=np.sin(2*np.pi*r*seg)*np.minimum(1,seg/0.02)*np.minimum(1,(2.0-seg)/0.1)
    i=int(a*SR); j=min(n,i+len(b)); bass[i:j]+=b[:j-i]
# arrangement
def beats(a,b): return np.arange(a,b-1e-6,B)
for x in beats(3.0,14.0): add(kick,x,0.95)
for x in beats(15.0,26.0): add(kick,x,1.0)
for x in beats(6.0,14.0): add(hat,x+B/2,0.28)
for x in beats(15.0,26.0): add(hat,x+B/2,0.35)
for x in np.arange(17.0,26.0,2*B): add(snap,x+B,0.18)
# riser 11->13
rl=int(1*SR); rt=np.arange(rl)/SR; rn=rng.standard_normal(rl)
riser=(rn-lp(rn,0.05+0.5*rt))*(rt)**2.2; add(riser,14.0,0.4)
add(riser[::-1]*0.6,1.0,0.25)
# impacts
it=np.arange(int(2.5*SR))/SR; boom=np.sin(2*np.pi*(38+40*np.exp(-it*6))*it)*np.exp(-it*1.8)
for x,g in ((0.0,.5),(1.5,.9),(15.0,1.0),(16.45,.6),(26.0,1.0)): add(boom,x,g)
padmask=np.ones(n); padmask[int(14*SR):int(15*SR)]=np.linspace(1,.3,int(1*SR))
mix=out+pad*0.0
# pad is added via add() into out already; bass ducked under kick lightly
duck=np.ones(n)
for x in list(beats(3.0,14.0))+list(beats(15.0,26.0)):
    i=int(x*SR); L=int(.25*SR); duck[i:i+L]=np.minimum(duck[i:i+L],0.35+0.65*np.linspace(0,1,L)**.6)
bl=bass*0.32*duck*(t>=3.0)*((t<14)|(t>=15))*(t<26)
mix=out*padmask+bl
# end fade
mix*=np.clip((30-t)/2.5,0,1)
mix=np.tanh(mix*1.4)/1.4
mix/=np.max(np.abs(mix))*1.12
st=np.stack([mix,mix],1)
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
