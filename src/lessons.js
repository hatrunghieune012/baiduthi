// V3 Phase 1: immutable content only. Code is displayed as text, never evaluated.
/** @typedef {{id:string, title:string, lines:readonly string[], explanation:string}} Lesson */

/** @type {readonly Lesson[]} */
export const LESSONS = Object.freeze([
  Object.freeze({
    id: 'variables',
    title: 'Khai báo biến',
    lines: Object.freeze(['let age = 18;', 'const name = "Hiếu";', 'console.log(name);']),
    explanation: 'let khai báo biến có thể gán lại. const giữ giá trị không đổi. console.log in tên Hiếu ra màn hình console.',
  }),
  Object.freeze({
    id: 'conditions',
    title: 'Câu lệnh điều kiện',
    lines: Object.freeze(['let score = 8;', 'if (score >= 5) {', '  console.log("Đạt");', '} else { console.log("Chưa đạt"); }']),
    explanation: 'Nếu score từ 5 trở lên, nhánh if chạy và in Đạt. Nếu không, nhánh else in Chưa đạt.',
  }),
  Object.freeze({
    id: 'loops',
    title: 'Vòng lặp for',
    lines: Object.freeze(['for (let i = 1; i <= 5; i++) {', '  console.log("Xin chào", i);', '}']),
    explanation: 'Vòng lặp chạy từ i bằng 1 đến 5. Khi i bằng 6, điều kiện i <= 5 sai nên vòng lặp dừng.',
  }),
]);

export function getLesson(id) {
  return LESSONS.find(lesson => lesson.id === id) ?? null;
}
