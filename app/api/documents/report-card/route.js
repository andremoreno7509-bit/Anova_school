import {NextResponse} from 'next/server';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';

async function canReadStudent(session, studentId){
  if(session.role==='STUDENT') return session.sub===studentId;
  if(session.role==='ADMIN'){
    const [admin,student]=await Promise.all([prisma.user.findUnique({where:{id:session.sub},select:{schoolId:true}}),prisma.user.findUnique({where:{id:studentId},select:{schoolId:true,role:true}})]);
    return !!admin&&!!student&&student.role==='STUDENT'&&admin.schoolId===student.schoolId;
  }
  if(session.role==='TUTOR') return !!(await prisma.guardianStudent.findUnique({where:{guardianId_studentId:{guardianId:session.sub,studentId}}}));
  return false;
}

export async function GET(req){
  const session=await getSession();
  if(!session)return NextResponse.json({error:'Sesión requerida'},{status:401});
  const url=new URL(req.url); const studentId=url.searchParams.get('studentId')||session.sub; const cycleId=url.searchParams.get('cycleId')||undefined;
  if(!studentId||!(await canReadStudent(session,studentId)))return NextResponse.json({error:'No tienes permiso para consultar este documento'},{status:403});
  const student=await prisma.user.findUnique({where:{id:studentId},select:{id:true,firstName:true,lastName:true,email:true,studentCode:true,school:{select:{name:true,code:true,settings:true}}}});
  if(!student)return NextResponse.json({error:'Alumno no encontrado'},{status:404});
  const enrollment=await prisma.enrollment.findFirst({where:{studentId,status:'ACTIVE',...(cycleId?{group:{cycleId}}:{})},include:{group:{include:{cycle:true,teaching:{include:{subject:true,teacher:{select:{firstName:true,lastName:true}},grades:{where:{studentId},orderBy:{period:'asc'}},attendance:{where:{studentId}}}}}}},orderBy:{enrolledAt:'desc'}});
  if(!enrollment)return NextResponse.json({error:'El alumno no tiene una inscripción activa'},{status:404});
  const periods=await prisma.evaluationPeriod.findMany({where:{cycleId:enrollment.group.cycleId},orderBy:{number:'asc'}});
  const rows=enrollment.group.teaching.map(a=>{const byPeriod=Object.fromEntries(a.grades.map(g=>[g.period,g.score]));const scores=a.grades.map(g=>g.score);return {subject:a.subject.name,code:a.subject.code,teacher:`${a.teacher.firstName} ${a.teacher.lastName}`,periods:periods.map(p=>({number:p.number,name:p.name,score:byPeriod[p.number]??null})),average:scores.length?Number((scores.reduce((n,x)=>n+x,0)/scores.length).toFixed(1)):null};});
  const allGrades=rows.flatMap(r=>r.periods.filter(p=>p.score!==null).map(p=>p.score));
  const attendance=enrollment.group.teaching.flatMap(a=>a.attendance); const counted=attendance.filter(a=>['PRESENT','ABSENT','LATE'].includes(a.status));
  const attendanceRate=counted.length?Math.round(counted.filter(a=>a.status!=='ABSENT').length/counted.length*100):null;
  const schoolBrand={name:student.school.settings?.displayName||student.school.name,code:student.school.code,logoUrl:student.school.settings?.logoUrl||null,reportFooter:student.school.settings?.reportFooter||null,showPoweredBy:student.school.settings?.showPoweredBy!==false};
  return NextResponse.json({document:{type:'REPORT_CARD',generatedAt:new Date().toISOString()},school:schoolBrand,student:{id:student.id,name:`${student.firstName} ${student.lastName}`,email:student.email,studentCode:student.studentCode},cycle:{id:enrollment.group.cycle.id,name:enrollment.group.cycle.name},group:`${enrollment.group.grade}° ${enrollment.group.name}`,room:enrollment.group.room,periods:periods.map(p=>({number:p.number,name:p.name,startDate:p.startDate,endDate:p.endDate})),subjects:rows,summary:{average:allGrades.length?Number((allGrades.reduce((n,x)=>n+x,0)/allGrades.length).toFixed(1)):null,attendanceRate,absences:attendance.filter(a=>a.status==='ABSENT').length,lates:attendance.filter(a=>a.status==='LATE').length,records:counted.length}});
}
