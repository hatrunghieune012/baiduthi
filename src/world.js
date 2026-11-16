import * as THREE from 'three';
import { createLaptop, SLIDES } from './laptop.js';
import { ClassroomProgress } from './classroom-progress.js';
import { createBubbles } from './bubbles.js';
import { LessonEvents, applyEffects } from './events.js';
import { CHATTER, PERSONAL_DIALOGUES } from './dialogues/classroom.js';
import { createClassroomAudio } from './audio.js';
import { createTeacherActions } from './teacher.js';
import { addClassroomDetails } from './classroom-details.js';
import { createLessonBoard } from './lesson-board.js';
import { LESSONS } from './lessons.js';
import { createStudents, setStudentState, animateStudents } from './students.js';
import { PRESETS, AdaptiveQuality, defaultQuality, movePlayer, blocked } from './logic.js';

export function createGame(canvas, ui, options={}) {
  const {rendererFactory=options=>new THREE.WebGLRenderer(options),audio:sharedAudio}=options;
  const ownsAudio=!sharedAudio;
  const audio=sharedAudio??createClassroomAudio();
  const renderer = rendererFactory({ canvas, antialias: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#d8e4d9');
  scene.fog=new THREE.Fog('#d8e4d9',17,38);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 45); camera.rotation.order = 'YXZ';
  const materials = new Map(), geometries = new Set(), textures = new Set(), colliders = [], interactables = [], occluders=[];
  const box = new THREE.BoxGeometry(1, 1, 1), sphere = new THREE.SphereGeometry(1, 10, 7);
  geometries.add(box); geometries.add(sphere);
  function material(color) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshLambertMaterial({ color }));
    return materials.get(color);
  }
  function collider(x, z, w, d) {
    const b = { minX: x-w/2, maxX:x+w/2, minZ:z-d/2, maxZ:z+d/2, enabled:true }; colliders.push(b); return b;
  }
  function cube(x,y,z,w,h,d,color,solid=false, parent=scene) {
    const mesh = new THREE.Mesh(box, material(color)); mesh.position.set(x,y,z); mesh.scale.set(w,h,d); parent.add(mesh);
    mesh.receiveShadow = true;
    if (solid) {collider(x,z,w,d);occluders.push(mesh);}
    return mesh;
  }
  const dummy = new THREE.Object3D();
  function instances(items, color) {
    const mesh = new THREE.InstancedMesh(box, material(color), items.length);
    items.forEach((a,i) => { dummy.position.set(a[0],a[1],a[2]); dummy.rotation.set(0,0,0); dummy.scale.set(a[3],a[4],a[5]); dummy.updateMatrix(); mesh.setMatrixAt(i,dummy.matrix); });
    mesh.receiveShadow=true; scene.add(mesh); return mesh;
  }
  scene.add(new THREE.HemisphereLight('#e8f4ee','#987b5f',1.05));
  const sun = new THREE.DirectionalLight('#ffe6bd', 1.55); sun.position.set(-5,9,3); sun.target.position.set(0,0,0); scene.add(sun, sun.target);
  sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.camera.near=0.5;sun.shadow.camera.far=22;sun.shadow.bias=-0.0005;sun.shadow.normalBias=0.025;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // 25% larger classroom, with the entrance beside the teacher's area.
  cube(0,-0.12,0,12.5,0.24,15,'#d4b17e'); cube(7.75,-0.12,0,3,0.24,15,'#d8d8bd');
  cube(-6.25,1.7,0,0.2,3.4,15,'#f0edd5',true);
  cube(1.5,1.7,-7.5,15.5,3.4,0.2,'#e6e6cc',true); cube(1.5,1.7,7.5,15.5,3.4,0.2,'#e6e6cc',true);
  cube(9.25,1.7,0,0.2,3.4,15,'#e4e7ce',true);
  cube(6.25,1.7,-6.75,0.2,3.4,1.5,'#f0edd5',true);
  cube(6.25,1.7,1.65,0.2,3.4,11.7,'#f0edd5',true);
  cube(6.25,3.05,-5.1,0.2,0.7,1.9,'#f0edd5');
  // Warm, closed ceiling: shallow inset panels framed by timber beams.
  cube(1.5,3.43,0,15.35,0.14,14.85,'#eee7d7');
  instances([
    [1.5,3.34,-7.34,15.4,0.12,0.18],[1.5,3.34,7.34,15.4,0.12,0.18],
    [-6.13,3.34,0,0.18,0.12,14.6],[9.13,3.34,0,0.18,0.12,14.6],
  ],'#9b7954');
  // A restrained ceiling grid adds scale and breaks up the large flat surface.
  instances([-5,-2,1,4,7].map(x=>[x,3.345,0,0.055,0.035,14.45]),'#d1c5ae');
  // Lower wall bands and simple opaque windows; no reflective materials.
  cube(-6.13,0.45,0,0.025,0.9,14.8,'#7d9d8b'); cube(0,0.45,-7.38,12.3,0.9,0.025,'#7d9d8b'); cube(0,0.45,7.38,12.3,0.9,0.025,'#7d9d8b');
  [-4,0,4].forEach(z=>{
    cube(-6.11,2.1,z,0.04,1.55,2.1,'#fcf8e3'); cube(-6.07,2.1,z,0.04,1.35,1.9,'#add6d0'); cube(-6.03,2.1,z,0.05,0.06,1.9,'#fff9e6');cube(-6.03,2.1,z,0.05,1.35,0.06,'#fff9e6');
  });
  function sign(text, x,y,z,w,h,rotation=0) {
    const c=document.createElement('canvas');c.width=512;c.height=256;
    const ctx=c.getContext('2d');ctx.fillStyle='#255b49';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff3cd';ctx.textAlign='center';ctx.font='28px Arial, sans-serif';
    text.split('\n').forEach((line,i)=>ctx.fillText(line,256,90+i*55));
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
    const mat=new THREE.MeshBasicMaterial({map:texture}); materials.set(`sign${materials.size}`,mat);
    const geo=new THREE.PlaneGeometry(w,h);geometries.add(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.rotation.y=rotation;scene.add(mesh);return {mesh,ctx,texture};
  }
  function instructionBoard(){
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1024;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#285b49';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#d3b47a';ctx.lineWidth=18;ctx.strokeRect(12,12,canvas.width-24,canvas.height-24);
    ctx.strokeStyle='#e9d99b';ctx.lineWidth=3;ctx.strokeRect(32,32,canvas.width-64,canvas.height-64);
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff4d6';
    ctx.font='bold 48px Arial';ctx.fillText('CHÀO MỪNG ĐẾN LỚP CNTT',canvas.width/2,92);
    ctx.fillStyle='#f0cf82';ctx.font='bold 56px Arial';ctx.fillText('HƯỚNG DẪN CHƠI',canvas.width/2,178);
    ctx.textAlign='left';ctx.fillStyle='#fff9df';ctx.font='30px Arial';
    const lines=[
      '1. Nhấn E mở cửa, vào lớp và chào lớp.',
      '2. Đến ghế giảng viên, ngồi xuống và dùng laptop.',
      '3. Dạy lần lượt 3 bài JavaScript trên bảng.',
      '4. Đến gần NPC có ! hoặc ? rồi nhấn E.',
      '5. Mở bài kiểm tra trên laptop, sau đó đến cửa.',
    ];
    lines.forEach((line,index)=>ctx.fillText(line,58,278+index*58,650));
    ctx.strokeStyle='#9db9a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(54,590);ctx.lineTo(714,590);ctx.stroke();
    ctx.fillStyle='#f0cf82';ctx.font='bold 32px Arial';ctx.fillText('ĐIỀU KHIỂN',58,640);
    ctx.fillStyle='#fff9df';ctx.font='27px Arial';
    ctx.fillText('WEB: WASD di chuyển · Chuột nhìn quanh',58,700,650);
    ctx.fillText('E tương tác · Q đứng dậy · Esc tạm dừng',58,752,650);
    ctx.fillText('MOBILE: Cần trái di chuyển · Vuốt để nhìn',58,812,650);
    ctx.fillText('Chạm Tương tác · Đứng dậy khi đang ngồi',58,864,650);
    ctx.fillStyle='#c5d3bf';ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.fillText('ĐIỆN THOẠI: HÃY XOAY NGANG ĐỂ CHƠI',canvas.width/2,936);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
    const mat=new THREE.MeshBasicMaterial({map:texture});materials.set(`instruction-board-${materials.size}`,mat);
    const frameGeo=new THREE.BoxGeometry(0.12,2.2,1.8);geometries.add(frameGeo);
    const frame=new THREE.Mesh(frameGeo,material('#9d7548'));frame.position.set(6.35,1.7,-3.15);scene.add(frame);
    const geo=new THREE.PlaneGeometry(1.68,2.08);geometries.add(geo);
    const mesh=new THREE.Mesh(geo,mat);mesh.name='instruction-board';mesh.position.set(6.42,1.7,-3.15);mesh.rotation.y=Math.PI/2;scene.add(mesh);
  }
  cube(0,2,-7.3,4.8,1.6,0.14,'#aa8155');
  const board=sign('Chào mừng thầy cô!\nMỗi ngày một điều tốt',0,2,-7.21,4.55,1.35);board.mesh.userData.target='board';interactables.push(board.mesh);
  sign('LỚP CNTT\nChào một ngày mới',6.12,2.55,-2.6,1.3,0.65,Math.PI/2);
  const door=cube(6.25,1.3,-5.1,0.16,2.6,1.95,'#b98a56'); door.userData.target='door';interactables.push(door);
  const doorCollider=collider(6.25,-5.1,0.16,1.95);
  occluders.push(door);
  const knob=cube(6.37,1.2,-4.45,0.18,0.1,0.1,'#f0d384');knob.userData.target='door';
  instructionBoard();
  // Open door slides into a wall pocket, keeping the doorway and corridor navigable.
  const tops=[], legs=[], seats=[], backs=[];
  const studentPositions=[];
  for(let row=0;row<5;row++) for(let col=0;col<2;col++) {
    const x=col===0?-3:1.4,z=-3.6+row*2;
    tops.push([x,0.85,z,1.65,0.12,0.7]);collider(x,z,1.65,0.7);
    for(const dx of [-0.68,0.68]) for(const dz of [-0.25,0.25])legs.push([x+dx,0.4,z+dz,0.07,0.8,0.07]);
    seats.push([x,0.45,z+0.62,0.55,0.09,0.5]);backs.push([x,0.77,z+0.86,0.55,0.55,0.07]);collider(x,z+0.66,0.6,0.58);
    for(const dx of [-0.22,0.22]) for(const dz of [0.43,0.83])legs.push([x+dx,0.21,z+dz,0.055,0.42,0.055]);
    studentPositions.push([x,z+0.57]);
  }
  instances(tops,'#e1b980');instances(legs,'#58766c');instances(seats,'#c7975c');instances(backs,'#c7975c');
  const teacherDesk=cube(3.5,0.85,-6,1.8,0.13,0.85,'#c99963',true);cube(3.5,0.4,-6,1.4,0.8,0.55,'#b17f51');
  // Small low-poly laptop; the desk remains the interaction target.
  const laptopBase=cube(3.25,0.95,-6.1,0.64,0.04,0.43,'#354e4a');laptopBase.name='teacher-laptop-base';laptopBase.userData.target='laptop';
  cube(3.25,0.975,-6.07,0.53,0.01,0.22,'#6f8e88').userData.target='laptop';
  cube(3.25,0.978,-6.26,0.16,0.008,0.07,'#a7bcb0').userData.target='laptop';
  const laptopScreen=cube(3.25,1.17,-5.85,0.64,0.43,0.04,'#354e4a');laptopScreen.userData.target='laptop';
  const laptopDisplay=sign('',3.25,1.17,-5.88,0.53,0.32,Math.PI);
  laptopDisplay.mesh.name='teacher-laptop-display';laptopDisplay.mesh.userData.target='laptop';
  // The teacher's chair sits behind the desk, facing the students.
  const teacherChair=cube(3.5,0.46,-6.75,0.68,0.1,0.58,'#c7975c',true);
  teacherChair.userData.target='teacherChair';interactables.push(teacherChair);
  cube(3.5,0.83,-7.03,0.68,0.68,0.09,'#c7975c').userData.target='teacherChair';
  for (const dx of [-0.27,0.27]) for (const dz of [-0.21,0.21]) cube(3.5+dx,0.22,-6.75+dz,0.065,0.44,0.065,'#58766c');
  const laptop=createLaptop();teacherDesk.userData.target='laptop';interactables.push(teacherDesk);
  addClassroomDetails({cube,instances,sign});
  const students=createStudents(studentPositions,{scene,cube,box,sphere,material,geometries,materials,textures});
  const classroom=new ClassroomProgress();
  const bubbles=createBubbles(students,camera,occluders);
  const actions=createTeacherActions(camera,{scene,cube,materials});
  const lessons=createLessonBoard(board,{actions,audio,onChange:updateObjective,onReady:()=>ui.toast('Đã viết đủ dòng. Nhấn E tại bảng để giải thích và hoàn thành bài.')});
  const events=new LessonEvents(event=>{
    bubbles.clear(elapsed);for(const index of chatterPair??[])setState(students[index],'Listening');chatterReplyAt=0;chatterEnds=0;chatterPair=null;audio.stop();
    event.members.forEach((index,i)=>{setState(students[index],event.state);bubbles.say(index,event.lines[i]);});
    if(event.reaction){setState(students[event.reaction.npcId],'Listening');bubbles.say(event.reaction.npcId,event.reaction.line);}
    if(event.kind==='talking'||event.kind==='gameArgument')audio.whisper();
    ui.toast(`${event.title} — hãy quay lại quan sát lớp`);
  },()=>{});
  const keys=new Set(), touchMove={x:0,y:0}, ray=new THREE.Raycaster(), center=new THREE.Vector2(0,0);
  const boardDirection=new THREE.Vector3(),viewDirection=new THREE.Vector3(),proximityPoint=new THREE.Vector3();
  const sightRay=new THREE.Raycaster(),sightHits=[],sightDirection=new THREE.Vector3();
  ray.far=3.2;const intersections=[];
  let running=false, disposed=false, frame=0, last=0, yaw=Math.PI/2,pitch=0,elapsed=0,logicTime=0,animTime=0,aimTime=0;
  let fpsFrames=0,fpsTime=0,renderedFrames=0,target=null,preference=ui.preference,doorOpen=false,taught=false,resolved=0;
  let activityUntil=0,dialogue=null,dialogueReturn=null,chatterIndex=0,chatterAt=9,chatterReplyAt=0,chatterEnds=0,chatterPair=null;
  let phase='entry',examResult=null,snackDetected=false;
  const casualChatter=CHATTER.filter(pair=>pair.every(([index])=>index<7)).slice(0,6);
  let seatMode='standing',seatReturn=null,computerFocus=false,projection=null,screenVersion=-1;
  const seatedPosition=new THREE.Vector3(3.5,1.25,-6.65),computerPosition=new THREE.Vector3(3.25,1.18,-6.43);
  const dialoguePosition=new THREE.Vector3(),dialogueLook=new THREE.Vector3(),dialogueCameraTarget=new THREE.PerspectiveCamera();
  const auto=new AdaptiveQuality(defaultQuality(navigator));let quality=auto.quality;
  let lastMetrics={fps:0,calls:0,triangles:0,geometries:0,textures:0};
  const listeners=[];
  function listen(el,name,fn){el.addEventListener(name,fn);listeners.push(()=>el.removeEventListener(name,fn));}
  const touchMode=typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;
  function applyQuality(q) {
    quality=q;auto.quality=q;const config=PRESETS[q];renderer.setPixelRatio(Math.min(devicePixelRatio||1,config.ratio));
    const enabled=config.shadow>0;renderer.shadowMap.enabled=enabled;sun.castShadow=enabled;
    if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
    sun.shadow.mapSize.set(config.shadow||256,config.shadow||256);
    materials.forEach(mat=>{mat.needsUpdate=true;}); resize();
  }
  function setPreference(p){preference=p;auto.reset();applyQuality(p==='auto'?defaultQuality(navigator):p);}
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);if(!running&&!disposed)renderer.render(scene,camera);}
  function report(){
    ui.onStats(`FPS: ${running?lastMetrics.fps.toFixed(1):'— (tạm dừng)'}\nChất lượng: ${quality} · ${preference==='auto'?'tự động':'thủ công'}\nDraw calls: ${lastMetrics.calls}\nTriangles: ${lastMetrics.triangles}\nGPU geometries: ${lastMetrics.geometries}\nGPU textures: ${lastMetrics.textures}\nKhung hình đã render: ${renderedFrames}\nJS heap: ${performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1)+' MB':'trình duyệt không cung cấp'}`);
  }
  function updateObjective(){
    const lessonState=lessons.state;
    audio.setMood?.(phase==='tribute'||phase==='ending'?'piano':events.metrics.stress>=50?'tense':'chill');
    const message=phase==='entry'?(doorOpen?'Bước vào lớp và chào cả lớp':'Mở cửa và bước vào lớp học'):
      phase==='greeted'?'Mời cả lớp ngồi xuống':phase==='examReady'?'Ngồi tại máy tính để mở bài kiểm tra cuối giờ':
      phase==='exam'?'Xem kết quả rồi kết thúc buổi học':phase==='farewell'?'Đi đến cửa lớp để rời phòng':
      phase==='tribute'||phase==='ending'?'Lời tri ân ngày 20/11':events.active?`${events.active.title} · Nhắc nhở tại máy tính hoặc đến gần sinh viên`:
      `JavaScript · ${lessonState.completedCount}/3 bài · ${lessonState.allLinesVisible?'Giải thích và hoàn thành bài':'Dạy bài tiếp theo bằng laptop'}`;
    ui.onObjective(message);ui.onClassroom?.(events.metrics,events);
  }
  function paintComputer(title,subtitle){
    const {ctx,texture}=laptopDisplay;
    ctx.fillStyle='#e9efd9';ctx.fillRect(0,0,512,256);
    ctx.fillStyle='#214b3d';ctx.textAlign='center';ctx.font='bold 31px Arial';ctx.fillText(title,256,95,470);
    ctx.font='22px Arial';ctx.fillText(subtitle,256,155,470);
    ctx.font='16px Arial';ctx.fillText('LỚP CNTT · MÁY GIÁO VIÊN',256,220,470);
    texture.needsUpdate=true;
  }
  function paintProjection(){
    if(projection!=='slide')return;
    const [title,subtitle]=SLIDES[laptop.slide],ctx=board.ctx;
    ctx.fillStyle='#214b3d';ctx.fillRect(0,0,768,228);
    ctx.fillStyle='#e9d99b';ctx.textAlign='center';ctx.font='bold 42px Arial';ctx.fillText(title,384,93,710);
    ctx.fillStyle='#fff9df';ctx.font='30px Arial';ctx.fillText(subtitle,384,152,710);
    ctx.fillStyle='#b8d1bd';ctx.font='16px Arial';ctx.fillText('ĐANG CHIẾU TỪ MÁY GIÁO VIÊN',384,207,710);
    board.texture.needsUpdate=true;paintComputer(title,subtitle);
  }
  function mirrorBoard(){
    if(projection!=='lesson'||board.texture.version===screenVersion)return;
    screenVersion=board.texture.version;
    laptopDisplay.ctx.drawImage(board.texture.image,0,0,512,256);
    laptopDisplay.texture.needsUpdate=true;
  }
  function leaveComputer(){computerFocus=false;projection=null;screenVersion=-1;lessons.stop();lessons.refresh();paintComputer('SỔ TAY GIẢNG VIÊN','Chọn bài JavaScript để giảng');}
  const setState=setStudentState;
  events.onChange=updateObjective;
  function clearCancelledEventActors(indices){
    for(const index of new Set(indices)){if(students[index])setState(students[index],'Listening');bubbles.remove(index);}
  }
  function startLessonEvents(index){
    const transition=events.lesson(index);
    if(transition.changed){
      clearLessonIncidentState(transition.cancelledNpcIds);
    }
    return transition.changed;
  }
  function clearLessonIncidentState(indices){
    bubbles.clear(elapsed);
    for(const index of chatterPair??[])if(students[index])setState(students[index],'Listening');
    chatterPair=null;chatterReplyAt=0;chatterEnds=0;audio.stop();
    clearCancelledEventActors(indices);
  }
  function reset(){
    lessons.reset();
    classroom.reset();phase='entry';examResult=null;snackDetected=false;
    actions.reset();activityUntil=0;
    bubbles.clear();events.reset();audio.stop();audio.setMood?.('chill');
    laptop.reset();
    seatMode='standing';seatReturn=null;computerFocus=false;projection=null;screenVersion=-1;camera.fov=70;camera.updateProjectionMatrix();paintComputer('SỔ TAY GIẢNG VIÊN','Chọn bài JavaScript để giảng');
    camera.position.set(7.75,1.65,-5.1);yaw=Math.PI/2;pitch=0;camera.rotation.set(pitch,yaw,0);doorOpen=false;door.position.z=-5.1;knob.position.z=-4.45;doorCollider.enabled=true;
    elapsed=0;logicTime=0;animTime=0;aimTime=0;resolved=0;taught=false;keys.clear();touchMove.x=0;touchMove.y=0;target=null;dialogue=null;dialogueReturn=null;chatterIndex=0;chatterAt=25;chatterReplyAt=0;chatterEnds=0;chatterPair=null;ui.onPrompt('');ui.onDialogueEnd?.();auto.reset();
    students.forEach(s=>{setState(s,'Idle');s.cooldown=0;s.inDialogue=false;});
    updateObjective();
  }
  function setPrompt(message,action=''){
    ui.onPrompt(message);
    if(!touchMode)return;
    const button=document.getElementById('touch-interact');
    if(!button)return;
    button.disabled=!action;
    button.textContent=action?`Chạm · ${action}`:'Nhìn quanh để tương tác';
    button.setAttribute('aria-label',action?`Tương tác: ${action}`:'Nhìn vào vật thể hoặc sinh viên để tương tác');
  }
  function aim(){
    if(dialogue){target=null;setPrompt('');return;}
    if(phase==='entry'&&doorOpen&&camera.position.x<6.1){target='greet';setPrompt(touchMode?'Chạm để chào cả lớp':'[ E ] Chào cả lớp','Chào cả lớp');return;}
    if(phase==='greeted'){target='seatClass';setPrompt(touchMode?'Chạm để mời cả lớp ngồi':'[ E ] Mời cả lớp ngồi','Mời cả lớp ngồi');return;}
    if(phase==='farewell'&&camera.position.x>4.7&&Math.abs(camera.position.z+5.1)<2.2){target='tribute';setPrompt(touchMode?'Chạm để rời lớp':'[ E ] Rời lớp','Rời lớp');return;}
    if(seatMode!=='standing'){target=seatMode==='seated'?'laptop':null;setPrompt(seatMode==='seated'?(touchMode?'Chạm để dùng máy tính':'[ E ] Dùng máy tính · [ Q ] Đứng dậy'):'',seatMode==='seated'?'Dùng máy tính':'');return;}
    ray.setFromCamera(center,camera);intersections.length=0;ray.intersectObjects(scene.children,true,intersections);
    const hit=intersections.find(h=>h.object.visible&&h.object.parent?.visible!==false);
    let object=hit?.object;target=null;
    while(object){if(object.userData.target!==undefined){target=object.userData.target;break;}object=object.parent;}
    if(typeof target==='number'&&!events.forStudent(target))target=null;
    if(target===null){
      camera.getWorldDirection(viewDirection);let bestScore=-Infinity;
      students.forEach((student,index)=>{
        if(!events.forStudent(index))return;
        student.head.getWorldPosition(proximityPoint);proximityPoint.sub(camera.position);const distance=proximityPoint.length();
        if(distance>3.2||distance<0.2)return;
        sightDirection.copy(proximityPoint).multiplyScalar(1/distance);const facing=sightDirection.dot(viewDirection);
        if(facing<0.15)return;
        sightRay.set(camera.position,sightDirection);sightRay.far=distance-0.12;sightHits.length=0;sightRay.intersectObjects(occluders,false,sightHits);
        if(sightHits.length)return;
        const score=facing*2-distance*0.25;if(score>bestScore){bestScore=score;target=index;}
      });
    }
    if(target===null&&camera.position.distanceTo(seatedPosition)<2.1)target='teacherChair';
    if(target===4&&students[4].state==='Snacking'&&!snackDetected){snackDetected=true;events.metrics.stress=Math.min(100,events.metrics.stress+2);updateObjective();}
    const incident=typeof target==='number'?events.forStudent(target):null;
    const label=target===null?'':target==='door'?(doorOpen?'Đóng cửa lớp':'Mở cửa lớp'):target==='board'?'Viết bài lên bảng':target==='teacherChair'?'Ngồi ghế giáo viên':target==='laptop'?'Dùng máy tính giáo viên':incident?`${incident.type==='Question'?'Giải đáp':'Nhắc nhở'} cho ${students[target].name}`:'';
    setPrompt(label?`${touchMode?'Chạm nút bên phải':'[ E ]'}  ${label}`:'',label);
  }
  function step(time){
    if(!running||disposed)return;
    const raw=last?(time-last)/1000:1/60;last=time;const dt=Math.min(raw,0.05);elapsed+=dt;
    laptop.update(dt);actions.update(dt,elapsed);if(!dialogue)events.update(dt);
    const standButton=document.getElementById?.('touch-stand-up');if(standButton)standButton.hidden=!touchMode||seatMode!=='seated';
    if(dialogue){
      const student=students[dialogue.index];student.head.getWorldPosition(dialogueLook);
      dialogueLook.z-=0.08;
      dialoguePosition.set(student.group.position.x+(dialogue.index%2?-0.15:0.15),1.53,student.group.position.z-1.35);
      const blend=1-Math.exp(-dt*3);
      camera.position.lerp(dialogueReturn?dialogueReturn.position:dialoguePosition,blend);
      dialogueCameraTarget.position.copy(camera.position);dialogueCameraTarget.lookAt(dialogueLook);
      const orientation=dialogueReturn?dialogueReturn.quaternion:dialogueCameraTarget.quaternion;
      camera.quaternion.slerp(orientation,blend);
      const desiredFov=dialogueReturn?dialogueReturn.fov:58;
      if(Math.abs(camera.fov-desiredFov)>0.01){camera.fov+=(desiredFov-camera.fov)*blend;camera.updateProjectionMatrix();}
      yaw=camera.rotation.y;pitch=camera.rotation.x;
      if(dialogueReturn){
        if(camera.position.distanceTo(dialogueReturn.position)<0.025&&camera.quaternion.angleTo(orientation)<0.025){
          camera.position.copy(dialogueReturn.position);camera.quaternion.copy(orientation);camera.fov=dialogueReturn.fov;camera.updateProjectionMatrix();
          yaw=dialogueReturn.yaw;pitch=dialogueReturn.pitch;student.inDialogue=false;dialogue=null;dialogueReturn=null;ui.onDialogueEnd?.();
        }
      }else ui.onDialogueTick?.(dt);
      if(animTime>=1/PRESETS[quality].animationHz){animTime=0;animateStudents(students,elapsed,camera);}
      animTime+=dt;renderer.render(scene,camera);renderedFrames++;frame=requestAnimationFrame(step);return;
    }
    for(const student of students){
      if(student.cooldown>0){student.cooldown=Math.max(0,student.cooldown-dt);
        if(student.cooldown===0&&!events.forStudent(students.indexOf(student))&&!chatterPair?.includes(students.indexOf(student))&&['Confused','RaisingHand','WrongAnswer','Unsure'].includes(student.state))setState(student,'Listening');}
    }
    if(activityUntil&&elapsed>=activityUntil){activityUntil=0;students.forEach((s,i)=>{if(!events.forStudent(i))setState(s,'Listening');});}
    if(seatMode!=='standing'){
      const leaving=seatMode==='leaving',destination=leaving?seatReturn.position:computerFocus?computerPosition:seatedPosition;
      const targetYaw=leaving?seatReturn.yaw:computerFocus?Math.PI:2.84,targetPitch=leaving?seatReturn.pitch:computerFocus?-0.02:-0.1;
      const blend=Math.min(1,dt*5);camera.position.lerp(destination,blend);yaw+=(targetYaw-yaw)*blend;pitch+=(targetPitch-pitch)*blend;
      camera.rotation.set(pitch,yaw,0);
      const fov=computerFocus&&!leaving?38:70;if(Math.abs(camera.fov-fov)>0.05){camera.fov+=(fov-camera.fov)*blend;camera.updateProjectionMatrix();}
      if(seatMode==='entering'&&camera.position.distanceTo(destination)<0.03)seatMode='seated';
      if(leaving&&camera.position.distanceTo(destination)<0.03){camera.position.copy(destination);yaw=seatReturn.yaw;pitch=seatReturn.pitch;camera.fov=70;camera.updateProjectionMatrix();seatMode='standing';seatReturn=null;}
    }else{
      const look=(keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0);yaw+=look*dt*1.7;
      pitch=Math.max(-1.3,Math.min(1.3,pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt));
      camera.rotation.set(pitch,yaw,0);
      let f=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)-touchMove.y,s=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+touchMove.x;
      const length=Math.max(1,Math.hypot(f,s));f=f/length*dt*2.8;s=s/length*dt*2.8;
      movePlayer(camera.position,-Math.sin(yaw)*f+Math.cos(yaw)*s,-Math.cos(yaw)*f-Math.sin(yaw)*s,colliders);
    }
    if(lessons.writing){
      boardDirection.subVectors(board.mesh.position,camera.position);camera.getWorldDirection(viewDirection);
      lessons.update(dt,projection==='lesson'&&seatMode==='seated'||boardDirection.lengthSq()<=3.2*3.2&&viewDirection.dot(boardDirection.normalize())>0.7);
    }
    mirrorBoard();
    logicTime+=dt;animTime+=dt;aimTime+=dt;
    if(chatterReplyAt&&elapsed>=chatterReplyAt){const pair=casualChatter[(chatterIndex-1+casualChatter.length)%casualChatter.length];bubbles.say(pair[1][0],pair[1][1],3.5);chatterReplyAt=0;}
    if(chatterPair&&chatterPair.some(index=>camera.position.distanceTo(students[index].group.position)<2.5)){
      for(const index of chatterPair){bubbles.remove(index);if(!events.forStudent(index))setState(students[index],'Listening');}
      chatterPair=null;chatterReplyAt=0;chatterEnds=0;audio.stop();
    }
    if(chatterEnds&&elapsed>=chatterEnds){chatterEnds=0;audio.stop();for(const index of chatterPair??[]){if(!events.forStudent(index))setState(students[index],'Listening');}chatterPair=null;}
    if(phase==='lesson'&&taught&&!events.active&&!events.pending&&elapsed>=chatterAt){
      const pair=casualChatter[chatterIndex%casualChatter.length];chatterIndex++;chatterAt=elapsed+30+(chatterIndex%3)*4;chatterReplyAt=elapsed+2.8;chatterEnds=elapsed+6;chatterPair=[pair[0][0],pair[1][0]];
      if(chatterPair.some(index=>index===3||index===4))events.reoffense('talking');
      bubbles.say(pair[0][0],pair[0][1],3.3);setState(students[pair[0][0]],'Talking');setState(students[pair[1][0]],'Talking');
      if(camera.position.distanceTo(students[pair[0][0]].group.position)<3.2){setState(students[pair[0][0]],'Listening');setState(students[pair[1][0]],'Listening');chatterReplyAt=0;}
      else {if(chatterIndex%2===0)audio.whisper();events.metrics.noise=Math.min(100,events.metrics.noise+2);updateObjective();}
    }
    if(logicTime>=3){logicTime=0;
      if(events.active&&Math.floor(elapsed/3)%4===0){const event=events.active;event.members.forEach((index,i)=>bubbles.say(index,event.lines[i],4));}
      updateObjective();
    }
    if(animTime>=1/PRESETS[quality].animationHz){animTime=0;animateStudents(students,elapsed,camera);}
    if(aimTime>=0.1){aimTime=0;aim();bubbles.update(elapsed);}
    renderer.render(scene,camera);renderedFrames++;fpsFrames++;fpsTime+=raw;
    if(fpsTime>=2){lastMetrics={fps:fpsFrames/fpsTime,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};
      const next=auto.sample(lastMetrics.fps,fpsTime,preference==='auto');if(next!==quality){applyQuality(next);ui.toast(`Đã điều chỉnh đồ họa: ${next}`);}fpsTime=0;fpsFrames=0;report();}
    frame=requestAnimationFrame(step);
  }
  function pause(){audio.pause();bubbles.hide();running=false;cancelAnimationFrame(frame);frame=0;keys.clear();touchMove.x=0;touchMove.y=0;if(touchMode){const stick=document.getElementById('touch-stick');if(stick)stick.style.transform='translate(0,0)';}last=0;fpsFrames=0;fpsTime=0;auto.reset();if(document.pointerLockElement===canvas)document.exitPointerLock();report();}
  function lock(){if(touchMode)return;if(document.pointerLockElement!==canvas){try{const p=canvas.requestPointerLock();p?.catch(()=>ui.toast('Bấm vào khung hình để dùng chuột; hoặc dùng phím mũi tên để nhìn.'));}catch{ui.toast('Dùng phím mũi tên để nhìn quanh.');}}}
  function resume(){if(disposed||running||document.hidden)return;running=true;audio.resume();last=0;auto.reset();frame=requestAnimationFrame(step);lock();}
  function toggleDoor(){
    if(doorOpen&&blocked(camera.position.x,camera.position.z,[{...doorCollider,enabled:true}],0.35)){ui.toast('Hãy bước ra khỏi khung cửa trước khi đóng.');return;}
    doorOpen=!doorOpen;doorCollider.enabled=!doorOpen;door.position.z=doorOpen?-3.1:-5.1;knob.position.z=doorOpen?-2.45:-4.45;updateObjective();ui.toast(doorOpen?'Cửa đã mở. Chào mừng thầy cô!':'Cửa đã đóng.');
  }
  function greetClass(){
    if(phase!=='entry'||!doorOpen||camera.position.x>=6.1)return false;
    phase='greeted';students.forEach(student=>setState(student,'Answering'));
    bubbles.clear(elapsed);bubbles.say(0,'Chúng em chào thầy ạ!',5);ui.toast('Giảng viên: Chào cả lớp! · Chúng em chào thầy ạ!');updateObjective();return true;
  }
  function seatClass(){
    if(phase!=='greeted')return false;
    phase='lesson';students.forEach(student=>setState(student,'Listening'));
    ui.toast('Giảng viên: Các em ngồi xuống nhé! Hôm nay ta học ba kiến thức JavaScript và cuối giờ có một bài kiểm tra nhỏ.');updateObjective();return true;
  }
  function takeExam(){
    if((phase!=='examReady'&&phase!=='exam')||!events.finished)return null;
    if(!examResult){const outcome=Math.random()<0.5?'good':'bad';examResult=classroom.examine(students,{outcome});events.applyExamOutcome(outcome);phase='exam';
      actions.start(outcome==='good'?'wave':'sigh');ui.toast(outcome==='good'?'Thầy thấy nhẹ nhõm và vui vì cả lớp đã làm bài tốt.':'Thầy thở dài, kết quả hôm nay chưa như mong đợi.');updateObjective();}
    return examResult;
  }
  function finishClass(){
    if(phase!=='exam')return false;
    phase='farewell';leaveComputer();standUp();students.forEach(student=>setState(student,'Answering'));
    bubbles.clear(elapsed);bubbles.say(0,'Chúng em chào thầy ạ!',5);
    ui.toast('Giảng viên: Buổi học hôm nay đến đây thôi. Cảm ơn cả lớp!');updateObjective();return true;
  }
  function startTribute(){
    if(phase!=='farewell'||camera.position.x<=4.7||Math.abs(camera.position.z+5.1)>=2.2)return false;
    phase='tribute';audio.setMood?.('piano');ui.onTribute?.(examResult);updateObjective();return true;
  }
  function finishTribute(){if(phase!=='tribute')return false;phase='ending';updateObjective();return true;}
  function cancelTribute(){if(phase!=='tribute')return false;phase='farewell';audio.setMood?.('chill');updateObjective();return true;}
  function teach(id=lessons.state.activeLessonId??lessons.state.nextLessonId){
    if(projection)leaveComputer();
    void audio.unlock();if(!lessons.start(id))return false;
    taught=true;startLessonEvents(LESSONS.findIndex(lesson=>lesson.id===id));
    students.forEach(s=>{if(s.state==='Idle')setState(s,'Listening');});
    updateObjective();return true;
  }
  function completeLesson(){const index=lessons.state.completedCount,completed=lessons.complete();
    if(completed){if(events.currentLesson===index+1)clearLessonIncidentState(events.finishLesson());
      classroom.recordLesson(index,students,{ignoredCount:events.ignoredCount,ignoredStudents:events.ignoredStudents});
      if(lessons.state.readyForAssessment)phase='examReady';updateObjective();}
    return completed;
  }
  function sitDown(){if(seatMode!=='standing'||dialogue)return false;seatReturn={position:camera.position.clone(),yaw,pitch};seatMode='entering';keys.clear();ui.onPrompt('');return true;}
  function standUp(){if(seatMode!=='seated'||dialogue)return false;seatMode='leaving';computerFocus=false;keys.clear();return true;}
  function useLaptop(){lessons.stop();void audio.unlock();actions.start('type');laptop.open();projection='slide';computerFocus=seatMode!=='standing';paintProjection();updateObjective();}
  function nextSlide(){useLaptop();const slide=laptop.next();paintProjection();return slide;}
  function teachFromComputer(id=lessons.state.activeLessonId??lessons.state.nextLessonId){
    if(seatMode==='standing')return false;
    if(!lessons.start(id))return false;
    projection='lesson';computerFocus=true;void audio.unlock();
    taught=true;startLessonEvents(LESSONS.findIndex(lesson=>lesson.id===id));students.forEach(student=>{if(student.state==='Idle')setState(student,'Listening');});
    screenVersion=-1;mirrorBoard();updateObjective();return true;
  }
  function activity(){
    lessons.stop();
    actions.start('wave');
    students.forEach((s,i)=>{if(!events.forStudent(i))setState(s,'Listening');});
    activityUntil=elapsed+4;ui.toast('Cả lớp vươn vai, hít thở và cùng chia sẻ một lời cảm ơn.');
  }
  function resolve(index,choice=0){
    lessons.stop();
    actions.start('wave');
    const result=events.resolve(index,choice);
    if(result){setState(students[index],'Listening');bubbles.remove(index);resolved=events.distractionProcessed;audio.stop();bubbles.say(index,result.choice.reply);ui.toast(result.choice.reply);}
    else if(!events.forStudent(index)){setState(students[index],'Listening');bubbles.remove(index);}
    updateObjective();return result;
  }
  function beginDialogue(index){
    if(!running||dialogue||seatMode!=='standing'||!students[index]||camera.position.distanceTo(students[index].group.position)>3.2)return null;
    const student=students[index],event=events.forStudent(index),personal=PERSONAL_DIALOGUES[student.state]??PERSONAL_DIALOGUES.Listening;
    dialogue={index};dialogueReturn=null;dialogue.original={position:camera.position.clone(),quaternion:camera.quaternion.clone(),fov:camera.fov,yaw,pitch};student.inDialogue=true;
    if(['Playing','Snacking','Talking'].includes(student.state)){student.expression=7;student.face.geometry=student.faces[7];}
    keys.clear();bubbles.hide();for(const speaker of chatterPair??[]){if(speaker!==index&&!events.forStudent(speaker))setState(students[speaker],'Listening');}chatterPair=null;chatterReplyAt=0;chatterEnds=0;
    audio.stop();lessons.stop();actions.start('wave',3600);ui.onPrompt('');
    if(document.pointerLockElement===canvas)document.exitPointerLock();
    const lineIndex=event?.npcIndexes.indexOf(index)??-1;
    return {name:student.name,speaker:event?student.name:(personal.speaker??student.name),title:event?.title??personal.title,line:event?.lines[lineIndex]??personal.line,choices:event?.choices??personal.choices,autoChoice:!event&&personal.automatic?(Math.random()<0.5?0:1):null,event:!!event};
  }
  function chooseDialogue(index,choice){
    if(!dialogue||dialogue.index!==index)return null;
    const event=events.forStudent(index);
    if(event){const result=resolve(index,choice);return result?.choice.reply??null;}
    const personal=PERSONAL_DIALOGUES[students[index].state]??PERSONAL_DIALOGUES.Listening;
    const selected=personal.choices[choice];if(!selected)return null;
    applyEffects(events.metrics,selected.effect);events.metrics.noise=Math.max(0,Math.min(100,(events.metrics.noise??30)+(selected.noise??0)));
    setState(students[index],selected.nextState??'Listening');updateObjective();return selected.reply;
  }
  function endDialogue(){if(!dialogue||dialogueReturn)return;dialogueReturn=dialogue.original;actions.reset();lock();}
  listen(window,'resize',resize);
  listen(document,'keydown',e=>{if(!running||dialogue)return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    if(e.code==='KeyQ'&&seatMode!=='standing'&&!e.repeat){standUp();return;}
    if(seatMode==='standing')keys.add(e.code);
    if(e.code==='KeyE'&&!e.repeat){aim();if(target!==null)ui.interaction(target);}if(e.code==='Escape')ui.pauseMenu();});
  listen(document,'keyup',e=>keys.delete(e.code));
  listen(document,'mousemove',e=>{if(running&&!dialogue&&seatMode==='standing'&&document.pointerLockElement===canvas){yaw-=e.movementX*0.002;pitch=Math.max(-1.3,Math.min(1.3,pitch-e.movementY*0.002));}});
  if(touchMode){
    const standButton=document.getElementById('touch-stand-up');
    const syncStandButton=()=>{standButton.hidden=seatMode!=='seated';};
    listen(standButton,'click',()=>standUp());
    listen(standButton,'pointerdown',e=>e.stopPropagation());
    listen(window,'orientationchange',syncStandButton);
    let lookPointer=null,lookX=0,lookY=0;
    listen(canvas,'pointerdown',e=>{if(!running||seatMode!=='standing'||lookPointer!==null)return;lookPointer=e.pointerId;lookX=e.clientX;lookY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});
    listen(canvas,'pointermove',e=>{if(!running||seatMode!=='standing'||e.pointerId!==lookPointer)return;yaw-=(e.clientX-lookX)*0.006;pitch=Math.max(-1.3,Math.min(1.3,pitch-(e.clientY-lookY)*0.006));lookX=e.clientX;lookY=e.clientY;});
    const endLook=e=>{if(e.pointerId===lookPointer)lookPointer=null;};
    listen(canvas,'pointerup',endLook);listen(canvas,'pointercancel',endLook);
    const joystick=document.getElementById('touch-joystick'),stick=document.getElementById('touch-stick');
    let movePointer=null;
    const moveStick=e=>{
      const rect=joystick.getBoundingClientRect(),radius=rect.width*0.34;
      const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);
      const distance=Math.hypot(dx,dy),deadZone=0.1;
      const scale=Math.min(1,radius/(distance||1));
      const strength=distance/radius<=deadZone?0:Math.min(1,(distance/radius-deadZone)/(1-deadZone));
      touchMove.x=dx/(distance||1)*strength;touchMove.y=dy/(distance||1)*strength;
      stick.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
    };
    listen(joystick,'pointerdown',e=>{if(!running||movePointer!==null)return;e.preventDefault();movePointer=e.pointerId;joystick.setPointerCapture?.(e.pointerId);moveStick(e);});
    listen(joystick,'pointermove',e=>{if(e.pointerId===movePointer){e.preventDefault();moveStick(e);}});
    const releaseMove=e=>{if(e.pointerId!==movePointer)return;movePointer=null;touchMove.x=0;touchMove.y=0;stick.style.transform='translate(0,0)';};
    listen(joystick,'pointerup',releaseMove);listen(joystick,'pointercancel',releaseMove);listen(joystick,'lostpointercapture',releaseMove);
    const interact=document.getElementById('touch-interact');
    listen(interact,'pointerdown',e=>{e.preventDefault();if(!running)return;aim();if(target!==null)ui.interaction(target);});
  }
  listen(canvas,'click',()=>{if(running)lock();});
  listen(document,'pointerlockchange',()=>{if(!touchMode&&running&&!dialogue&&document.pointerLockElement!==canvas)ui.pauseMenu();});
  listen(window,'blur',()=>{if(running)ui.pauseMenu();});
  listen(document,'visibilitychange',()=>{if(document.hidden&&running)ui.pauseMenu();});
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();pause();ui.pauseMenu();ui.toast('Đồ họa đã bị gián đoạn. Về màn hình đầu rồi bắt đầu lại.');});
  function dispose(){if(disposed)return;pause();ui.onDialogueEnd?.();lessons.stop();disposed=true;bubbles.dispose();if(ownsAudio)audio.dispose();listeners.forEach(off=>off());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());sun.shadow.map?.dispose();scene.traverse(o=>{if(o.isInstancedMesh)o.dispose();});scene.clear();renderer.renderLists.dispose();renderer.dispose();}
  reset();setPreference(preference);
  return {pause,resume,dispose,reset,setPreference,toggleDoor,greetClass,seatClass,takeExam,finishClass,startTribute,finishTribute,cancelTribute,teach,teachFromComputer,completeLesson,sitDown,standUp,leaveComputer,beginDialogue,chooseDialogue,endDialogue,get lessonState(){return lessons.state;},get currentLesson(){return events.currentLesson;},get currentSlide(){return laptop.slide;},get seated(){return seatMode!=='standing';},get projected(){return projection!==null;},get phase(){return phase;},get examResult(){return examResult;},get studentScores(){return [...classroom.understanding];},useLaptop,nextSlide,activity,resolve,students,report,events,laptop,setSound:audio.setEnabled,get resolved(){return resolved;},get taught(){return taught;},
    // Read-only diagnostics for reproducible manual performance checks.
    diagnostics:()=>({...lastMetrics,quality,running,renderedFrames,allocatedGeometries:geometries.size,allocatedMaterials:materials.size,allocatedTextures:textures.size,position:camera.position.toArray(),states:students.map(s=>s.state)})};
}
