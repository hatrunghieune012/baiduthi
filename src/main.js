import './style.css';
import { LESSONS, getLesson } from './lessons.js';
import { createClassroomAudio } from './audio.js';
import { TRIBUTE_DIALOGUE, TRIBUTE_LETTERS, TRIBUTE_ENDING_SCREEN, selectTributeLetter } from './dialogues/tribute.js';
const $ = id => document.getElementById(id);
function updateClassroom(metrics,events){
  const occurred=events?.distractionOccurred??0,processed=events?.distractionProcessed??0;
  $('lesson').textContent=`Stress ${metrics.stress} · Sự kiện ${occurred}/10`;
  $('event-count').textContent=`Gây mất tập trung ${occurred}/10 · Đã xử lý ${processed}/10`;
  $('stress').textContent=metrics.stress;
  $('stress-bar').style.width=`${metrics.stress}%`;
  document.body.classList.toggle('stress-high',metrics.stress>=50);
  document.body.classList.toggle('stress-critical',metrics.stress>=80);
}
let game, loading = false, toastTimer;
const rotateButton=$('rotate-button');
rotateButton.onclick=async()=>{
  // Facebook's in-app browser may reject fullscreen while still allowing the
  // orientation request. Try the lock first and keep fullscreen optional.
  try {
    if(!screen.orientation?.lock)throw new Error('orientation lock unavailable');
    await screen.orientation.lock('landscape');
    $('rotate-help').textContent='Đã chuyển sang màn hình ngang. Nếu màn hình chưa xoay, hãy bật Tự động xoay trên điện thoại.';
  } catch {
    $('rotate-help').textContent='Facebook có thể chặn xoay màn hình trong ứng dụng. Hãy bật Tự động xoay trên điện thoại và xoay máy; nếu vẫn chưa được, mở menu ⋯ rồi chọn Mở trong trình duyệt.';
  }
  try {
    if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
  } catch { /* Fullscreen is optional, especially in in-app browsers. */ }
};
let dialogueState=null;
function dialogueTick(dt){
  if(!dialogueState||dialogueState.shown>=dialogueState.text.length)return;
  dialogueState.elapsed+=dt;
  const count=Math.min(dialogueState.text.length,Math.floor(dialogueState.elapsed*34));
  if(count===dialogueState.shown)return;
  dialogueState.shown=count;$('dialogue-text').textContent=dialogueState.text.slice(0,count);
  if(count===dialogueState.text.length){
    if(dialogueState.reply)$('dialogue-next').hidden=false;
    else if(dialogueState.autoChoice!==null)chooseDialogue(dialogueState.autoChoice);
    else dialogueState.choices.forEach((choice,index)=>{
      const button=document.createElement('button');button.type='button';button.className='dialogue-choice';button.textContent=`${index+1}. ${choice.label}`;
      button.onclick=()=>chooseDialogue(index);$('dialogue-choices').append(button);
    });
  }
}
function showDialogue(index){
  const data=game.beginDialogue(index);if(!data)return;
  dialogueState={index,choices:data.choices,autoChoice:data.autoChoice,text:data.line,shown:0,elapsed:0,reply:false};
  $('dialogue-speaker').textContent=`${data.speaker} · ${data.title}`;$('dialogue-text').textContent='';$('dialogue-choices').replaceChildren();$('dialogue-next').hidden=true;
  $('dialogue').hidden=false;document.body.classList.add('in-dialogue');
}
function chooseDialogue(choice){
  if(!dialogueState||dialogueState.reply||dialogueState.shown<dialogueState.text.length)return;
  const reply=game.chooseDialogue(dialogueState.index,choice);if(!reply)return;
  dialogueState={...dialogueState,text:reply,shown:0,elapsed:0,reply:true,autoChoice:null};
  $('dialogue-speaker').textContent=game.students[dialogueState.index].name;$('dialogue-text').textContent='';$('dialogue-choices').replaceChildren();
}
function finishDialogue(){if(!dialogueState||!dialogueState.reply)return;game.endDialogue();$('dialogue-next').hidden=true;}
function closeDialogue(){dialogueState=null;$('dialogue').hidden=true;document.body.classList.remove('in-dialogue');}
let soundEnabled=true;
const audio=createClassroomAudio();
function setSoundEnabled(value){
  soundEnabled=value;audio.setEnabled(soundEnabled);
  const button=$('home-sound');button.setAttribute('aria-pressed',String(soundEnabled));
  button.setAttribute('aria-label',soundEnabled?'Tắt âm thanh':'Bật âm thanh');
  button.innerHTML=`♫ <span>Âm thanh ${soundEnabled?'bật':'tắt'}</span>`;
}
let preference;
try { preference = localStorage.getItem('teacher-quality') || 'auto'; } catch { preference = 'auto'; }
if (!['auto', 'low', 'medium', 'high'].includes(preference)) preference = 'auto';
const statsVisible = new URLSearchParams(location.search).has('perf');
$('stats').hidden = !statsVisible;
function toast(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4000);
}
function showPanel(html) {
  game?.pause(); $('panel-close').hidden=false;$('panel-content').innerHTML = html;
  if (!$('panel').open) $('panel').showModal();
}
function closePanel() { $('panel').close(); }
function showExam(){
  const result=game.takeExam();if(!result)return;
  const title={happy:'10/10 sinh viên đạt · Kết quả xuất sắc',normal:`${result.passed}/10 sinh viên đạt · Cùng cố gắng`,bad:`${result.passed}/10 sinh viên đạt · Cần thêm thời gian`}[result.ending];
  const mood=result.outcome==='good'?'Kết quả tốt · Giảng viên nhẹ nhõm, vui vẻ.':'Kết quả chưa đạt · Giảng viên mệt mỏi và thở dài.';
  showPanel(`<span class="eyebrow">BÀI KIỂM TRA CUỐI GIỜ</span><h2>${title}</h2><p>${mood} Stress hiện tại: ${game.events.metrics.stress}/100.</p><div class="exam-rows">${result.rows.map(row=>`<span>${row.name}: ${row.score.toFixed(1)} · ${row.passed?'Đạt':'Chưa đạt'}</span>`).join('')}</div><button id="finish-class" class="primary">Kết thúc buổi học</button>`);
  $('finish-class').onclick=()=>{game.finishClass();closePanel();};
}
function showTribute(result){
  const lines=TRIBUTE_DIALOGUE;
  let index=0;
  const next=()=>{if(index>=lines.length){showLetter(result);return;}
    const [speaker,line]=lines[index++];showPanel(`<span class="eyebrow">LỜI TRI ÂN 20/11</span><h2>${speaker}</h2><p>${line}</p><button id="tribute-next" class="primary">${index===lines.length?'Đọc lá thư':'Tiếp tục'}</button>`);
    $('tribute-next').onclick=next;
  };
  next();
}
function showLetter(result){
  const outcome=selectTributeLetter(result);
  const letter=TRIBUTE_LETTERS[outcome];
  showPanel(`<span class="eyebrow">LÁ THƯ TỪ LỚP CNTT</span><h2>${letter.title}</h2>${letter.paragraphs.map((paragraph,index)=>`<p${index===letter.paragraphs.length-2?' class="tribute-emphasis"':''}>${paragraph}</p>`).join('')}<button id="letter-next" class="primary">Tiếp tục</button><button id="letter-close" class="option">Đóng thư</button>`);
  $('letter-next').onclick=showEnding;
  $('letter-close').onclick=closePanel;
}
function showEnding(){
  game.finishTribute();$('hud').hidden=true;
  showPanel(`<span class="eyebrow">NGÀY NHÀ GIÁO VIỆT NAM</span><h2>${TRIBUTE_ENDING_SCREEN.title}</h2>${TRIBUTE_ENDING_SCREEN.paragraphs.map(paragraph=>`<p>${paragraph}</p>`).join('')}<button id="again" class="primary">Chơi lại</button><button id="end-home" class="option">Về menu</button>`);
  $('panel-close').hidden=true;
  $('again').onclick=()=>{game.reset();$('hud').hidden=false;closePanel();};
  $('end-home').onclick=()=>{$('menu').hidden=false;game.dispose();game=null;audio.setMood('chill');closePanel();};
}
function settings() {
  showPanel(`<span class="eyebrow">TRẢI NGHIỆM THEO CÁCH CỦA BẠN</span><h2>Cài đặt đồ họa</h2><label>Chất lượng<select id="quality"><option value="auto">Tự động · ưu tiên FPS ổn định</option><option value="low">Low · nhẹ nhất</option><option value="medium">Medium · cân bằng</option><option value="high">High · sắc nét hơn</option></select></label><p>Tự động chỉ điều chỉnh khi FPS thấp kéo dài. Chọn Low, Medium hoặc High để giữ nguyên chất lượng thủ công.</p><button class="option" id="toggle-stats">Bật / tắt bảng hiệu năng</button><button class="primary" id="settings-done">Xong</button>`);
  $('quality').value = preference;
  $('quality').onchange = e => {
    preference = e.target.value;
    try { localStorage.setItem('teacher-quality', preference); } catch { /* Private browsing can deny storage. */ }
    game?.setPreference(preference);
  };
  $('toggle-stats').onclick = () => { $('stats').hidden = !$('stats').hidden; game?.report(); };
  $('settings-done').onclick = closePanel;
  const sound=document.createElement('button');sound.className='option';sound.textContent=soundEnabled?'Nhạc nền và âm thanh: Bật':'Nhạc nền và âm thanh: Tắt';
  sound.onclick=()=>{setSoundEnabled(!soundEnabled);sound.textContent=soundEnabled?'Nhạc nền và âm thanh: Bật':'Nhạc nền và âm thanh: Tắt';};
  $('settings-done').before(sound);
}
function pauseMenu() {
  showPanel('<span class="eyebrow">NGHỈ MỘT CHÚT NHÉ</span><h2>Tiết học đang chờ bạn.</h2><button class="option" id="resume">Tiếp tục</button><button class="option" id="pause-settings">Cài đặt đồ họa</button><button class="option" id="restart">Bắt đầu lại tiết học</button><button class="option" id="home">Về màn hình đầu</button>');
  $('resume').onclick = closePanel;
  $('pause-settings').onclick = settings;
  $('restart').onclick = () => { game.reset(); closePanel(); };
  $('home').onclick = () => {
    $('hud').hidden = true; $('menu').hidden = false; game.dispose(); game = null;audio.setMood('chill');
    clearTimeout(toastTimer); $('toast').hidden = true; $('stats').textContent = ''; closePanel();
  };
}
function lessonMenu() {
  const state=game.lessonState;
  showPanel(`<span class="eyebrow">JAVASCRIPT CƠ BẢN · ${state.completedCount}/3 BÀI</span><h2>Bài giảng trên bảng</h2><p>Chọn bài, đóng hộp thoại và nhìn vào bảng để viết từng dòng. Sau khi viết xong, nhấn E để giải thích và hoàn thành bài.</p><div id="lesson-list"></div><div id="lesson-explanation"></div><button id="activity" class="option">Đổi hoạt động: cả lớp vươn vai và chia sẻ</button>`);
  for(const [index,status] of state.lessons.entries()) {
    const button=document.createElement('button');button.className='option';
    button.textContent=`${index+1}. ${LESSONS[index].title} · ${{locked:'Chưa mở khóa',available:'Viết bài',in_progress:state.allLinesVisible?'Đã viết đủ dòng':'Tiếp tục viết',completed:'Đã hoàn thành'}[status.status]}`;
    button.disabled=['locked','completed'].includes(status.status)||(status.status==='in_progress'&&state.allLinesVisible);
    button.onclick=()=>{if(game.teach(status.id)){closePanel();toast('Nhìn vào bảng để viết; có thể quay lại quan sát lớp bất cứ lúc nào.');}};
    $('lesson-list').append(button);
  }
  if(state.allLinesVisible) {
    const explanation=document.createElement('p');explanation.textContent=getLesson(state.activeLessonId).explanation;
    const finish=document.createElement('button');finish.className='primary';finish.textContent='Đã giải thích · Hoàn thành bài';
    finish.onclick=()=>{if(game.completeLesson()){lessonMenu();toast(game.lessonState.readyForAssessment?'Đã hoàn thành cả 3 bài JavaScript.':'Đã mở khóa bài tiếp theo.');}};
    $('lesson-explanation').append(explanation,finish);
  }
  if(state.readyForAssessment) {
    const done=document.createElement('p');done.textContent='Đã hoàn thành 3/3 bài. Hãy đến laptop để mở bài kiểm tra cuối giờ.';
    $('lesson-explanation').append(done);
  }
  $('activity').onclick=()=>{game.activity();closePanel();};
}
function interaction(target) {
  if (target === 'door') { game.toggleDoor(); return; }
  if (target === 'greet') { game.greetClass(); return; }
  if (target === 'seatClass') { game.seatClass(); return; }
  if (target === 'tribute') { game.startTribute(); return; }
  if (target === 'teacherChair') { game.sitDown(); return; }
  if (target === 'board') {
    lessonMenu();
  } else if (target === 'laptop') {
    if(!game.seated){game.sitDown();toast('Đã ngồi vào bàn giáo viên. Nhấn E để dùng máy tính.');return;}
    const state=game.lessonState;
    showPanel(`<span class="eyebrow">MÁY TÍNH GIÁO VIÊN</span><h2>Dạy học và chiếu lên bảng</h2><p>Ngồi tại bàn · ${state.completedCount}/3 bài JavaScript · ${game.resolved}/10 sự kiện đã xử lý</p><button id="use-laptop" class="option">Chiếu màn hình máy tính lên bảng</button><div id="computer-event"></div><div id="computer-lessons"></div><div id="computer-explanation"></div><div id="computer-exam"></div><button id="stop-project" class="option">Tắt chiếu</button><button id="stand-up" class="option">Đứng dậy khỏi ghế</button>`);
    $('use-laptop').onclick = () => { game.useLaptop(); closePanel(); };
    const event=game.events.active;
    if(event){
      const title=document.createElement('p');title.textContent=`Trong lớp: ${event.title}. Bạn có thể xử lý ngay tại máy tính.`;$('computer-event').append(title);
      event.choices.forEach((choice,index)=>{const button=document.createElement('button');button.className='option';button.textContent=choice.label;
        button.onclick=()=>{game.resolve(event.members[0],index);interaction('laptop');};$('computer-event').append(button);});
    }
    for(const [index,lesson] of LESSONS.entries()){
      const status=state.lessons[index].status;
      const button=document.createElement('button');button.className='option';button.textContent=`Dạy bài ${index+1}: ${lesson.title}`;
      button.disabled=status==='locked'||status==='completed';
      button.onclick=()=>{if(game.teachFromComputer(lesson.id))closePanel();};$('computer-lessons').append(button);
    }
    if(state.allLinesVisible){
      const explanation=document.createElement('p');explanation.textContent=getLesson(state.activeLessonId).explanation;
      const complete=document.createElement('button');complete.className='option';complete.textContent='Đã giải thích · Hoàn thành bài';
      complete.onclick=()=>{if(game.completeLesson()){closePanel();toast('Đã hoàn thành bài học trên máy tính và bảng.');}};
      $('computer-explanation').append(explanation,complete);
    }
    $('stop-project').onclick=()=>{game.leaveComputer();closePanel();};
    $('stand-up').onclick=()=>{game.standUp();closePanel();};
    if(state.readyForAssessment){const exam=document.createElement('button');exam.className='primary';exam.textContent=game.events.finished?'Mở bài kiểm tra cuối giờ':'Xử lý tình huống trong lớp trước khi kiểm tra';exam.disabled=!game.events.finished;exam.onclick=showExam;$('computer-exam').append(exam);}
  } else {
    showDialogue(target);
  }
}
$('start').onclick = async () => {
  if (loading) return;
  loading = true; $('start').disabled = true; $('start').textContent = 'Đang chuẩn bị lớp học…';
  audio.setEnabled(soundEnabled);
  // Start the music during the tap, before the lazy 3D module finishes loading.
  if(soundEnabled)void audio.startMusic();
  try {
    const { createGame } = await import('./world.js');
    game = createGame($('world'), { preference, toast, pauseMenu, interaction, onClassroom:updateClassroom, onTribute:showTribute, onDialogueTick:dialogueTick,onDialogueEnd:closeDialogue, onStats: text => { $('stats').textContent = text; }, onPrompt: text => { $('prompt').textContent = text; $('prompt').hidden = !text; }, onObjective: text => { $('objective').textContent = text; } }, {audio});
    game.setSound(soundEnabled);$('menu').hidden = true; $('hud').hidden = false; game.resume();
  } catch (error) { game?.dispose(); game = null; toast('Không thể mở lớp học. Hãy kiểm tra WebGL hoặc tải lại trang.'); console.error(error); }
  finally { loading = false; $('start').disabled = false; $('start').innerHTML = '<span aria-hidden="true">▶</span> Bắt đầu trải nghiệm'; }
};
$('settings-open').onclick = settings;
$('home-sound').onclick = () => {
  if(!soundEnabled){setSoundEnabled(true);return;}
  if(!audio.musicActive){void audio.startMusic();return;}
  setSoundEnabled(false);
};
document.addEventListener('pointerdown',event=>{
  if(soundEnabled&&!audio.musicActive&&!event.target.closest('#home-sound'))void audio.startMusic();
},{capture:true});
$('pause').onclick = pauseMenu;
$('panel-close').onclick = closePanel;
$('panel').addEventListener('cancel',e=>{if(game?.phase==='ending')e.preventDefault();});
$('dialogue-next').onclick=finishDialogue;
$('dialogue-text').onclick=()=>{if(dialogueState?.shown<dialogueState.text.length)dialogueTick(100);else if(dialogueState?.reply)finishDialogue();};
$('panel').addEventListener('close', () => {if(game?.phase==='tribute')game.cancelTribute();if (game && $('menu').hidden) game.resume();});
document.addEventListener('keydown', e => {
  if(dialogueState){
    if(['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();chooseDialogue(Number(e.code.at(-1))-1);return;}
    if(['Enter','Space','KeyE'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(dialogueState.shown<dialogueState.text.length)dialogueTick(100);else if(dialogueState.reply)finishDialogue();return;}
    if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(dialogueState.reply)finishDialogue();return;}
  }
  if (e.code === 'KeyP' && !$('panel').open) { $('stats').hidden = !$('stats').hidden; game?.report(); }
});
window.addEventListener('pagehide', () => { game?.dispose();audio.dispose();clearTimeout(toastTimer); });
