const LEARNING={Idle:18,Listening:24,Talking:5,Playing:2,Sleeping:0,Snacking:10,RaisingHand:26,Answering:25,Confused:12};

export class ClassroomProgress {
  constructor(){this.reset();}
  reset(){this.understanding=Array(10).fill(25);this.recorded=new Set();this.result=null;}
  recordLesson(index,students,{ignoredCount=0,ignoredStudents=new Set()}={}){
    if(this.recorded.has(index)||index<0||index>2)return false;
    this.recorded.add(index);
    students.forEach((student,i)=>{const missed=ignoredStudents.has(i)?8:ignoredCount?Math.min(8,ignoredCount*2):0;const gain=Math.max(0,(LEARNING[student.state]??18)-missed);
      this.understanding[i]=Math.min(100,this.understanding[i]+gain);});
    return true;
  }
  examine(students,{outcome=null}={}){
    if(this.recorded.size!==3)return null;
    if(this.result)return this.result;
    const rows=students.map((student,i)=>{
      const learnedScore=Math.round(this.understanding[i])/10;
      const score=outcome==='good'?Math.max(5,learnedScore):outcome==='bad'?Math.min(4.9,learnedScore):learnedScore;
      return {name:student.name,score,passed:score>=5};
    });
    const passed=rows.filter(row=>row.passed).length;
    this.result={rows,passed,outcome,ending:passed===10?'happy':passed>=4?'normal':'bad'};
    return this.result;
  }
}
