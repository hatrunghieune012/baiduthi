// Static, mostly instanced details. No textures downloaded or extra lights.
export function addClassroomDetails({cube,instances,sign}) {
  const seams=[],books=[],pages=[],pencils=[],frames=[];
  for(let z=-7;z<7.5;z+=0.8)seams.push([0,0.004,z,12.3,0.006,0.012]);
  for(let x=-5;x<=5;x+=2)seams.push([x,0.004,0,0.012,0.006,14.8]);
  instances(seams,'#bb9f7b');
  // Thin trim and ceiling beams add depth while staying outside the walking space.
  instances([[-6.08,0.94,0,0.055,0.055,14.8],[0,0.94,-7.33,12.3,0.055,0.055],[0,0.94,7.33,12.3,0.055,0.055]],'#e1caa5');
  instances([[-5.95,3.3,0,0.12,0.12,14.8],[0,3.3,-7.3,12.2,0.12,0.12],[0,3.3,7.3,12.2,0.12,0.12]],'#e9d5b4');
  instances([[-3.2,3.29,0,0.09,0.09,14.7],[1.8,3.29,0,0.09,0.09,14.7]],'#f7efdb');
  instances([[-3.2,3.22,-3.5,0.7,0.035,0.22],[1.8,3.22,-3.5,0.7,0.035,0.22],[-3.2,3.22,2,0.7,0.035,0.22],[1.8,3.22,2,0.7,0.035,0.22]],'#fff5dc');
  // Low-poly ceiling fixtures and fans; all repeating pieces share instanced batches.
  const lightBodies=[],lightPanels=[],fanHubs=[],fanBlades=[];
  for(const z of [-4.8,-1.2,2.4,5.7]) {
    lightBodies.push([-1.4,3.13,z,1.2,0.09,0.32],[2.5,3.13,z,1.2,0.09,0.32]);
    lightPanels.push([-1.4,3.075,z,1.08,0.025,0.25],[2.5,3.075,z,1.08,0.025,0.25]);
  }
  for(const z of [-2.9,3.6]) {
    fanHubs.push([0.4,3.05,z,0.24,0.16,0.24]);
    for(let blade=0;blade<4;blade++) {
      const angle=blade*Math.PI/2;
      fanBlades.push([0.4+Math.cos(angle)*0.64,3.04,z+Math.sin(angle)*0.64,1.15,0.045,0.17]);
    }
  }
  instances(lightBodies,'#d7c7a5');instances(lightPanels,'#fff1cf');
  instances(fanHubs,'#718276');instances(fanBlades,'#9aa590');
  for(let row=0;row<5;row++)for(let col=0;col<2;col++){
    const x=col===0?-3:1.4,z=-3.6+row*2;
    books.push([x-0.18,0.927,z,0.46,0.025,0.34]);pages.push([x-0.18,0.944,z,0.42,0.01,0.30]);pencils.push([x+0.17,0.94,z,0.025,0.025,0.28]);
  }
  instances(books,'#6b8b80');instances(pages,'#fff6db');instances(pencils,'#b88245');
  instances([[-3,0.914,-3.6,1.7,0.018,0.7],[1.4,0.914,-1.6,1.7,0.018,0.7],[-3,0.914,2.4,1.7,0.018,0.7]],'#edc993');
  instances([[-3.8,0.85,-3.6,0.035,0.14,0.68],[2.2,0.85,-1.6,0.035,0.14,0.68],[-3.8,0.85,2.4,0.035,0.14,0.68]],'#a66f45');
  // A few personal items keep the room lived-in without extra models or textures.
  instances([[-3.52,0.43,-2.9,0.38,0.42,0.22],[1.92,0.43,1.1,0.38,0.42,0.22]],'#667e74');
  instances([[-3.52,0.67,-2.9,0.22,0.08,0.24],[1.92,0.67,1.1,0.22,0.08,0.24]],'#c58c61');
  cube(4.05,0.99,-6.05,0.18,0.18,0.18,'#e9e1c8');
  cube(4.05,1.1,-6.05,0.14,0.025,0.14,'#efeee0');
  [-4,0,4].forEach(z=>{frames.push([-5.94,1.29,z,0.3,0.08,2.2]);});instances(frames,'#b69b76');
  cube(0,1.13,-7.19,4.9,0.08,0.25,'#be996a');
  cube(-1.8,1.2,-7.12,0.23,0.06,0.1,'#ddd7b8');
  cube(0,2.2,7.33,3.4,1.25,0.08,'#b48f63');
  sign('GÓC BIẾT ƠN\nMỗi lời tử tế là một hạt mầm',0,2.2,7.27,3.2,1.08,Math.PI);
  cube(0,2.2,-7.32,3.1,0.96,0.08,'#9c7049');
  sign('LỚP CNTT K23',0,2.2,-7.26,2.86,0.76,0);
  // A simple readable clock on the back wall, assembled from shared geometry.
  cube(4.75,2.55,7.31,0.76,0.76,0.07,'#d4c6a5');
  cube(4.75,2.55,7.26,0.52,0.52,0.025,'#f5ecd5');
  cube(4.75,2.55,7.23,0.035,0.34,0.02,'#566b5d');
  cube(4.82,2.62,7.22,0.2,0.035,0.02,'#566b5d');
  cube(-5.25,0.65,5.9,1.25,1.3,0.46,'#ad875b',true);
  instances([[-5.25,0.44,5.62,1.1,0.07,0.55],[-5.25,0.88,5.62,1.1,0.07,0.55]],'#d9b782');
  const spines=[];for(let i=0;i<6;i++)spines.push([-5.68+i*0.17,1.08,5.61,0.1,0.29,0.24]);instances(spines,'#5f8475');
  cube(5.1,0.2,-6.85,0.45,0.4,0.45,'#bb7958',true);
  instances([[5.1,0.65,-6.85,0.07,0.6,0.07]],'#75835a');
  instances([[4.91,0.65,-6.85,0.38,0.14,0.23],[5.25,0.82,-6.85,0.35,0.14,0.23],[5.1,1,-6.85,0.24,0.25,0.22]],'#7e9b67');
  // Warm opaque floor patches simulate light from the windows.
  instances([[-4.5,0.008,-4,1.7,0.006,1.25],[-4.5,0.008,0,1.7,0.006,1.25],[-4.5,0.008,4,1.7,0.006,1.25]],'#e4cda3');
  instances([[-4.55,0.01,-4,0.12,0.008,1.25],[-4.55,0.01,0,0.12,0.008,1.25],[-4.55,0.01,4,0.12,0.008,1.25]],'#f3dbac');
}
