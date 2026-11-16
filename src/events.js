import { EVENT_DEFINITIONS } from './dialogues/incidents.js';
export { EVENT_DEFINITIONS };
export function applyEffects(metrics,effect){
  ['attention','warmth','understanding'].forEach((key,i)=>{metrics[key]=Math.max(0,Math.min(100,metrics[key]+effect[i]));});
}
const studentId=index=>`student-${String(index+1).padStart(2,'0')}`;
export class LessonEvents {
  constructor(onEvent=()=>{},onChange=()=>{}){this.onEvent=onEvent;this.onChange=onChange;this.reset();}
  reset(){this.started=false;this.time=0;this.currentLesson=null;this.active=null;this.pending=null;this.queue=[];this.records=[];this.completed=new Set();this.distractionGenerated=new Set();this.distractionHandled=new Set();this.reminders=0;this.ignoredCount=0;this.ignoredStudents=new Set();this.remindedKinds=new Set();this.reoffenses=new Set();
    this.metrics={attention:65,warmth:65,understanding:45,noise:30,stress:10};this.onChange(this);}
  lesson(index){this.started=true;
    if(index<0||index>2)return {changed:false,cancelledNpcIds:[]};
    if(this.currentLesson===index+1)return {changed:false,cancelledNpcIds:[]};
    if(this.currentLesson!==null&&index+1<this.currentLesson)return {changed:false,cancelledNpcIds:[]};
    const cancelledNpcIds=this.cancelCurrent();this.currentLesson=index+1;
    const kinds=[['talking','question1','phoneAudio'],['sleeping','question2','spilling'],['playing','question','question3','gameArgument']][index];
    for(const kind of kinds){
      const definition=EVENT_DEFINITIONS[kind],record={id:`lesson-${index+1}-${kind}`,lessonId:index+1,npcId:studentId(definition.members[0]),npcIds:definition.members.map(studentId),npcIndexes:[...definition.members],type:this.eventType(kind),kind,status:'Pending',title:definition.title,state:definition.state,members:[...definition.members],lines:[...definition.lines],choices:definition.choices,reaction:definition.reaction,reminded:false};
      this.records.push(record);this.queue.push(record);
    }
    this.schedule();this.onChange(this);return {changed:true,cancelledNpcIds};
  }
  writing(){this.lesson(0);}
  laptop(){return false;}
  assessment(){}
  eventType(kind){return ['talking','gameArgument'].includes(kind)?'Talking':kind==='sleeping'?'Sleeping':['playing','phoneAudio'].includes(kind)?'Phone':kind==='spilling'?'Spill':'Question';}
  lessonForKind(kind){return kind==='talking'||kind==='question1'||kind==='phoneAudio'?1:kind==='sleeping'||kind==='question2'||kind==='spilling'?2:['playing','question','question3','gameArgument'].includes(kind)?3:null;}
  cancelCurrent(){
    const cancelledNpcIds=[];
    if(this.active){const event=this.active;event.status='Cancelled';
      if(event.type!=='Question')for(const npcId of event.members){this.ignoredStudents.add(npcId);this.ignoredCount++;}
      cancelledNpcIds.push(...event.members);this.active=null;
    }
    if(this.pending){this.pending.status='Cancelled';this.pending=null;}
    for(const event of this.queue){event.status='Cancelled';}this.queue=[];
    return cancelledNpcIds;
  }
  finishLesson(){const cancelledNpcIds=this.cancelCurrent();this.onChange(this);return cancelledNpcIds;}
  schedule(){if(!this.active&&!this.pending&&this.queue.length){this.pending=this.queue.shift();this.pending.remaining=0.8;}}
  update(dt){if(!this.started)return;this.time+=dt;
    if(this.pending){this.pending.remaining-=dt;if(this.pending.remaining<=0){const event=this.pending;this.pending=null;this.activate(event);}}
  }
  activate(eventOrKind){
    if(this.active)return false;
    const event=typeof eventOrKind==='string'?{id:`lesson-${this.lessonForKind(eventOrKind)}-${eventOrKind}`,lessonId:this.lessonForKind(eventOrKind),npcId:studentId(EVENT_DEFINITIONS[eventOrKind]?.members[0]??-1),npcIds:(EVENT_DEFINITIONS[eventOrKind]?.members??[]).map(studentId),npcIndexes:[...(EVENT_DEFINITIONS[eventOrKind]?.members??[])],kind:eventOrKind,type:this.eventType(eventOrKind),status:'Pending',...EVENT_DEFINITIONS[eventOrKind],members:[...(EVENT_DEFINITIONS[eventOrKind]?.members??[])]}:eventOrKind;
    if(!event||event.lessonId!==this.currentLesson||event.status==='Cancelled'||this.completed.has(event.id))return false;
    event.status='Active';this.active=event;
    event.incidentIds=[];
    if(event.type!=='Question')for(const npcId of event.npcIds){
      const incidentId=`${event.id}:${npcId}`;event.incidentIds.push(incidentId);
      if(!this.distractionGenerated.has(incidentId)){this.distractionGenerated.add(incidentId);this.metrics.stress=Math.min(100,this.metrics.stress+8);}
    }
    this.metrics.noise=Math.min(100,this.metrics.noise+(['talking','gameArgument'].includes(event.kind)?6:0));
    this.onEvent(this.active);this.onChange(this);return true;
  }
  forStudent(index){return this.active?.status==='Active'&&this.active.lessonId===this.currentLesson&&this.active.members.includes(index)?this.active:null;}
  resolve(index,choiceIndex){const event=this.forStudent(index),choice=event?.choices[choiceIndex];if(!event||!choice)return null;
    applyEffects(this.metrics,choice.effect);this.metrics.noise=Math.max(0,Math.min(100,this.metrics.noise+choice.noise));
    if(choice.remind&&!event.reminded){event.reminded=true;this.reminders++;this.remindedKinds.add(event.kind);}
    else if(!event.kind.startsWith('question')&&event.kind!=='question'&&choice.effect[0]<0){this.ignoredCount++;this.ignoredStudents.add(index);}
    event.members=event.members.filter(member=>member!==index);
    const incidentId=`${event.id}:${studentId(index)}`;
    if(event.type!=='Question')this.distractionHandled.add(incidentId);
    const finished=event.members.length===0;
    if(finished){event.status='Completed';this.completed.add(event.id);this.active=null;this.schedule();}
    this.onChange(this);return {event,choice,index,finished};
  }
  reoffense(kind){if(!this.remindedKinds.has(kind)||this.reoffenses.has(kind))return false;
    this.reoffenses.add(kind);return true;
  }
  applyExamStress(passed){const change=passed===10?-20:passed>=8?5:passed>=6?15:passed>=4?30:50;
    this.metrics.stress=Math.max(0,Math.min(100,this.metrics.stress+change));this.onChange(this);return change;
  }
  applyExamOutcome(outcome){const change=outcome==='good'?-50:0;this.metrics.stress=Math.max(0,Math.min(100,this.metrics.stress+change));this.onChange(this);return change;}
  get distractionOccurred(){return this.distractionGenerated.size;}
  get distractionProcessed(){return this.distractionHandled.size;}
  get finished(){return this.currentLesson===3&&this.records.length===10&&this.records.every(event=>event.status==='Completed'||event.status==='Cancelled')&&!this.active&&!this.pending&&!this.queue.length;}
}
