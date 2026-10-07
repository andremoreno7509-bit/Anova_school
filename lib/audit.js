import {prisma} from './prisma';

function safeDetails(value){
  if(value==null)return null;
  try{return JSON.stringify(value,(k,v)=>/password|token|secret|hash/i.test(k)?'[REDACTED]':v).slice(0,8000)}catch{return String(value).slice(0,8000)}
}

export async function writeAudit({schoolId,actorId=null,action,entity,entityId=null,summary,details=null,request=null}){
  if(!schoolId||!action||!entity||!summary)return;
  try{
    const ip=request?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim()||request?.headers?.get?.('x-real-ip')||null;
    const userAgent=request?.headers?.get?.('user-agent')?.slice(0,500)||null;
    await prisma.auditLog.create({data:{schoolId,actorId,action,entity,entityId,summary,details:safeDetails(details),ip,userAgent}});
  }catch(e){console.error('A-NOVA audit error',e?.message||e)}
}
