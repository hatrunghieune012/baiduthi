import { LESSONS, getLesson } from './lessons.js';

/**
 * Lesson progression, independent of V2's LessonEvents classroom incidents.
 * No rendering, audio, timers, storage or frame loop. Phase 2 will drive these
 * transitions from the existing shared game loop and board interaction.
 */
export class LessonProgress {
  #completedCount = 0;
  #activeId = null;
  #visibleLineCount = 0;
  #explanationConfirmed = false;

  get readyForAssessment() { return this.#completedCount === LESSONS.length; }

  /** Start/resume only the first unfinished lesson. Invalid requests do nothing. */
  startLesson(id) {
    if (LESSONS[this.#completedCount]?.id !== id || !getLesson(id)) return false;
    if (this.#activeId === id) return true;
    this.#activeId = id;
    this.#visibleLineCount = 0;
    this.#explanationConfirmed = false;
    return true;
  }

  /** Advance one line; the caller controls the timing. Returns null at the end. */
  revealNextLine() {
    const lesson = getLesson(this.#activeId);
    if (!lesson || this.#visibleLineCount >= lesson.lines.length) return null;
    return lesson.lines[this.#visibleLineCount++];
  }

  confirmExplanation() {
    const lesson = getLesson(this.#activeId);
    if (!lesson || this.#visibleLineCount !== lesson.lines.length) return false;
    this.#explanationConfirmed = true;
    return true;
  }

  /** Completing requires all lines and an explicit explanation acknowledgement. */
  completeLesson() {
    if (!this.#activeId || !this.#explanationConfirmed) return false;
    this.#completedCount++;
    this.#activeId = null;
    this.#visibleLineCount = 0;
    this.#explanationConfirmed = false;
    return true;
  }

  reset() {
    this.#completedCount = 0;
    this.#activeId = null;
    this.#visibleLineCount = 0;
    this.#explanationConfirmed = false;
  }

  /** Detached, frozen view; consumers cannot unlock lessons by mutating it. */
  snapshot() {
    const active = getLesson(this.#activeId);
    return Object.freeze({
      activeLessonId: this.#activeId,
      nextLessonId: LESSONS[this.#completedCount]?.id ?? null,
      completedCount: this.#completedCount,
      visibleLines: Object.freeze(active ? active.lines.slice(0, this.#visibleLineCount) : []),
      allLinesVisible: Boolean(active && this.#visibleLineCount === active.lines.length),
      explanationConfirmed: this.#explanationConfirmed,
      readyForAssessment: this.readyForAssessment,
      lessons: Object.freeze(LESSONS.map((lesson, index) => Object.freeze({
        id: lesson.id,
        status: index < this.#completedCount ? 'completed'
          : lesson.id === this.#activeId ? 'in_progress'
          : index === this.#completedCount ? 'available' : 'locked',
      }))),
    });
  }
}
