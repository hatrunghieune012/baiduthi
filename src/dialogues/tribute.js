// Closing conversation shown after the final exam.
export const TRIBUTE_DIALOGUE = Object.freeze([
  ['Hiếu','Thầy cô ơi, thầy cô đợi chúng em một chút được không ạ?'],
  ['Anh Kiên','Hôm nay tụi em đã làm thầy cô phải nhắc nhở nhiều lần...'],
  ['Minh Lý','Em xin lỗi thầy cô vì đã ngủ gật trong giờ học.'],
  ['Anh Tuấn','Em cũng xin lỗi thầy cô vì đã chơi điện thoại thay vì chú ý nghe giảng.'],
  ['Thiên Lương','Có những kiến thức chúng em chưa hiểu ngay, nhưng thầy cô vẫn kiên nhẫn giải thích.'],
  ['Ngọc Hùng','Cảm ơn thầy cô vì không chỉ dạy chúng em lập trình, mà còn dạy chúng em sự cố gắng và trách nhiệm.'],
  ['Cả lớp','CHÚNG EM CẢM ƠN THẦY CÔ!'],
  ['Giảng viên','Cảm ơn các em. Thầy cô chỉ mong sau mỗi buổi học, các em đều học được điều gì đó có ích cho tương lai.'],
]);

export const TRIBUTE_LETTERS = Object.freeze({
  good:Object.freeze({
    title:'GỬI THẦY CÔ KÍNH MẾN!',
    paragraphs:Object.freeze([
      'Nhân Ngày Nhà giáo Việt Nam 20/11, tập thể lớp CNTT chúng em xin gửi đến thầy cô những lời cảm ơn chân thành nhất.',
      'Cảm ơn thầy cô đã luôn tận tâm giảng dạy, kiên nhẫn giải thích những kiến thức chúng em chưa hiểu và truyền cho chúng em niềm yêu thích học tập.',
      'Dù đôi lúc lớp còn ồn ào, mất tập trung, thầy cô vẫn luôn cố gắng mang đến những bài học bổ ích.',
      'Chúng em sẽ tiếp tục cố gắng học tập để không phụ lòng thầy cô.',
      'Kính chúc thầy cô luôn mạnh khỏe, hạnh phúc, thành công và giữ mãi ngọn lửa nhiệt huyết với nghề giáo.',
      'CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11!',
      '— Tập thể lớp CNTT',
    ]),
  }),
  bad:Object.freeze({
    title:'GỬI THẦY CÔ KÍNH MẾN!',
    paragraphs:Object.freeze([
      'Nhân Ngày Nhà giáo Việt Nam 20/11, trước hết, tập thể lớp CNTT chúng em muốn gửi đến thầy cô một lời xin lỗi chân thành.',
      'Trong giờ học, chúng em đã có những lúc thiếu tập trung, nói chuyện riêng, ngủ gật và chơi điện thoại, khiến thầy cô phải nhắc nhở nhiều lần.',
      'Kết quả bài kiểm tra chưa tốt khiến chúng em nhận ra mình đã chưa trân trọng đúng mức những kiến thức và công sức thầy cô truyền đạt.',
      'Đặc biệt, những bạn có điểm thấp muốn gửi lời xin lỗi vì đã chưa cố gắng hết mình.',
      'Chúng em xin hứa sẽ nghiêm túc hơn trong học tập, chủ động tìm hiểu bài, tích cực phát biểu và cải thiện kết quả trong những buổi học tiếp theo.',
      'Cảm ơn thầy cô vì đã luôn kiên nhẫn, tận tâm và không ngừng động viên chúng em.',
      'Kính chúc thầy cô luôn mạnh khỏe, hạnh phúc, bình an và có thật nhiều niềm vui trong sự nghiệp trồng người.',
      'CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11!',
      '— Tập thể lớp CNTT',
    ]),
  }),
});

export function selectTributeLetter(result){
  return result?.outcome==='good'||result?.ending==='happy'?'good':'bad';
}

export const TRIBUTE_ENDING_SCREEN = Object.freeze({
  title:'TRI ÂN THẦY CÔ — 20/11',
  paragraphs:Object.freeze([
    'Có những bài học theo chúng ta suốt cuộc đời.',
    'Có những lời dạy trở thành hành trang trên con đường trưởng thành.',
    'Và có những người thầy, người cô đã âm thầm dành cả tâm huyết để giúp chúng ta tiến về phía trước.',
    'Cảm ơn thầy cô vì tất cả!',
  ]),
});
