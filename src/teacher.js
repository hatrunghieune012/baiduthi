import * as THREE from 'three';

export function createTeacherActions(camera,{scene,cube,materials}) {
  scene.add(camera);
  const hand=new THREE.Group();camera.add(hand);hand.visible=false;
  cube(0,0,0,0.13,0.23,0.13,'#dfb18b',false,hand);
  cube(0,-0.2,0.02,0.16,0.24,0.16,'#dce8da',false,hand);
  const chalk=cube(0.035,0.12,-0.025,0.025,0.11,0.025,'#fff9d9',false,hand);
  hand.traverse(object=>{if(object.isMesh){object.material=object.material.clone();object.material.depthTest=false;object.material.depthWrite=false;materials.set(`hand-${object.id}`,object.material);object.renderOrder=10;object.raycast=()=>{};object.receiveShadow=false;}});
  let kind='',remaining=0,total=1;
  function start(action,duration){kind=action;total=duration??(action==='write'?2.8:action==='type'?2:0.9);remaining=total;hand.visible=true;chalk.visible=action==='write';}
  function update(dt,time){
    if(remaining<=0){hand.visible=false;return;}
    remaining=Math.max(0,remaining-dt);const blend=Math.min(1,(total-remaining)*6,remaining*6);
    hand.position.set(0.31,-0.53+blend*0.2,-0.56);hand.rotation.set(-0.3,0,-0.25);
    if(kind==='write'){hand.position.x+=Math.sin(time*9)*0.07;hand.position.y+=Math.cos(time*12)*0.04;}
    else if(kind==='type'){hand.position.y-=0.07+Math.sin(time*14)*0.025;hand.rotation.x=-0.9;}
    else if(kind==='sigh'){hand.position.set(0.24,-0.31+Math.sin(time*2)*0.015,-0.43);hand.rotation.set(-0.55,0,-0.7);}
    else hand.rotation.z+=Math.sin(time*9)*0.18;
  }
  return {start,update,reset(){remaining=0;hand.visible=false;},get active(){return remaining>0;}};
}
