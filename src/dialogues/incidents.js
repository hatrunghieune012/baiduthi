// Dialogue and choice data for the seven lesson-specific classroom incidents.
export const EVENT_DEFINITIONS = {
  talking:{title:'Anh Kiên và Ngọc Hùng bàn chuyện Liên Quân trong lớp',state:'Talking',members:[3,4],lines:['Ngọc Hùng ơi, tối qua cậu chơi Liên Quân trận hạng thế nào?','Đội tớ giao tranh cuối trận chưa tốt nên thua mất rồi.'],choices:[
    {label:'Nhắc hai em chú ý bài học',effect:[7,1,0],noise:-8,remind:true,reply:'Dạ, chúng em xin lỗi thầy ạ.'},
    {label:'Tiếp tục giảng',effect:[-4,0,0],noise:5,remind:false,reply:'Anh Kiên và Ngọc Hùng vẫn bàn chuyện trận Liên Quân.'},
  ]},
  sleeping:{title:'Sinh viên ngủ gật',state:'Sleeping',members:[1,6],lines:['Zzz…','Khò…'],choices:[
    {label:'Nhắc sinh viên tỉnh dậy',effect:[5,1,0],noise:2,remind:true,reply:'Dạ, em đang nghe thầy ạ!'},
    {label:'Tiếp tục giảng',effect:[-2,0,0],noise:0,remind:false,reply:'Sinh viên vẫn ngủ gật trên bàn.'},
  ]},
  playing:{title:'Sinh viên dùng điện thoại',state:'Playing',members:[2,7],lines:['Xem điện thoại một chút chắc không sao…','Tin nhắn này xem nhanh thôi…'],choices:[
    {label:'Nhắc sinh viên cất điện thoại',effect:[5,1,0],noise:-2,remind:true,reply:'Dạ, em cất ngay ạ!'},
    {label:'Tiếp tục giảng',effect:[-3,0,0],noise:1,remind:false,reply:'Sinh viên vẫn nhìn vào điện thoại.'},
  ]},
  phoneAudio:{title:'Điện thoại Đức Khang phát âm thanh Liên Quân',state:'Playing',members:[6],lines:['Âm thanh Liên Quân vang lên từ điện thoại của Đức Khang!'],reaction:{npcId:2,line:'Đức Khang, cậu tắt tiếng điện thoại đi!'},choices:[
    {label:'Nhắc Đức Khang tắt âm thanh',effect:[5,1,0],noise:-2,remind:true,reply:'Dạ, em xin lỗi. Em tắt tiếng ngay ạ!'},
    {label:'Tiếp tục giảng',effect:[-3,0,0],noise:2,remind:false,reply:'Điện thoại của Đức Khang vẫn phát âm thanh.'},
  ]},
  gameArgument:{title:'Hiếu và Tuấn Anh tranh luận về trận game',state:'Talking',members:[0,7],lines:['Trận vừa rồi đội mình đáng ra phải thắng!','Tại pha giao tranh cuối xử lý chưa tốt thôi!'],choices:[
    {label:'Yêu cầu hai em giữ trật tự',effect:[7,1,0],noise:-6,remind:true,reply:'Dạ, chúng em xin lỗi thầy. Chúng em sẽ chú ý bài.'},
    {label:'Tiếp tục giảng',effect:[-4,0,0],noise:5,remind:false,reply:'Hiếu và Tuấn Anh vẫn tranh luận khá lớn.'},
  ]},
  spilling:{title:'Ngọc Hùng làm đổ chai nước',state:'Spilling',members:[4],lines:['Ôi, Ngọc Hùng vô tình làm đổ chai nước rồi!'],reaction:{npcId:3,line:'Ngọc Hùng, cẩn thận nhé! Để tớ lấy khăn.'},choices:[
    {label:'Nhắc Ngọc Hùng dọn nước cẩn thận',effect:[4,2,0],noise:-1,remind:true,reply:'Dạ, em xin lỗi. Em sẽ lau dọn cẩn thận ạ.'},
    {label:'Tiếp tục giảng',effect:[-2,0,0],noise:1,remind:false,reply:'Ngọc Hùng đang cố gắng dọn chỗ nước bị đổ.'},
  ]},
  question:{title:'Thiên Lương hỏi về vòng lặp',state:'RaisingHand',members:[5],lines:['Thầy ơi, tại sao vòng lặp for lại dừng ở số 5 ạ?'],choices:[
    {label:'Giải thích điều kiện i <= 5',effect:[2,3,8],noise:1,remind:false,reply:'Vì khi i bằng 6, điều kiện không còn đúng. Dạ, em hiểu rồi ạ!'},
    {label:'Mời cả lớp cùng suy nghĩ',effect:[-1,4,5],noise:3,remind:false,reply:'Các bạn cùng giải thích cho Thiên Lương. Dạ, em hiểu rồi ạ!'},
  ]},
  question1:{title:'Quang Diệu hỏi về let và const',state:'RaisingHand',members:[8],lines:['Thầy ơi, let và const khác nhau thế nào ạ?'],choices:[
    {label:'Giải thích let và const',effect:[2,3,8],noise:0,remind:false,reply:'let có thể gán lại giá trị, còn const thì không thể gán lại. Dạ, em hiểu rồi ạ!'},
    {label:'Đưa ví dụ ngắn',effect:[1,2,6],noise:0,remind:false,reply:'const dùng cho giá trị cố định, let dùng khi cần thay đổi ạ!'},
  ]},
  question2:{title:'Đức Lợi hỏi về câu lệnh if',state:'RaisingHand',members:[9],lines:['Thầy ơi, nếu điều kiện if sai thì chương trình làm gì ạ?'],choices:[
    {label:'Giải thích nhánh else',effect:[2,3,8],noise:0,remind:false,reply:'Nếu có else, chương trình thực hiện đoạn lệnh trong else. Dạ, em hiểu rồi!'},
    {label:'Minh họa bằng ví dụ',effect:[1,2,6],noise:0,remind:false,reply:'Nhánh else xử lý trường hợp điều kiện if sai ạ!'},
  ]},
  question3:{title:'Câu hỏi về điều kiện dừng vòng lặp',state:'RaisingHand',members:[0],lines:['Thầy ơi, nếu điều kiện vòng lặp luôn đúng thì sao ạ?'],choices:[
    {label:'Giải thích vòng lặp vô hạn',effect:[2,3,8],noise:0,remind:false,reply:'Vòng lặp có thể chạy mãi nếu không có điều kiện dừng phù hợp.'},
    {label:'Nhắc kiểm tra điều kiện dừng',effect:[1,2,6],noise:0,remind:false,reply:'Mình cần kiểm tra điều kiện để vòng lặp dừng đúng lúc ạ!'},
  ]},
};
