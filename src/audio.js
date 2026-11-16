// Synthesized classroom sounds and a quiet looping chord progression; no downloads or timers.
export function createClassroomAudio() {
  let context,source,gain,filter,buffer,enabled=true,disposed=false;
  let chalkSource,chalkFilter,chalkGain;
  let musicBuffer,musicSource,musicGain,playing=false,musicStarting=false,mood='chill';
  async function unlock(){
    if(disposed||!enabled)return;
    try {
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      if(!context){context=new Audio();buffer=context.createBuffer(1,context.sampleRate*1.2,context.sampleRate);const data=buffer.getChannelData(0);
        for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(0.25+0.75*Math.pow(Math.sin(i/context.sampleRate*17),2));
        const seconds=16,rate=context.sampleRate;
        musicBuffer=context.createBuffer(1,rate*seconds,rate);
        const music=musicBuffer.getChannelData(0);
        const chords=[[261.63,329.63,392,493.88],[220,261.63,329.63,392],[174.61,261.63,349.23,440],[196,293.66,392,493.88]];
        for(let i=0;i<music.length;i++){
          const t=i/rate,step=Math.floor(t/4),local=t%4;
          const fade=Math.min(1,local/0.3,(4-local)/0.7);
          let sample=0;
          for(const frequency of chords[step]) sample+=Math.sin(2*Math.PI*frequency*t)*0.65+0.12*Math.sin(4*Math.PI*frequency*t);
          const note=chords[step][Math.floor(local*2)%4]*2;
          const noteTime=local%0.5;
          sample+=0.8*Math.sin(2*Math.PI*note*t)*Math.exp(-noteTime*7);
          music[i]=sample*0.15*Math.max(0,fade);
        }
      }
      if(context.state==='suspended')await context.resume();
    } catch { /* Muted/unsupported audio never prevents gameplay. */ }
  }
  function stop(){if(source){try{source.stop();}catch{}source.disconnect();source=null;}filter?.disconnect();gain?.disconnect();filter=null;gain=null;}
  function whisper(){if(!enabled||!context||source||disposed)return;source=context.createBufferSource();source.buffer=buffer;source.loop=true;filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=900;filter.Q.value=0.7;gain=context.createGain();gain.gain.value=0.018;source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start();}
  function startWriting(){
    if(!enabled||!context||chalkSource||disposed)return;
    chalkSource=context.createBufferSource();chalkSource.buffer=buffer;chalkSource.loop=true;
    chalkFilter=context.createBiquadFilter();chalkFilter.type='highpass';chalkFilter.frequency.value=1800;
    chalkGain=context.createGain();chalkGain.gain.value=0.012;
    chalkSource.connect(chalkFilter);chalkFilter.connect(chalkGain);chalkGain.connect(context.destination);chalkSource.start();
  }
  function stopWriting(){if(chalkSource){try{chalkSource.stop();}catch{}chalkSource.disconnect();chalkSource=null;}chalkFilter?.disconnect();chalkGain?.disconnect();chalkFilter=null;chalkGain=null;}
  function stopMusic(){if(musicSource){try{musicSource.stop();}catch{}musicSource.disconnect();musicSource=null;}musicGain?.disconnect();musicGain=null;}
  async function startMusic(){playing=true;if(musicSource||musicStarting)return;musicStarting=true;
    try{await unlock();if(!playing||!enabled||disposed||!context||musicSource)return;
      musicSource=context.createBufferSource();musicSource.buffer=musicBuffer;musicSource.loop=true;
      musicGain=context.createGain();musicGain.gain.value=mood==='piano'?0.19:mood==='tense'?0.27:0.35;
      musicSource.connect(musicGain);musicGain.connect(context.destination);musicSource.start();
    }finally{musicStarting=false;}
  }
  return {unlock,whisper,stop,startWriting,stopWriting,startMusic,get musicActive(){return Boolean(musicSource);},setMood(value){mood=value;if(musicGain)musicGain.gain.value=mood==='piano'?0.19:mood==='tense'?0.27:0.35;},pause(){stop();stopWriting();},resume(){void startMusic();},setEnabled(value){enabled=value;if(!value){stop();stopWriting();stopMusic();}else if(playing)void startMusic();},dispose(){disposed=true;playing=false;stop();stopWriting();stopMusic();context?.close().catch(()=>{});buffer=null;musicBuffer=null;}};
}
