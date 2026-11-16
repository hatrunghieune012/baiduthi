import test from 'node:test';
import assert from 'node:assert/strict';
import { createLessonBoard, BOARD_SIZE } from '../src/lesson-board.js';
import { LESSONS } from '../src/lessons.js';

function setup() {
  let uploads=0,painted=[],strokes=0,sounding=false,ready=0;
  const texture={image:{},set needsUpdate(value){if(value)uploads++;}};
  const ctx={fillRect(){painted=[];},fillText(text,x,y,maxWidth){painted.push({text,x,y,maxWidth});}};
  const board=createLessonBoard({ctx,texture},{
    actions:{start(){strokes++;},reset(){}},
    audio:{startWriting(){sounding=true;},stopWriting(){sounding=false;}},
    onReady(){ready++;},
  });
  board.reset();
  const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*100);i++)board.update(0.01,true);};
  return {board,texture,ctx,tick,get uploads(){return uploads;},get painted(){return painted;},get strokes(){return strokes;},get sounding(){return sounding;},get ready(){return ready;}};
}

test('board reveals one line per interval and never uploads unchanged frames',()=>{
  const h=setup();assert.equal(h.texture.image.width,BOARD_SIZE.width);assert.equal(h.texture.image.height,BOARD_SIZE.height);
  assert.equal(h.board.start(LESSONS[1].id),false);assert.equal(h.uploads,1);
  h.board.start(LESSONS[0].id);const before=h.uploads;
  h.tick(0.6);assert.equal(h.board.state.visibleLines.length,0);assert.equal(h.uploads,before);assert.equal(h.sounding,true);
  h.tick(0.7);assert.equal(h.board.state.visibleLines.length,1);assert.equal(h.uploads,before+1);
  h.tick(2.5);assert.deepEqual(h.board.state.visibleLines,LESSONS[0].lines);assert.equal(h.ready,1);assert.equal(h.sounding,false);
  const finishedUploads=h.uploads;h.tick(30);assert.equal(h.uploads,finishedUploads);assert.equal(h.ready,1);
  assert.equal(h.board.complete(),true);assert.equal(h.board.complete(),false);
  h.board.start(LESSONS[1].id);h.tick(1.3);assert.equal(h.board.state.visibleLines.length,1);assert.equal(h.board.complete(),false);
  h.tick(1.2);assert.equal(h.board.state.visibleLines.length,2);h.tick(2.4);assert.equal(h.board.state.visibleLines.length,4);
});

test('leaving board stops sound/writing, E resumes partial progress, and reset cancels work',()=>{
  const h=setup();h.board.start(LESSONS[0].id);h.tick(0.6);
  h.board.update(0.02,false);assert.equal(h.board.writing,false);assert.equal(h.sounding,false);
  h.tick(10);assert.equal(h.board.state.visibleLines.length,0);
  const uploads=h.uploads;h.board.start(LESSONS[0].id);assert.equal(h.uploads,uploads);h.tick(3.1);
  assert.equal(h.board.state.allLinesVisible,true);
  h.board.complete();h.board.start(LESSONS[1].id);h.tick(1.3);h.board.stop();
  assert.equal(h.board.state.visibleLines.length,1);
  h.board.reset();h.tick(10);assert.equal(h.board.state.completedCount,0);assert.equal(h.board.state.activeLessonId,null);assert.equal(h.sounding,false);
});

test('three lessons fit the board and completed code remains visible until the next lesson',()=>{
  const h=setup();
  for(const lesson of LESSONS){
    h.board.start(lesson.id);h.tick(6);
    assert.deepEqual(h.painted.filter(p=>lesson.lines.includes(p.text)).map(p=>p.text),lesson.lines);
    assert.equal(h.ctx.textAlign,'left');
    for(const draw of h.painted){assert.ok(draw.x>=0&&draw.x+draw.maxWidth<=BOARD_SIZE.width);assert.ok(draw.y>0&&draw.y<BOARD_SIZE.height);}
    assert.equal(h.board.complete(),true);
    assert.deepEqual(h.painted.filter(p=>lesson.lines.includes(p.text)).map(p=>p.text),lesson.lines);
  }
  assert.equal(h.board.state.readyForAssessment,true);assert.equal(h.board.start(LESSONS[0].id),false);
});
