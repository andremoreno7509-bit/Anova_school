import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

const MAX = 4 * 1024 * 1024;
const ALLOWED = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/png','image/jpeg','image/webp','text/plain','application/zip']);
const clean = (name='archivo') => name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-120);

export async function POST(req){
 try{
  const s=await getSession(); if(!s) return NextResponse.json({error:'No autorizado.'},{status:401});
  const form=await req.formData(); const file=form.get('file'); const taskId=String(form.get('taskId')||''); const kind=String(form.get('kind')||'task');
  if(!file||typeof file==='string'||!taskId) return NextResponse.json({error:'Archivo y tarea son obligatorios.'},{status:400});
  if(file.size>MAX) return NextResponse.json({error:'El archivo supera el límite de 4 MB de esta versión.'},{status:400});
  if(!ALLOWED.has(file.type)) return NextResponse.json({error:'Tipo de archivo no permitido.'},{status:400});
  const task=await prisma.academicTask.findUnique({where:{id:taskId},include:{teachingAssignment:{include:{group:{include:{enrollments:{where:{studentId:s.sub,status:'ACTIVE'}}}}}}}});
  if(!task) return NextResponse.json({error:'Tarea no encontrada.'},{status:404});
  if(kind==='task' && (s.role!=='TEACHER'||task.teachingAssignment.teacherId!==s.sub)) return NextResponse.json({error:'No autorizado para adjuntar a esta tarea.'},{status:403});
  if(kind==='submission' && (s.role!=='STUDENT'||!task.teachingAssignment.group.enrollments.length)) return NextResponse.json({error:'No autorizado para entregar esta tarea.'},{status:403});
  const pathname=`anova/${task.teachingAssignmentId}/${task.id}/${kind}/${s.sub}/${Date.now()}-${clean(file.name)}`;
  const blob=await put(pathname,file,{access:'private',addRandomSuffix:false});
  if(kind==='task'){
   const item=await prisma.taskAttachment.create({data:{taskId:task.id,name:file.name,url:blob.url,pathname:blob.pathname,mimeType:file.type||null,size:file.size}});
   return NextResponse.json(item);
  }
  const late=new Date()>new Date(task.dueDate);
  const sub=await prisma.taskSubmission.upsert({where:{taskId_studentId:{taskId:task.id,studentId:s.sub}},update:{status:late?'LATE':'SUBMITTED',submittedAt:new Date()},create:{taskId:task.id,studentId:s.sub,status:late?'LATE':'SUBMITTED',submittedAt:new Date()}});
  const item=await prisma.submissionAttachment.create({data:{submissionId:sub.id,name:file.name,url:blob.url,pathname:blob.pathname,mimeType:file.type||null,size:file.size}});
  return NextResponse.json({...item,submissionStatus:sub.status});
 }catch(e){console.error(e);return NextResponse.json({error:'No se pudo subir el archivo. Verifica que Vercel Blob esté conectado al proyecto.'},{status:500})}
}
