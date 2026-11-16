import test from 'node:test';
import assert from 'node:assert/strict';
import { ClassroomProgress } from '../src/classroom-progress.js';

const students=Array.from({length:10},(_,i)=>({name:`Student ${i}`,state:'Listening'}));

test('individual understanding produces all three endings and lessons count once',()=>{
  const happy=new ClassroomProgress();
  for(let i=0;i<3;i++)assert.equal(happy.recordLesson(i,students),true);
  assert.equal(happy.recordLesson(0,students),false);
  assert.equal(happy.examine(students).ending,'happy');
  assert.equal(happy.examine(students).passed,10);

  const normal=new ClassroomProgress();
  for(let i=0;i<3;i++)normal.recordLesson(i,students.map((student,index)=>({...student,state:index<5?'Listening':'Sleeping'})));
  assert.equal(normal.examine(students).passed,5);
  assert.equal(normal.examine(students).ending,'normal');

  const bad=new ClassroomProgress();
  assert.equal(bad.examine(students),null);
  for(let i=0;i<3;i++)bad.recordLesson(i,students.map(student=>({...student,state:'Sleeping'})));
  assert.equal(bad.examine(students).ending,'bad');
  bad.reset();assert.equal(bad.examine(students),null);
});

test('ignored behavior lowers only the affected student learning score',()=>{
  const progress=new ClassroomProgress();
  for(let i=0;i<3;i++)progress.recordLesson(i,students,{ignoredStudents:new Set([0])});
  const result=progress.examine(students);
  assert.equal(result.rows[0].score,7.3);
  assert.equal(result.rows[1].score,9.7);
});

test('good and bad exam outcomes produce scores that agree with the ending',()=>{
  const good=new ClassroomProgress();for(let i=0;i<3;i++)good.recordLesson(i,students);
  const goodResult=good.examine(students,{outcome:'good'});
  assert.equal(goodResult.passed,10);assert.equal(goodResult.ending,'happy');assert.ok(goodResult.rows.every(row=>row.score>=5));
  assert.equal(good.examine(students,{outcome:'bad'}),goodResult,'the result is fixed for the rest of this round');

  const bad=new ClassroomProgress();for(let i=0;i<3;i++)bad.recordLesson(i,students);
  const badResult=bad.examine(students,{outcome:'bad'});
  assert.equal(badResult.passed,0);assert.equal(badResult.ending,'bad');assert.ok(badResult.rows.every(row=>row.score<5));
});
