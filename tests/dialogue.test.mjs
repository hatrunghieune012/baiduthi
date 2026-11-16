import test from 'node:test';
import assert from 'node:assert/strict';
import { CHATTER, PERSONAL_DIALOGUES } from '../src/dialogues/classroom.js';
import { TRIBUTE_DIALOGUE, TRIBUTE_LETTERS, TRIBUTE_ENDING_SCREEN, selectTributeLetter } from '../src/dialogues/tribute.js';
import { EVENT_DEFINITIONS, LessonEvents } from '../src/events.js';

test('classroom chatter has fifteen varied exchanges with valid student speakers',()=>{
  assert.ok(CHATTER.length>=15);
  assert.equal(new Set(CHATTER.map(pair=>pair.map(line=>line[1]).join('|'))).size,CHATTER.length);
  for(const pair of CHATTER){assert.equal(pair.length,2);for(const [index,line] of pair){assert.ok(index>=0&&index<10);assert.ok(line.length>10);}}
});

test('branching responses change class metrics including noise',()=>{
  for(const dialogue of [...Object.values(EVENT_DEFINITIONS),...Object.values(PERSONAL_DIALOGUES)]){
    assert.ok(dialogue.choices.length>=2);
    assert.equal(new Set(dialogue.choices.map(choice=>JSON.stringify([choice.effect,choice.noise,choice.stress]))).size,dialogue.choices.length);
  }
  const events=new LessonEvents();events.lesson(0);events.update(1);
  const before={...events.metrics};events.resolve(3,0);
  assert.notDeepEqual(events.metrics,before);
  assert.ok(events.metrics.noise<before.noise);
});

test('tribute uses the recorded exam outcome to select the right letter and shared ending',()=>{
  assert.equal(selectTributeLetter({outcome:'good',ending:'happy'}),'good');
  assert.equal(selectTributeLetter({outcome:'bad',ending:'bad'}),'bad');
  assert.equal(selectTributeLetter({ending:'happy'}),'good');
  assert.match(TRIBUTE_LETTERS.good.title,/THẦY CÔ/);
  assert.match(TRIBUTE_LETTERS.bad.paragraphs.join(' '),/xin lỗi chân thành/);
  assert.ok(TRIBUTE_LETTERS.good.paragraphs.some(line=>line.includes('mạnh khỏe, hạnh phúc, thành công')));
  assert.equal(TRIBUTE_DIALOGUE.at(-2)[1],'CHÚNG EM CẢM ƠN THẦY CÔ!');
  assert.equal(TRIBUTE_ENDING_SCREEN.title,'TRI ÂN THẦY CÔ — 20/11');
  assert.ok(TRIBUTE_ENDING_SCREEN.paragraphs.at(-1).includes('Cảm ơn thầy cô vì tất cả!'));
});

test('Anh Kiên and Ngọc Hùng talk about Liên Quân in the classroom disturbance',()=>{
  assert.match(EVENT_DEFINITIONS.talking.title,/Liên Quân/);
  assert.match(EVENT_DEFINITIONS.talking.lines[0],/Liên Quân/);
  assert.match(EVENT_DEFINITIONS.talking.lines[1],/giao tranh/);
});
