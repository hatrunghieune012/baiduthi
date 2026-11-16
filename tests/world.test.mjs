import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createGame } from '../src/world.js';
import { createBubbles, rectanglesOverlap } from '../src/bubbles.js';
import { LESSONS } from '../src/lessons.js';

class Element extends EventTarget {
  constructor(){super();this.children=[];this.style={};this.hidden=false;this.textContent='';this.listeners=new Map();}
  addEventListener(name,fn){super.addEventListener(name,fn);if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
  removeEventListener(name,fn){super.removeEventListener(name,fn);this.listeners.get(name)?.delete(fn);}
  setAttribute(){}
  append(child){this.children.push(child);child.parent=this;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
  getContext(){return new Proxy({}, {get(target,key){return target[key]??(()=>{});},set(target,key,value){target[key]=value;return true;}});}
}

test('CPU scene integration: doorway, teacher desk and chair, live students, events, pause/reset/dispose',()=>{
  const previous=new Map();
  const install=(key,value)=>{previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
  const document=new Element();document.body=new Element();document.createElement=()=>new Element();document.hidden=false;document.pointerLockElement=null;
  document.exitPointerLock=()=>{document.pointerLockElement=null;document.dispatchEvent(new Event('pointerlockchange'));};
  const window=new Element(),canvas=new Element();
  canvas.requestPointerLock=()=>{document.pointerLockElement=canvas;document.dispatchEvent(new Event('pointerlockchange'));return Promise.resolve();};
  const frames=new Map();let frameID=0,time=0,renderCount=0,scene,camera;
  install('document',document);install('window',window);install('innerWidth',1280);install('innerHeight',720);install('devicePixelRatio',1);
  install('requestAnimationFrame',fn=>{frames.set(++frameID,fn);return frameID;});install('cancelAnimationFrame',id=>frames.delete(id));
  const renderer={shadowMap:{},info:{render:{calls:0,triangles:0},memory:{geometries:0,textures:0}},setPixelRatio(){},setSize(){},render(s,c){scene=s;camera=c;scene.updateMatrixWorld();renderCount++;},renderLists:{dispose(){}},dispose(){this.disposed=true;}};
  let game;const prompts=[],objectives=[],metrics=[];
  const key=(code,type='keydown')=>document.dispatchEvent(Object.assign(new Event(type),{code,repeat:false}));
  const tick=(seconds)=>{for(let i=0;i<Math.ceil(seconds*60);i++){const callbacks=[...frames.values()];frames.clear();time+=1000/60;callbacks.forEach(fn=>fn(time));assert.ok(frames.size<=1,'only one scheduled loop');}};
  try {
    game=createGame(canvas,{preference:'medium',toast(){},pauseMenu(){game.pause();},interaction(target){if(target==='door')game.toggleDoor();},onStats(){},onPrompt:text=>prompts.push(text),onObjective:text=>objectives.push(text),onClassroom:m=>metrics.push({...m})},{rendererFactory:()=>renderer});
    assert.equal(game.students.length,10);assert.deepEqual(game.students.map(student=>student.name),['Hiếu','Minh Lý','Anh Tuấn','Anh Kiên','Ngọc Hùng','Thiên Lương','Đức Khang','Tuấn Anh','Quang Diệu','Đức Lợi']);
    assert.equal(new Set(game.students.map(student=>student.id)).size,10);assert.equal(document.body.children.length,1);
    game.resume();game.resume();tick(0.2);assert.match(prompts.at(-1),/Mở cửa/);
    key('KeyW');tick(1);key('KeyW','keyup');assert.ok(camera.position.x>6.5,'closed door blocks');
    key('KeyE');key('KeyE','keyup');key('KeyW');tick(0.4);key('KeyW','keyup');assert.ok(camera.position.x<6.1,'open door permits entry');
    assert.ok(Math.abs(game.students[0].head.rotation.y)>0,'idle head moves');
    let teacherDesk, teacherChair,laptopBase,laptopDisplay,instructionBoard;
    scene.traverse(object=>{if(object.userData.target==='laptop')teacherDesk=object;if(object.position.z===-6.75&&object.position.y===0.46)teacherChair=object;if(object.name==='teacher-laptop-base')laptopBase=object;if(object.name==='teacher-laptop-display')laptopDisplay=object;if(object.name==='instruction-board')instructionBoard=object;});
    assert.ok(teacherDesk,'teacher desk remains interactive');
    assert.ok(teacherChair,'teacher chair is present');
    assert.ok(instructionBoard,'a 3D game guide is mounted beside the entrance');
    assert.ok(instructionBoard.position.x>6.25&&instructionBoard.position.z>-4.2,'the guide sits on the entry-side wall beside the door');
    assert.ok(teacherChair.position.z<laptopBase.position.z&&laptopBase.position.z<laptopDisplay.position.z,'keyboard is between chair and screen');
    assert.ok(laptopDisplay.getWorldDirection(new THREE.Vector3()).z< -0.95,'screen faces the teacher chair');
    camera.position.set(-1.8,1.65,-3.8);
    const beforeDialogue=camera.position.clone();
    const beforeDialogueRotation=camera.quaternion.clone();
    const dialogue=game.beginDialogue(0);assert.equal(dialogue.name,game.students[0].name);assert.equal(dialogue.speaker,'Thầy cô');assert.equal(dialogue.choices.length,2);assert.ok([0,1].includes(dialogue.autoChoice));
    assert.equal(game.beginDialogue(1),null,'second conversation cannot start');
    tick(1/60);assert.ok(camera.quaternion.angleTo(beforeDialogueRotation)<0.2,'dialogue camera does not snap on the first frame');
    tick(2);const conversationPosition=camera.position.clone();
    assert.ok(camera.position.z<game.students[0].group.position.z-1.2,'dialogue camera faces the student from the front');
    assert.ok(Math.abs(camera.position.x-game.students[0].group.position.x)<0.3,'student is centered in the dialogue frame');
    key('KeyW');tick(0.4);key('KeyW','keyup');assert.ok(camera.position.distanceTo(conversationPosition)<0.01,'movement is locked during dialogue');
    const stressBefore=game.events.metrics.stress;
    assert.ok(game.chooseDialogue(0,dialogue.autoChoice));
    assert.equal(game.events.metrics.stress,stressBefore,'personal dialogue does not alter distraction-event stress');
    assert.equal(game.students[0].state,dialogue.autoChoice===0?'Listening':'Confused');game.endDialogue();tick(2);
    assert.ok(camera.position.distanceTo(beforeDialogue)<0.03,'camera returns to its original position');
    camera.position.set(4.6,1.65,-6.1);
    const beforeSeat=camera.position.clone();
    assert.equal(game.sitDown(),true);tick(2);assert.equal(game.seated,true);
    assert.ok(camera.position.distanceTo(new THREE.Vector3(3.5,1.25,-6.65))<0.04,'camera settles onto teacher chair');
    game.useLaptop();assert.equal(game.projected,true);
    game.leaveComputer();assert.equal(game.projected,false);
    game.standUp();tick(2);assert.equal(game.seated,false);
    assert.ok(camera.position.distanceTo(beforeSeat)<0.04,'standing restores a safe position');
    assert.equal(game.greetClass(),true);assert.equal(game.phase,'greeted');
    assert.equal(game.seatClass(),true);assert.equal(game.phase,'lesson');
    const slide=game.nextSlide();assert.equal(game.laptop.slide,0);assert.deepEqual(slide,['JAVASCRIPT CƠ BẢN','Biến · Điều kiện · Vòng lặp']);
    // V3 board integration: use the same running loop, preserve code against slides.
    camera.position.set(0,1.65,-5.2);key('ArrowRight');tick(0.9);key('ArrowRight','keyup');
    let boardMesh;scene.traverse(object=>{if(object.userData.target==='board')boardMesh=object;});
    assert.ok(boardMesh.getWorldDirection(new THREE.Vector3()).z>0.99,'board faces the class, not mirrored');
    for(const [index,lesson] of LESSONS.entries()){
      if(index===0){assert.equal(game.sitDown(),true);tick(2);assert.equal(game.teachFromComputer(lesson.id),true);}
      else assert.equal(game.teach(lesson.id),true);
      tick(1);
      if(index===0){assert.equal(game.currentLesson,1);assert.equal(game.events.active?.kind,'talking');game.resolve(3,0);game.resolve(4,0);tick(1);assert.equal(game.events.active?.kind,'question1');game.resolve(8,0);tick(1);assert.equal(game.events.active?.kind,'phoneAudio');game.resolve(6,0);}
      if(index===1){assert.equal(game.currentLesson,2);assert.equal(game.events.active?.kind,'sleeping');game.resolve(1,0);game.resolve(6,0);tick(1);assert.equal(game.events.active?.kind,'question2');game.resolve(9,0);tick(1);assert.equal(game.events.active?.kind,'spilling');game.resolve(4,0);}
      if(index===2){assert.equal(game.currentLesson,3);assert.equal(game.events.active?.kind,'playing');game.resolve(2,0);game.resolve(7,0);tick(1);assert.equal(game.events.active?.kind,'question');game.resolve(5,0);tick(1);assert.equal(game.events.active?.kind,'question3');game.resolve(0,0);tick(1);assert.equal(game.events.active?.kind,'gameArgument');game.resolve(0,0);game.resolve(7,0);}
      if(index===0)assert.equal(game.teachFromComputer(lesson.id),true);
      else assert.equal(game.teach(lesson.id),true);
      tick(0.3);
      const beforePause=game.lessonState;game.pause();tick(4);assert.deepEqual(game.lessonState,beforePause);game.resume();
      tick(6);assert.equal(game.lessonState.allLinesVisible,true);
      const version=boardMesh.material.map.version;game.nextSlide();assert.ok(boardMesh.material.map.version>version,'computer slide is projected onto the board');
      game.leaveComputer();assert.equal(game.lessonState.allLinesVisible,true,'stopping projection preserves lesson progress');
      assert.equal(game.completeLesson(),true);
      if(index===0){game.standUp();tick(2);}
    }
    assert.equal(game.lessonState.readyForAssessment,true);
    assert.equal(game.events.finished,true);assert.equal(game.resolved,10);
    assert.equal(game.events.distractionOccurred,10);assert.equal(game.events.distractionProcessed,10);assert.equal(game.events.metrics.stress,90);
    assert.equal(game.phase,'examReady');
    const originalRandom=Math.random;let randomCalls=0;Math.random=()=>{randomCalls++;return 0.25;};
    let exam;try{exam=game.takeExam();assert.equal(game.takeExam(),exam);}finally{Math.random=originalRandom;}
    assert.equal(randomCalls,1);assert.equal(exam.outcome,'good');assert.equal(exam.rows.length,10);assert.equal(exam.passed,10);assert.equal(game.events.metrics.stress,40);assert.equal(game.phase,'exam');
    assert.equal(game.finishClass(),true);assert.equal(game.phase,'farewell');
    const pausedTime=game.events.time;game.pause();const renders=renderCount;tick(10);assert.equal(renderCount,renders);assert.equal(game.events.time,pausedTime);assert.equal(frames.size,0);
    game.resume();tick(0.2);assert.equal(frames.size,1);
    const geometry=new Set(),material=new Set();scene.traverse(o=>{if(o.geometry&&!o.isSprite)geometry.add(o.geometry);if(o.material)material.add(o.material);});
    const baseline=game.diagnostics();
    for(let i=0;i<20;i++){game.reset();tick(0.1);}
    const after=game.diagnostics();assert.equal(after.allocatedGeometries,baseline.allocatedGeometries);assert.equal(after.allocatedMaterials,baseline.allocatedMaterials);assert.equal(after.allocatedTextures,baseline.allocatedTextures);assert.equal(document.body.children.length,1);
    assert.equal(game.events.completed.size,0);assert.equal(game.laptop.slide,0);
    assert.equal(game.lessonState.completedCount,0);assert.equal(game.lessonState.readyForAssessment,false);
    let disposed=0;geometry.forEach(g=>g.addEventListener('dispose',()=>disposed++));
    game.dispose();assert.equal(disposed,geometry.size);assert.equal(document.body.children.length,0);assert.equal(frames.size,0);assert.equal(renderer.disposed,true);
    assert.equal([...document.listeners.values()].reduce((n,s)=>n+s.size,0),0);assert.equal([...window.listeners.values()].reduce((n,s)=>n+s.size,0),0);
    assert.ok(objectives.length>3);assert.ok(metrics.length>3);
  } finally {
    game?.dispose();for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});

test('bubble overlap check leaves spacing between adjacent bubbles',()=>{
  const a={x:0,y:0,w:218,h:86};assert.equal(rectanglesOverlap(a,{x:100,y:20,w:218,h:86}),true);assert.equal(rectanglesOverlap(a,{x:230,y:0,w:218,h:86}),false);
});

test('bubble pool expires on game time, rejects overlaps and respects wall occlusion',()=>{
  const keys=['document','innerWidth','innerHeight'],saved=keys.map(key=>Object.getOwnPropertyDescriptor(globalThis,key));
  const document=new Element();document.body=new Element();document.createElement=()=>new Element();
  keys.forEach((key,i)=>Object.defineProperty(globalThis,key,{value:[document,1280,720][i],writable:true,configurable:true}));
  let bubbles;
  try {
    const camera=new THREE.PerspectiveCamera(70,1280/720,0.1,30);camera.position.set(0,1.6,0);camera.updateMatrixWorld();
    const students=Array.from({length:4},(_,i)=>{const head=new THREE.Group();head.position.set(i*0.05,1.3,-3);return {name:`Student ${i}`,head};});
    const wall=new THREE.Mesh(new THREE.BoxGeometry(5,5,0.1),new THREE.MeshBasicMaterial());wall.position.set(0,1.5,-1.5);wall.updateMatrixWorld();
    const occluders=[];bubbles=createBubbles(students,camera,occluders);
    assert.equal(bubbles.say(0,'Hello',3),true);assert.equal(bubbles.say(1,'Hello',3),true);assert.equal(bubbles.say(2,'Hello',3),true);assert.equal(bubbles.say(3,'Overflow',3),false);
    const entries=document.body.children[0].children;bubbles.update(1);assert.equal(entries.filter(e=>!e.hidden).length,1,'overlapping bubbles hidden');
    occluders.push(wall);bubbles.update(2);assert.equal(entries.filter(e=>!e.hidden).length,0,'wall occludes bubbles');occluders.length=0;
    bubbles.update(4);assert.equal(entries.filter(e=>!e.hidden).length,0,'timed expiration');
    bubbles.clear(20);bubbles.say(0,'New event',3);bubbles.update(20.1);assert.equal(entries.filter(e=>!e.hidden).length,1);
    bubbles.hide();assert.equal(entries.filter(e=>!e.hidden).length,0);wall.geometry.dispose();wall.material.dispose();
  } finally {bubbles?.dispose();keys.forEach((key,i)=>{if(saved[i])Object.defineProperty(globalThis,key,saved[i]);else delete globalThis[key];});}
});
