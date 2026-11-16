import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const STUDENT_STATES = Object.freeze({ IDLE:'Idle', LISTENING:'Listening', TALKING:'Talking', SLEEPING:'Sleeping', PLAYING:'Playing', SNACKING:'Snacking', SPILLING:'Spilling', RAISING_HAND:'RaisingHand', ANSWERING:'Answering', WRONG_ANSWER:'WrongAnswer', UNSURE:'Unsure', CONFUSED:'Confused' });
const NAMES=['Hiếu','Minh Lý','Anh Tuấn','Anh Kiên','Ngọc Hùng','Thiên Lương','Đức Khang','Tuấn Anh','Quang Diệu','Đức Lợi'];
const HAIR=['#302d2a','#49382c','#252b30','#594033','#33302c'];
const SKIN=['#e3b28a','#d7a075','#efc5a0','#c98f69'];
const SHIRTS=['#f1ead8','#e5e9dc','#ead9c7','#e8e4d2','#d9e5dc'];

export function createStudents(positions, {scene, cube, box, sphere, material, geometries, materials, textures}) {
  // One 512x256 atlas for every face; UV geometries are shared across all students.
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d');
  const expressions=['calm','happy','talk','sleep','confused','focused','blink','surprise'];
  expressions.forEach((expression,index)=>{
    const ox=(index%4)*128,oy=Math.floor(index/4)*128;
    ctx.save();ctx.translate(ox,oy);ctx.strokeStyle='#382f2a';ctx.fillStyle='#382f2a';ctx.lineWidth=5;ctx.lineCap='round';
    for(const x of [42,86]) {
      ctx.beginPath();
      if(['sleep','blink','happy'].includes(expression)){ctx.moveTo(x-7,56);ctx.lineTo(x+7,56);ctx.stroke();}
      else {ctx.ellipse(x,55,5,expression==='surprise'?10:7,0,0,Math.PI*2);ctx.fill();}
      ctx.beginPath();ctx.moveTo(x-8,expression==='confused'&&x===42?32:37);ctx.lineTo(x+8,38);ctx.stroke();
    }
    ctx.beginPath();
    if(['talk','surprise'].includes(expression)) {ctx.ellipse(64,84,9,12,0,0,Math.PI*2);ctx.fill();}
    else if(expression==='happy'){ctx.arc(64,77,15,0,Math.PI);ctx.stroke();}
    else {ctx.moveTo(54,85);ctx.lineTo(74,expression==='confused'?80:85);ctx.stroke();}
    ctx.restore();
  });
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
  const faceMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:0.1,depthWrite:false});materials.set('student-faces',faceMaterial);
  const faces=expressions.map((_,index)=>{
    const geo=new THREE.PlaneGeometry(0.36,0.35);const uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++) uv.setXY(i,((index%4)+uv.getX(i))/4,(1-Math.floor(index/4)+uv.getY(i))/2);
    geometries.add(geo);return geo;
  });
  const indicators={};
  for(const [symbol,color] of [['!','#e98b38'],['?','#4b9ca3']]){
    const icon=document.createElement('canvas');icon.width=96;icon.height=96;const pen=icon.getContext('2d');
    pen.fillStyle='#fffdf2';pen.beginPath();pen.arc(48,48,42,0,Math.PI*2);pen.fill();pen.strokeStyle=color;pen.lineWidth=7;pen.stroke();
    pen.fillStyle=color;pen.font='bold 64px Arial';pen.textAlign='center';pen.textBaseline='middle';pen.fillText(symbol,48,50);
    const texture=new THREE.CanvasTexture(icon);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
    const spriteMaterial=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false});materials.set(`indicator-${symbol}`,spriteMaterial);indicators[symbol]=spriteMaterial;
  }
  function merged(parts){
    const sources=parts.map(([geo,x,y,z,sx,sy,sz])=>{const g=geo.clone();g.scale(sx,sy,sz);g.translate(x,y,z);return g;});
    const result=mergeGeometries(sources);sources.forEach(g=>g.dispose());geometries.add(result);return result;
  }
  const hairGeometries=[
    merged([[sphere,0,0.13,0.025,0.235,0.15,0.22]]),
    merged([[sphere,0,0.13,0.04,0.24,0.15,0.22],[sphere,0,0.02,0.22,0.12,0.2,0.13]]),
    merged([[sphere,0,0.14,0.04,0.24,0.16,0.22],[box,-0.17,-0.04,0.06,0.12,0.34,0.24],[box,0.17,-0.04,0.06,0.12,0.34,0.24]]),
    merged([[sphere,0,0.15,0.04,0.24,0.13,0.22],[sphere,-0.22,-0.01,0.09,0.1,0.16,0.1],[sphere,0.22,-0.01,0.09,0.1,0.16,0.1]]),
    merged([[sphere,0,0.12,0.04,0.235,0.14,0.22],[sphere,0.09,0.21,0.02,0.14,0.13,0.18]]),
  ];
  const legsGeo=merged([[box,-0.12,0.49,-0.12,0.17,0.18,0.5],[box,0.12,0.49,-0.12,0.17,0.18,0.5],[box,-0.12,0.25,-0.31,0.16,0.42,0.16],[box,0.12,0.25,-0.31,0.16,0.42,0.16]]);
  const standingLegsGeo=merged([[box,-0.12,0.42,0,0.17,0.78,0.18],[box,0.12,0.42,0,0.17,0.78,0.18]]);
  return positions.map(([x,z],index)=>{
    const id=`student-${String(index+1).padStart(2,'0')}`;
    const group=new THREE.Group();group.position.set(x,0,z);group.userData.target=index;group.userData.studentId=id;scene.add(group);
    const torso=new THREE.Group();torso.position.y=0.65;group.add(torso);
    cube(0,0.2,0,0.43,0.47,0.28,SHIRTS[index%SHIRTS.length],false,torso);
    cube(0,0.3,-0.148,0.065,0.2,0.025,index%3===0?'#a94e44':index%3===1?'#47796c':'#c58b48',false,torso);
    const legs=new THREE.Mesh(legsGeo,material('#445d69'));group.add(legs);
    const head=new THREE.Group();head.position.y=0.63;torso.add(head);
    const indicator=new THREE.Sprite(indicators['!']);indicator.position.set(0,0.55,0);indicator.scale.set(0.3,0.3,1);indicator.visible=false;indicator.renderOrder=9;head.add(indicator);
    const skin=new THREE.Mesh(sphere,material(SKIN[index%SKIN.length]));skin.scale.set(0.22,0.25,0.21);skin.castShadow=true;head.add(skin);
    const hair=new THREE.Mesh(hairGeometries[index%5],material(HAIR[index%5]));head.add(hair);
    const face=new THREE.Mesh(faces[0],faceMaterial);face.position.set(0,-0.015,-0.212);face.rotation.y=Math.PI;head.add(face);
    const arms=[-1,1].map(side=>{
      const pivot=new THREE.Group();pivot.position.set(side*0.27,0.37,0);torso.add(pivot);
      cube(0,-0.16,0,0.13,0.38,0.14,SKIN[index%SKIN.length],false,pivot);return pivot;
    });
    const phone=cube(0,-0.31,-0.13,0.12,0.2,0.025,'#344b54',false,arms[1]);phone.visible=false;
    const snack=cube(0,-0.32,-0.13,0.13,0.1,0.12,'#d9a46a',false,arms[0]);snack.visible=false;
    return {id,name:NAMES[index],state:'Idle',group,torso,legs,legsGeo,standingLegsGeo,head,hair,face,arms,arm:arms[1],phone,snack,faces,indicator,indicators,expression:0,cooldown:0,phase:index*1.73};
  });
}

