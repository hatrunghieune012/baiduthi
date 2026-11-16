import test from 'node:test';
import assert from 'node:assert/strict';
import { LessonEvents, EVENT_DEFINITIONS, applyEffects } from '../src/events.js';

test('ten lesson events stay on their lesson and never replay completed incidents',()=>{
  const activated=[],events=new LessonEvents(event=>activated.push([event.lessonId,event.kind]));
  events.update(60);assert.equal(events.active,null);
  events.lesson(0);events.update(0.9);assert.equal(events.active.kind,'talking');
  assert.equal(events.resolve(0,0),null);events.resolve(3,0);events.resolve(4,0);
  events.update(0.9);assert.equal(events.active.kind,'question1');
  events.resolve(8,0);events.update(0.9);assert.equal(events.active.kind,'phoneAudio');events.resolve(6,0);events.finishLesson();
  assert.ok(events.records.filter(event=>event.lessonId===1).every(event=>event.status==='Completed'));

  events.lesson(1);events.update(0.9);assert.equal(events.active.kind,'sleeping');
  events.lesson(2);assert.equal(events.active,null);assert.equal(events.pending.kind,'playing');
  assert.equal(events.currentLesson,3);
  events.update(0.9);assert.equal(events.active.kind,'playing');
  assert.deepEqual(activated,[ [1,'talking'],[1,'question1'],[1,'phoneAudio'],[2,'sleeping'],[3,'playing'] ]);
  assert.equal(events.records.length,10);
  assert.equal(events.records.filter(event=>event.lessonId===3&&event.status==='Pending').length,3);
});

test('all ten students have event targets and a transition clears old active actors',()=>{
  const events=new LessonEvents();
  for(let lesson=0;lesson<3;lesson++)events.lesson(lesson);
  const allMembers=Object.values(EVENT_DEFINITIONS).flatMap(event=>event.members);
  assert.deepEqual([...new Set(allMembers)].sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8,9]);
  events.update(1);assert.equal(events.active.lessonId,3);
  const oldMembers=[...events.active.members];
  const transition=events.lesson(0);
  assert.deepEqual(transition.cancelledNpcIds,[]); // Re-selecting an old lesson cannot regress state.
  assert.equal(events.currentLesson,3);
  assert.ok(oldMembers.every(index=>events.forStudent(index)));
});

test('reminding two students counts stress once and skipped students retain a learning penalty',()=>{
  const events=new LessonEvents();events.lesson(1);events.update(1);
  assert.equal(events.active.kind,'sleeping');assert.equal(events.metrics.stress,26);
  events.resolve(1,0);events.resolve(6,0);
  assert.equal(events.reminders,1);assert.equal(events.metrics.stress,26);

  events.lesson(2);events.update(1);events.resolve(2,1);
  assert.ok(events.ignoredStudents.has(2));assert.equal(events.active.members.includes(2),false);
  assert.equal(events.records.find(event=>event.kind==='sleeping').status,'Completed');
});

test('every event has a lesson, lifecycle fields, two choices and bounded metrics',()=>{
  assert.equal(Object.keys(EVENT_DEFINITIONS).length,10);
  for(const [kind,event] of Object.entries(EVENT_DEFINITIONS)){
    assert.equal(event.choices.length,2);const game=new LessonEvents();game.lesson(['talking','question1','phoneAudio'].includes(kind)?0:['sleeping','question2','spilling'].includes(kind)?1:2);
    game.activate(kind);assert.equal(game.active.status,'Active');assert.equal(game.active.lessonId,game.currentLesson);
    assert.ok(game.active.id);assert.ok(game.active.npcIds.length);
    const member=game.active.members[0];assert.ok(game.resolve(member,0));
  }
  const metrics={attention:98,warmth:2,understanding:99};applyEffects(metrics,[10,-10,9]);assert.deepEqual(metrics,{attention:100,warmth:0,understanding:100});
});

test('each distraction occurrence adds stress once; grading outcomes apply only their specified change',()=>{
  const events=new LessonEvents();events.lesson(0);events.update(1);
  assert.equal(events.distractionOccurred,2);assert.equal(events.metrics.stress,26);
  const active=events.active;events.activate(active);assert.equal(events.metrics.stress,26);
  events.applyExamOutcome('bad');assert.equal(events.metrics.stress,26);
  events.applyExamOutcome('good');assert.equal(events.metrics.stress,0);
  assert.equal(events.distractionProcessed,0);
});
