import {NextResponse} from 'next/server';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';
async function teacher(){const s=await getSession();if(!s||s.role!=='TEACHER')return null;return prisma.user.findFirst({where:{id:s.sub,role:'TEACHER',status:'ACTIVE'}})}
export async function GET(){
 try{
  const me=await teacher();if(!me)return NextResponse.json({error:'Solo profesores activos'},{status:403});
  const assignments=await prisma.teachingAssignment.findMany({where:{teacherId:me.id},include:{subject:true,group:{include:{cycle:{include:{evaluationPeriods:{orderBy:{number:'asc'}}}},enrollments:{where:{status:'ACTIVE'},include:{student:{select:{id:true,firstName:true,lastName:true,studentCode:true,email:true}}}}}},grades:true,attendance:true,tasks:{orderBy:{dueDate:'asc'},include:{attachments:true,submissions:{include:{attachments:true,student:{select:{id:true,firstName:true,lastName:true,studentCode:true,email:true}}}}}},schedule:{where:{active:true},orderBy:[{dayOfWeek:'asc'},{startTime:'asc'}]}},orderBy:{subject:{name:'asc'}}});
  return NextResponse.json({user:{id:me.id,firstName:me.firstName,lastName:me.lastName},assignments:assignments.map(a=>({id:a.id,subject:a.subject,group:{id:a.group.id,label:`${a.group.grade}° ${a.group.name}`,room:a.group.room,cycle:a.group.cycle.name,periods:a.group.cycle.evaluationPeriods.map(p=>({id:p.id,name:p.name,number:p.number,open:p.open,startDate:p.startDate,endDate:p.endDate}))},students:a.group.enrollments.map(e=>e.student),grades:a.grades,attendance:a.attendance,tasks:a.tasks,schedule:a.schedule}))});
 }catch{return NextResponse.json({error:'No se pudo cargar el portal docente.'},{status:500})}
}
