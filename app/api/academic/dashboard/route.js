import {NextResponse} from 'next/server';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';

export async function GET(){
 const s=await getSession(); if(!s)return NextResponse.json({error:'No autorizado'},{status:401});
 const user=await prisma.user.findUnique({where:{id:s.sub},select:{id:true,schoolId:true,firstName:true,lastName:true,email:true,role:true,studentCode:true,employeeCode:true}}); if(!user)return NextResponse.json({error:'Usuario no encontrado'},{status:404});
 if(user.role==='STUDENT'){
  const enrollment=await prisma.enrollment.findFirst({where:{studentId:user.id,status:'ACTIVE'},include:{group:{include:{cycle:true,teaching:{include:{subject:true,teacher:{select:{firstName:true,lastName:true}},grades:{where:{studentId:user.id},orderBy:{period:'asc'}},attendance:{where:{studentId:user.id},orderBy:{date:'desc'}},tasks:{where:{active:true},orderBy:{dueDate:'asc'}},schedule:{where:{active:true},orderBy:[{dayOfWeek:'asc'},{startTime:'asc'}]}}}}},orderBy:{enrolledAt:'desc'}});
  const teaching=enrollment?.group.teaching||[];
  const periods=enrollment?await prisma.evaluationPeriod.findMany({where:{cycleId:enrollment.group.cycleId},orderBy:{number:'asc'}}):[];
  const periodNames=Object.fromEntries(periods.map(p=>[p.number,p.name]));
  const grades=teaching.flatMap(x=>x.grades.map(g=>({id:g.id,assignmentId:x.id,subject:x.subject.name,code:x.subject.code,period:g.period,periodName:periodNames[g.period]||`Periodo ${g.period}`,score:g.score,comment:g.comment,updatedAt:g.updatedAt})));
  const attendance=teaching.flatMap(x=>x.attendance.map(a=>({id:a.id,assignmentId:x.id,subject:x.subject.name,date:a.date,status:a.status,note:a.note}))).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const tasks=teaching.flatMap(x=>x.tasks.map(t=>({id:t.id,assignmentId:x.id,subject:x.subject.name,title:t.title,description:t.description,dueDate:t.dueDate,maxScore:t.maxScore,active:t.active}))).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
  const schedule=teaching.flatMap(x=>x.schedule.map(h=>({id:h.id,assignmentId:x.id,subject:x.subject.name,code:x.subject.code,teacher:`${x.teacher.firstName} ${x.teacher.lastName}`,dayOfWeek:h.dayOfWeek,startTime:h.startTime,endTime:h.endTime,room:h.room||enrollment?.group.room||null}))).sort((a,b)=>a.dayOfWeek-b.dayOfWeek||a.startTime.localeCompare(b.startTime));
  const incidents=await prisma.incident.findMany({where:{studentId:user.id},include:{reporter:{select:{firstName:true,lastName:true}}},orderBy:{occurredAt:'desc'}});
  const average=grades.length?grades.reduce((n,g)=>n+g.score,0)/grades.length:null;
  const counted=attendance.filter(a=>['PRESENT','ABSENT','LATE'].includes(a.status));
  const attendanceRate=counted.length?((counted.filter(a=>a.status!=='ABSENT').length/counted.length)*100):null;
  const now=new Date(); const pendingTasks=tasks.filter(t=>new Date(t.dueDate)>=new Date(now.toDateString()));
  const gradeScore=average===null?100:Math.max(0,Math.min(100,average*10));
  const attScore=attendanceRate===null?100:attendanceRate;
  const taskScore=Math.max(60,100-Math.min(pendingTasks.length,8)*5);
  const academicPulse=Math.round(gradeScore*.55+attScore*.35+taskScore*.10);
  return NextResponse.json({user,periods:periods.map(p=>({id:p.id,name:p.name,number:p.number,open:p.open})),cycle:enrollment?.group.cycle.name||null,group:enrollment?`${enrollment.group.grade}° ${enrollment.group.name}`:null,room:enrollment?.group.room||null,subjects:teaching.map(x=>({id:x.subject.id,assignmentId:x.id,code:x.subject.code,name:x.subject.name,teacher:`${x.teacher.firstName} ${x.teacher.lastName}`,grades:x.grades})),grades,attendance,tasks,pendingTasks,schedule,incidents:incidents.map(i=>({...i,reporterName:`${i.reporter.firstName} ${i.reporter.lastName}`})),metrics:{average:average===null?null:Number(average.toFixed(1)),attendanceRate:attendanceRate===null?null:Math.round(attendanceRate),absences:attendance.filter(a=>a.status==='ABSENT').length,academicPulse}});
 }
 if(user.role==='TEACHER'){
  const teaching=await prisma.teachingAssignment.findMany({where:{teacherId:user.id},include:{subject:true,group:{include:{cycle:true,_count:{select:{enrollments:true}}}}}});
  return NextResponse.json({user,periods:periods.map(p=>({id:p.id,name:p.name,number:p.number,open:p.open})),cycle:teaching[0]?.group.cycle.name||null,assignments:teaching.map(x=>({id:x.id,subject:x.subject.name,code:x.subject.code,group:`${x.group.grade}° ${x.group.name}`,students:x.group._count.enrollments,room:x.group.room}))});
 }
 const [students,teachers,subjects,groups,cycle]=await Promise.all([prisma.user.count({where:{schoolId:user.schoolId,role:'STUDENT',status:'ACTIVE'}}),prisma.user.count({where:{schoolId:user.schoolId,role:'TEACHER',status:'ACTIVE'}}),prisma.subject.count({where:{schoolId:user.schoolId,active:true}}),prisma.group.count({where:{schoolId:user.schoolId,active:true}}),prisma.schoolCycle.findFirst({where:{schoolId:user.schoolId,active:true}})]);
 return NextResponse.json({user,periods:periods.map(p=>({id:p.id,name:p.name,number:p.number,open:p.open})),cycle:cycle?.name||null,stats:{students,teachers,subjects,groups}});
}