export function setStudentState(student,state) {
  student.state=state;
  student.expression={Idle:0,Listening:5,Talking:2,Sleeping:3,Playing:5,Snacking:1,Spilling:4,RaisingHand:1,Answering:2,WrongAnswer:4,Unsure:4,Confused:4}[state]??0;
  student.torso.position.y=['Answering','WrongAnswer','Unsure'].includes(state)?0.85:0.65;
  student.legs.geometry=['Answering','WrongAnswer','Unsure'].includes(state)?student.standingLegsGeo:student.legsGeo;
  student.phone.visible=state==='Playing';student.snack.visible=state==='Snacking';
  const symbol=['Talking','Sleeping','Playing','Snacking','Spilling'].includes(state)?'!':['RaisingHand','Confused','Unsure','WrongAnswer'].includes(state)?'?':null;
  student.indicator.visible=!!symbol;if(symbol)student.indicator.material=student.indicators[symbol];
  student.face.geometry=student.faces[student.expression];
  student.torso.rotation.set(0,0,0);student.head.rotation.set(0,0,0);
  student.arms.forEach(arm=>arm.rotation.set(0,0,0));
}

// Called by the existing shared game loop, never a loop/timer per student.
export function animateStudents(students,time,camera) {
  for(let i=0;i<students.length;i++) {
    const s=students[i], t=time+s.phase;
    if(s.group.position.distanceToSquared(camera.position)>225) continue;
    const wave=Math.sin(t*1.4), active=s.state;
    s.torso.rotation.x=0.012*wave;s.torso.rotation.z=0;
    s.head.rotation.set(Math.sin(t*0.8)*0.035,Math.sin(t*0.45)*0.1,0);
    s.arms[0].rotation.set(0.3,0,-0.06);s.arms[1].rotation.set(0.35,0,0.06);
    if(active==='Listening' || active==='Idle') {
      // Staggered looking, nodding and writing; feet/seat remain anchored.
      if(t%11<3) {s.head.rotation.x=-0.17;s.arms[1].rotation.x=0.95+wave*0.08;}
      else if(t%11>9) s.head.rotation.x=wave*0.09;
    } else if(active==='Talking') {
      s.head.rotation.y=(i%2===0?-1:1)*(0.9+wave*0.08);
      s.arms[1].rotation.x=0.55+wave*0.13;
    } else if(active==='Sleeping') {
      s.head.rotation.x=-0.48+wave*0.025;s.torso.rotation.x=-0.08;
    } else if(active==='Playing') {
      s.head.rotation.x=-0.25;s.arms[1].rotation.x=1.15+Math.sin(t*4)*0.08;
    } else if(active==='Spilling') {
      s.head.rotation.x=-0.18;s.arms[0].rotation.x=0.85+wave*0.08;s.arms[1].rotation.x=0.95-wave*0.08;
    } else if(active==='Snacking') {
      s.arms[0].rotation.x=0.8+Math.sin(t*3)*0.25;
      s.head.rotation.x=-0.1;
    } else if(active==='RaisingHand'||active==='Answering') {
      s.arms[1].rotation.z=-2.8;s.arms[1].rotation.x=0.1;
    } else if(active==='WrongAnswer'||active==='Unsure') {
      s.head.rotation.x=0.18;s.head.rotation.z=wave*0.05;s.arms[0].rotation.x=0.55;
    } else if(active==='Confused') {s.head.rotation.z=0.15;s.head.rotation.y=wave*0.15;}
    if(s.inDialogue){
      const toward=Math.atan2(camera.position.x-s.group.position.x,s.group.position.z-camera.position.z);
      s.head.rotation.y=Math.max(-0.55,Math.min(0.55,toward));
      s.head.rotation.x+=Math.sin(t*2)*0.035;
    }
    const blinking=active!=='Sleeping' && t%4.7<0.13;
    s.face.geometry=s.faces[blinking?6:s.expression];
  }
}
