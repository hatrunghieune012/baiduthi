import test from 'node:test';
import assert from 'node:assert/strict';
import { AdaptiveQuality, defaultQuality, movePlayer, blocked, nextStudentState } from '../src/logic.js';
test('device defaults use conservative limits',()=>{assert.equal(defaultQuality({hardwareConcurrency:4}),'low');assert.equal(defaultQuality({hardwareConcurrency:12,deviceMemory:16}),'medium');});
test('automatic quality requires sustained low FPS, cooldown and honors manual mode',()=>{
 const a=new AdaptiveQuality('high');for(let i=0;i<7;i++)assert.equal(a.sample(20,2,true),'high');assert.equal(a.sample(20,2,true),'medium');
 for(let i=0;i<12;i++)assert.equal(a.sample(20,2,true),'medium');assert.equal(a.sample(20,2,true),'low');
 const b=new AdaptiveQuality('high');for(let i=0;i<100;i++)assert.equal(b.sample(10,2,false),'high');
});
test('auto recovery needs long stable FPS and never raises above Medium',()=>{const a=new AdaptiveQuality('low');for(let i=0;i<19;i++)assert.equal(a.sample(60,2,true),'low');assert.equal(a.sample(60,2,true),'medium');for(let i=0;i<100;i++)assert.equal(a.sample(60,2,true),'medium');});
test('collisions stop tunnelling, allow wall sliding and respect open doors',()=>{
 const walls=[{minX:1,maxX:1.2,minZ:-4,maxZ:4}];const p={x:0,z:0};movePlayer(p,5,1,walls);assert.ok(p.x<0.77);assert.ok(p.z>0.9);assert.equal(blocked(1,0,walls),true);walls[0].enabled=false;movePlayer(p,2,0,walls);assert.ok(p.x>2);
});
test('student events persist until resolved and all states are reachable',()=>{assert.equal(nextStudentState('Sleeping',()=>0.9),'Sleeping');assert.deepEqual([0,0.15,0.22,0.3,0.9].map(n=>nextStudentState('Listening',()=>n)),['Talking','Sleeping','Playing','RaisingHand','Listening']);});
