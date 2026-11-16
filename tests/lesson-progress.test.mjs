import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, getLesson } from '../src/lessons.js';
import { LessonProgress } from '../src/lesson-progress.js';

test('three lessons contain the requested code in order and immutable content', () => {
  assert.deepEqual(LESSONS.map(lesson => [...lesson.lines]), [
    ['let age = 18;', 'const name = "Hiếu";', 'console.log(name);'],
    ['let score = 8;', 'if (score >= 5) {', '  console.log("Đạt");', '} else { console.log("Chưa đạt"); }'],
    ['for (let i = 1; i <= 5; i++) {', '  console.log("Xin chào", i);', '}'],
  ]);
  assert.equal(new Set(LESSONS.map(lesson => lesson.id)).size, 3);
  assert.ok(LESSONS.every(lesson => lesson.explanation.length > 0));
  assert.equal(getLesson('unknown'), null);
  assert.throws(() => { LESSONS[0].lines.push('bad'); }, TypeError);
  assert.throws(() => { LESSONS[0].title = 'changed'; }, TypeError);
});

test('locked and unknown lessons cannot skip the sequence or alter an active lesson', () => {
  const progress = new LessonProgress();
  const initial = progress.snapshot();
  assert.deepEqual(initial.lessons.map(lesson => lesson.status), ['available', 'locked', 'locked']);
  for (const id of [LESSONS[1].id, LESSONS[2].id, 'unknown', null, undefined]) {
    assert.equal(progress.startLesson(id), false);
    assert.deepEqual(progress.snapshot(), initial);
  }
  assert.equal(progress.revealNextLine(), null);
  assert.equal(progress.confirmExplanation(), false);
  assert.equal(progress.completeLesson(), false);
  progress.startLesson(LESSONS[0].id);
  progress.revealNextLine();
  const active = progress.snapshot();
  assert.equal(progress.startLesson(LESSONS[1].id), false);
  assert.equal(progress.startLesson(LESSONS[0].id), true);
  assert.deepEqual(progress.snapshot(), active, 'resuming must not erase writing');
});

test('all lines and explanation are required; assessment unlocks only after all lessons', () => {
  const progress = new LessonProgress();
  for (const [index, lesson] of LESSONS.entries()) {
    assert.equal(progress.readyForAssessment, false);
    assert.equal(progress.startLesson(lesson.id), true);
    assert.equal(progress.snapshot().lessons[index].status, 'in_progress');
    for (const [lineIndex, line] of lesson.lines.entries()) {
      assert.equal(progress.confirmExplanation(), false);
      assert.equal(progress.completeLesson(), false);
      assert.equal(progress.revealNextLine(), line);
      assert.equal(progress.snapshot().visibleLines.length, lineIndex + 1);
    }
    assert.equal(progress.revealNextLine(), null);
    assert.equal(progress.completeLesson(), false, 'explanation is still required');
    assert.equal(progress.snapshot().allLinesVisible, true);
    assert.equal(progress.confirmExplanation(), true);
    assert.equal(progress.completeLesson(), true);
    assert.equal(progress.completeLesson(), false, 'no double completion');
    assert.equal(progress.startLesson(lesson.id), false, 'completed lesson cannot earn progress twice');
    assert.equal(progress.snapshot().completedCount, index + 1);
  }
  assert.equal(progress.readyForAssessment, true);
  assert.equal(progress.snapshot().nextLessonId, null);
  assert.deepEqual(progress.snapshot().lessons.map(lesson => lesson.status), ['completed', 'completed', 'completed']);
  assert.equal(progress.startLesson(undefined), false);
});

test('snapshots are isolated and reset restores all locks without affecting other sessions', () => {
  const a = new LessonProgress(), b = new LessonProgress();
  const snapshot = a.snapshot();
  assert.throws(() => { snapshot.lessons[2].status = 'available'; }, TypeError);
  assert.throws(() => { snapshot.visibleLines.push('bad'); }, TypeError);
  for (const lesson of LESSONS) {
    a.startLesson(lesson.id);
    lesson.lines.forEach(() => a.revealNextLine());
    a.confirmExplanation(); a.completeLesson();
  }
  assert.deepEqual(b.snapshot(), snapshot);
  a.reset(); assert.deepEqual(a.snapshot(), snapshot);
  a.startLesson(LESSONS[0].id); a.revealNextLine();
  a.reset(); assert.deepEqual(a.snapshot(), snapshot);
});
