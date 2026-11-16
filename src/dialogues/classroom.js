// Ambient classroom chatter and state-based personal conversations.
export const CHATTER = Object.freeze([
  [[0,'Bài let này dễ nhớ ghê.'],[1,'Ừ, còn const thì không gán lại nhé.']],
  [[2,'Tớ vừa sửa được lỗi dấu ngoặc!'],[3,'Thiếu một dấu là chạy sai liền.']],
  [[4,'Mai nhóm mình làm giao diện chứ?'],[5,'Tớ lo phần màu sắc.']],
  [[6,'Cậu hiểu if và else chưa?'],[7,'Có, giống như hai ngã rẽ.']],
  [[8,'Mình nên đặt tên biến rõ nghĩa.'],[9,'Đọc code sẽ dễ hơn nhiều.']],
  [[0,'Hôm qua tớ debug tới khuya.'],[2,'Nhớ nghỉ mắt nữa nhé.']],
  [[1,'Hàm greet nhận tham số name.'],[3,'Rồi trả về một lời chào.']],
  [[4,'Cậu có ghi chú bài không?'],[6,'Có, tớ sẽ chia sẻ sau giờ.']],
  [[5,'Console báo lỗi ở dòng ba.'],[7,'Xem lại dấu nháy thử đi.']],
  [[8,'Học cùng bạn vui hơn hẳn.'],[0,'Mình cùng luyện bài cuối nhé.']],
  [[9,'Tớ muốn hỏi thầy cô về hàm.'],[1,'Cứ giơ tay đi, đừng ngại.']],
  [[2,'Dùng const cho giá trị cố định.'],[4,'Vậy let dùng khi cần đổi giá trị.']],
  [[3,'Có ai biết cách chạy code không?'],[5,'Mở console trên trình duyệt nhé.']],
  [[6,'Nếu điều kiện sai thì sao?'],[8,'Nhánh else sẽ được chạy.']],
  [[7,'Tớ thích ví dụ lớp CNTT.'],[9,'Vừa gần gũi vừa dễ nhớ.']],
]);

export const PERSONAL_DIALOGUES = Object.freeze({
  Confused:{title:'Chưa hiểu bài',line:'Em chưa rõ vì sao cần dùng if và else ạ.',choices:[
    {label:'Giải thích bằng một ví dụ gần gũi',effect:[-1,5,10],noise:-2,reply:'À, giờ em hiểu hai nhánh rồi ạ!'},
    {label:'Gợi ý em thử tự viết một điều kiện',effect:[2,3,7],noise:0,reply:'Em sẽ thử, nếu sai thầy cô xem giúp nhé.'},
    {label:'Hẹn em hỏi sau giờ để tiếp tục bài',effect:[5,-3,1],noise:1,reply:'Dạ, em sẽ ghi câu hỏi lại.'},
  ]},
  RaisingHand:{title:'Hỏi bài',line:'Thầy cô ơi, em có một câu hỏi về JavaScript.',choices:[
    {label:'Mời em hỏi và cùng lớp thảo luận',effect:[-2,7,9],noise:2,reply:'Cảm ơn thầy cô, các bạn giúp em hiểu rồi ạ.'},
    {label:'Trả lời ngắn gọn rồi tiếp tục',effect:[5,0,4],noise:-1,reply:'Dạ, em sẽ thử lại ví dụ.'},
  ]},
  Answering:{title:'Thiếu tự tin',line:'Em sợ trả lời sai trước cả lớp ạ.',choices:[
    {label:'Động viên em nói từng bước',effect:[-1,9,8],noise:1,reply:'Dạ, em sẽ thử. Cảm ơn thầy cô!'},
    {label:'Cho em thêm thời gian suy nghĩ',effect:[0,6,5],noise:-1,reply:'Em bình tĩnh hơn rồi ạ.'},
  ]},
  WrongAnswer:{title:'Trả lời sai',line:'Em nói nhầm mất rồi… có phải em chưa hiểu hàm không ạ?',choices:[
    {label:'Cùng em tìm lỗi và thử lại',effect:[-2,7,10],noise:2,reply:'Dạ, em thấy lỗi rồi. Em muốn thử lại!'},
    {label:'Giải thích đáp án để cả lớp theo kịp',effect:[5,1,5],noise:-2,reply:'Dạ, em sẽ xem lại cách làm.'},
  ]},
  Unsure:{title:'Mất tự tin',line:'Em biết ý nhưng hơi run khi nói trước lớp.',choices:[
    {label:'Cho em nói từng bước, không vội',effect:[-1,9,7],noise:2,reply:'Dạ, em tự tin hơn rồi ạ.'},
    {label:'Mời một bạn hỗ trợ em',effect:[1,6,5],noise:4,reply:'Có bạn giúp nên em thấy dễ hơn.'},
  ]},
  Listening:{title:'Kiểm tra mức độ hiểu bài',speaker:'Thầy cô',line:'Em đã hiểu bài chưa?',automatic:true,choices:[
    {label:'Có',effect:[0,0,0],noise:0,stress:-2,nextState:'Listening',reply:'Dạ có ạ, em đã hiểu bài rồi!'},
    {label:'Không',effect:[0,0,0],noise:0,stress:4,nextState:'Confused',reply:'Dạ chưa ạ, thầy cô có thể giải thích thêm cho em không?'},
  ]},
});
