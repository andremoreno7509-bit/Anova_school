import {prisma} from './prisma';

export async function notifyUser({schoolId,recipientId,type,title,message,link=null}){
  return prisma.notification.create({data:{schoolId,recipientId,type,title,message,link}});
}

export async function notifyStudentAndGuardians({schoolId,studentId,type,title,message,link=null}){
  const links=await prisma.guardianStudent.findMany({where:{studentId},select:{guardianId:true}});
  const ids=[studentId,...links.map(x=>x.guardianId)];
  if(!ids.length)return;
  await prisma.notification.createMany({data:ids.map(recipientId=>({schoolId,recipientId,type,title,message,link}))});
}

export async function notifyGroupStudents({schoolId,groupId,type,title,message,link=null,includeGuardians=false}){
  const rows=await prisma.enrollment.findMany({where:{groupId,status:'ACTIVE'},select:{studentId:true}});
  const studentIds=rows.map(x=>x.studentId);
  let ids=[...studentIds];
  if(includeGuardians&&studentIds.length){
    const gs=await prisma.guardianStudent.findMany({where:{studentId:{in:studentIds}},select:{guardianId:true}});
    ids.push(...gs.map(x=>x.guardianId));
  }
  ids=[...new Set(ids)];
  if(ids.length)await prisma.notification.createMany({data:ids.map(recipientId=>({schoolId,recipientId,type,title,message,link}))});
}
