import * as THREE from 'three';

export const NPC_CHAT_DURATION = 4000;

export function rectanglesOverlap(a,b) {
  return a.x < b.x+b.w+10 && a.x+a.w+10 > b.x && a.y < b.y+b.h+8 && a.y+a.h+8 > b.y;
}

export function createBubbles(students,camera,occluders) {
  const layer=document.createElement('div');layer.className='speech-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);
  // Fixed pool: at most three DOM elements and no per-bubble timers.
  const pool=Array.from({length:3},()=>{
    const element=document.createElement('div');element.className='speech-bubble';element.hidden=true;layer.append(element);
    return {element,student:-1,expires:0,x:0,y:0,w:218,h:86};
  });
  const point=new THREE.Vector3(), projected=new THREE.Vector3(), direction=new THREE.Vector3(), ray=new THREE.Raycaster(), hits=[];
  let time=0;
  function say(student,text,duration=NPC_CHAT_DURATION/1000) {
    const entry=pool.find(b=>b.student===student)||pool.find(b=>b.expires<=time);
    if(!entry)return false;
    entry.student=student;entry.expires=time+duration;entry.element.textContent=`${students[student].name}: ${text}`;return true;
  }
  function update(now) {
    time=now;camera.updateMatrixWorld();const visible=[];
    for(const b of pool) {
      b.element.hidden=true;if(b.student<0||b.expires<=time)continue;
      students[b.student].head.getWorldPosition(point);point.y+=0.5;
      const distance=point.distanceTo(camera.position);if(distance>12||distance<0.2)continue;
      projected.copy(point).project(camera);if(projected.z>1||projected.z< -1)continue;
      direction.subVectors(point,camera.position).normalize();ray.set(camera.position,direction);ray.far=Math.max(0,distance-0.12);
      hits.length=0;ray.intersectObjects(occluders,false,hits);if(hits.length)continue;
      b.w=Math.min(218,innerWidth-24);b.h=86;
      b.x=(projected.x+1)*innerWidth/2-b.w/2;b.y=(1-projected.y)*innerHeight/2-b.h;
      if(b.x<8||b.x+b.w>innerWidth-8||b.y<105||b.y+b.h>innerHeight-70||visible.some(other=>rectanglesOverlap(b,other)))continue;
      b.element.style.transform=`translate(${Math.round(b.x)}px,${Math.round(b.y)}px)`;b.element.hidden=false;visible.push(b);
    }
  }
  function clear(now=0){time=now;pool.forEach(b=>{b.student=-1;b.expires=0;b.element.hidden=true;});}
  return {say,update,clear,remove(student){pool.forEach(b=>{if(b.student===student){b.expires=0;b.element.hidden=true;}});},hide(){pool.forEach(b=>{b.element.hidden=true;});},dispose(){layer.remove();}};
}
