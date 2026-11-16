import { LessonProgress } from './lesson-progress.js';
import { getLesson } from './lessons.js';

export const LINE_SECONDS = 1.2;
export const BOARD_SIZE = Object.freeze({ width: 768, height: 228 });

// Driven by world.js's existing loop. Owns no timers or GPU resources.
export function createLessonBoard(board, { actions, audio, onChange = () => {}, onReady = () => {} }) {
  const progress = new LessonProgress();
  let state = progress.snapshot(), displayedId = null, writing = false, elapsed = 0, lastPaint = '';
  board.texture.image.width = BOARD_SIZE.width;
  board.texture.image.height = BOARD_SIZE.height;

  function paint() {
    const key = `${displayedId}:${state.visibleLines.length}:${state.completedCount}`;
    if (key === lastPaint) return;
    lastPaint = key;
    const lesson = getLesson(displayedId), ctx = board.ctx;
    ctx.fillStyle = '#214b3d'; ctx.fillRect(0, 0, BOARD_SIZE.width, BOARD_SIZE.height);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#e9d99b'; ctx.font = '24px Arial';
    ctx.fillText(lesson ? lesson.title : 'JavaScript cơ bản', 24, 34, 720);
    const completed = lesson && state.activeLessonId !== displayedId;
    const lines = completed ? lesson.lines : state.visibleLines;
    ctx.font = '25px Consolas, monospace';
    lines.forEach((line, i) => {
      ctx.fillStyle = '#9db9a5'; ctx.fillText(String(i + 1), 24, 76 + i * 34, 30);
      ctx.fillStyle = '#fff9df'; ctx.fillText(line, 60, 76 + i * 34, 684);
    });
    ctx.font = '16px Arial'; ctx.fillStyle = '#c5d3bf';
    const footer = !lesson ? 'Đến gần bảng và nhấn E để chọn bài.'
      : completed ? `Đã hoàn thành · ${state.completedCount}/3 bài`
      : state.allLinesVisible ? 'Nhấn E tại bảng để giải thích và hoàn thành bài.'
      : 'Viết từng dòng · Nhìn vào bảng; nhấn E để tiếp tục nếu rời bảng.';
    ctx.fillText(footer, 24, 211, 720);
    board.texture.needsUpdate = true;
  }
  function publish() { state = progress.snapshot(); paint(); onChange(state); }
  function stop() {
    if (writing) actions.reset();
    writing = false; audio.stopWriting();
  }
  function stroke() { actions.start('write', LINE_SECONDS); audio.startWriting(); }
  function start(id) {
    if (!progress.startLesson(id)) return false;
    if (displayedId !== id) { displayedId = id; elapsed = 0; }
    publish();
    writing = !state.allLinesVisible;
    if (writing) stroke();
    return true;
  }
  function update(dt, facingBoard) {
    if (!writing) return;
    if (!facingBoard) { stop(); return; }
    if (!Number.isFinite(dt) || dt <= 0) return;
    elapsed += Math.min(dt, 0.1);
    if (elapsed < LINE_SECONDS) return;
    elapsed = 0; progress.revealNextLine(); publish();
    if (state.allLinesVisible) { stop(); onReady(getLesson(displayedId)); }
    else stroke();
  }
  function complete() {
    if (!progress.confirmExplanation() || !progress.completeLesson()) return false;
    stop(); elapsed = 0; publish(); return true;
  }
  function reset() {
    stop(); progress.reset(); displayedId = null; elapsed = 0; lastPaint = ''; publish();
  }
  function refresh(){lastPaint='';paint();}
  return { start, update, complete, reset, stop, refresh, get state() { return state; }, get writing() { return writing; } };
}
