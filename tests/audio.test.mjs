import test from 'node:test';
import assert from 'node:assert/strict';
import { createClassroomAudio } from '../src/audio.js';

test('music continues through menus while transient sounds pause; mute and dispose stop all voices',async()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'window');
  let context;const sources=[],buffers=[];
  const node=()=>({connect(){},disconnect(){this.disconnected=true;}});
  class AudioContext {
    constructor(){context=this;this.state='suspended';this.sampleRate=100;this.destination={};}
    createBuffer(_channels,length){const data=new Float32Array(length);buffers.push(data);return {getChannelData:()=>data};}
    createBufferSource(){const source={...node(),start(){this.started=true;},stop(){this.stopped=true;}};sources.push(source);return source;}
    createBiquadFilter(){return {...node(),frequency:{value:0},Q:{value:0}};}
    createGain(){return {...node(),gain:{value:0}};}
    async resume(){this.state='running';}
    async suspend(){this.state='suspended';}
    async close(){this.state='closed';}
  }
  Object.defineProperty(globalThis,'window',{value:{AudioContext},configurable:true});
  const audio=createClassroomAudio();
  try {
    audio.startWriting();assert.equal(sources.length,0,'no audio created before unlock');
    await audio.unlock();audio.startWriting();audio.startWriting();audio.whisper();audio.whisper();assert.equal(sources.length,2);
    audio.pause();assert.equal(context.state,'running');assert.equal(sources[0].stopped,true);assert.equal(sources[1].stopped,true);
    audio.resume();await audio.startMusic();assert.equal(context.state,'running');
    assert.equal(sources.length,3,'music starts once when the game resumes');
    audio.pause();audio.resume();await audio.startMusic();assert.equal(sources.length,3,'menu choices do not restart music');assert.equal(sources[2].stopped,undefined);
    assert.ok(buffers[1].some(sample=>Math.abs(sample)>0.01),'music buffer contains audible samples');
    audio.stopWriting();assert.equal(sources[0].stopped,true);assert.equal(sources[0].disconnected,true);
    audio.setEnabled(false);assert.equal(sources[1].stopped,true);assert.equal(sources[2].stopped,true);audio.startWriting();assert.equal(sources.length,3);
    audio.setEnabled(true);await audio.startMusic();audio.startWriting();assert.equal(sources.length,5);audio.dispose();assert.equal(context.state,'closed');assert.equal(sources[4].stopped,true);assert.equal(sources[4].disconnected,true);
    audio.startWriting();await audio.unlock();assert.equal(sources.length,5);
  } finally {audio.dispose();if(previous)Object.defineProperty(globalThis,'window',previous);else delete globalThis.window;}
});
