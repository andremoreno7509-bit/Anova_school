import {NextResponse} from 'next/server';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';
export async function GET(){
 const s=await getSession(); if(!s)return NextResponse.json({error:'No autorizado'},{status:401});
 const user=await prisma.user.findUnique({where:{id:s.sub},select:{id:true,firstName:true,lastName:true,email:true,role:true,studentCode:true,employeeCode:true}}); if(!user)return NextResponse.json({error:'Usuario no encontrado'},{status:404});
 if(user.role==='STUDENT'){
  const enrollment=await prisma.enrollment.findFirst({where:{studentId:user.id,status:'ACTIVE'},include:{group:{include:{cycle:true,teaching:{include:{subject:true,teacher:{select:{firstName:true,lastName:true}}}}}}},orderBy:{enrolledAt:'desc'}});
  return NextResponse.json({user,cycle:enrollment?.group.cycle.name||null,group:enrollment?`${enrollment.group.grade}° ${enrollment.group.name}`:null,room:enrollment?.group.room||null,subjects:(enrollment?.group.teaching||[]).map(x=>({id:x.subject.id,code:x.subject.code,name:x.subject.name,teacher:`${x.teacher.firstName} ${x.teacher.lastName}`}))});
 }
 if(user.role==='TEACHER'){
  const teaching=await prisma.teachingAssignment.findMany({where:{teacherId:user.id},include:{subject:true,group:{include:{cycle:true,_count:{select:{enrollments:true}}}}}});
  return NextResponse.json({user,cycle:teaching[0]?.group.cycle.name||null,assignments:teaching.map(x=>({id:x.id,subject:x.subject.name,code:x.subject.code,group:`${x.group.grade}° ${x.group.name}`,students:x.group._count.enrollments,room:x.group.room}))});
 }
 const [students,teachers,subjects,groups,cycle]=await Promise.all([prisma.user.count({where:{schoolId:user.schoolId,role:'STUDENT',status:'ACTIVE'}}),prisma.user.count({where:{schoolId:user.schoolId,role:'TEACHER',status:'ACTIVE'}}),prisma.subject.count({where:{schoolId:user.schoolId,active:true}}),prisma.group.count({where:{schoolId:user.schoolId,active:true}}),prisma.schoolCycle.findFirst({where:{schoolId:user.schoolId,active:true}})]);
 return NextResponse.json({user,cycle:cycle?.name||null,stats:{students,teachers,subjects,groups}});
}
