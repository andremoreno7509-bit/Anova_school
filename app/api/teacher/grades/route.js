import {NextResponse} from 'next/server';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';

async function context(assignmentId,studentId){
  const s=await getSession();
  if(!s||s.role!=='TEACHER') return null;
  return prisma.teachingAssignment.findFirst({
    where:{id:assignmentId,teacherId:s.sub,group:{enrollments:{some:{studentId,status:'ACTIVE'}}}},
    include:{group:{select:{cycleId:true}}}
  });
}

export async function POST(req){
  try{
    const b=await req.json();
    const assignment=await context(b.assignmentId,b.studentId);
    if(!assignment)return NextResponse.json({error:'No autorizado para este alumno.'},{status:403});
    const score=Number(b.score),period=Number(b.period||1);
    if(!Number.isFinite(score)||score<0||score>10)return NextResponse.json({error:'La calificación debe estar entre 0 y 10.'},{status:400});
    if(!Number.isInteger(period)||period<1)return NextResponse.json({error:'Periodo de evaluación inválido.'},{status:400});
    const evaluationPeriod=await prisma.evaluationPeriod.findFirst({where:{cycleId:assignment.group.cycleId,number:period}});
    if(!evaluationPeriod)return NextResponse.json({error:'El periodo de evaluación no existe para este ciclo.'},{status:400});
    if(!evaluationPeriod.open)return NextResponse.json({error:`${evaluationPeriod.name} está cerrado. Control Escolar debe abrirlo para capturar calificaciones.`},{status:409});
    const grade=await prisma.grade.upsert({where:{teachingAssignmentId_studentId_period:{teachingAssignmentId:b.assignmentId,studentId:b.studentId,period}},update:{score,comment:b.comment?.trim()||null},create:{teachingAssignmentId:b.assignmentId,studentId:b.studentId,period,score,comment:b.comment?.trim()||null}});
    return NextResponse.json({...grade,periodName:evaluationPeriod.name});
  }catch(e){return NextResponse.json({error:'No se pudo guardar la calificación.'},{status:500})}
}
