export const SLIDES = [
  ['JAVASCRIPT CƠ BẢN', 'Biến · Điều kiện · Vòng lặp'],
];

export function createLaptop() {
  let slide = 0;
  return {
    open() {},
    update() {},
    reset() { slide = 0; },
    next() { slide = (slide + 1) % SLIDES.length; return SLIDES[slide]; },
    get slide() { return slide; },
  };
}
