import {NextResponse} from 'next/server';
import {getSession} from '../../../lib/auth';
import {prisma} from '../../../lib/prisma';

const allowed=(from,to)=>{
 if(from==='ADMIN') return true;
 if(from==='TEACHER') return ['ADMIN','STUDENT','TUTOR'].includes(to);
 if(from==='STUDENT') return ['ADMIN','TEACHER'].includes(to);
 if(from==='TUTOR') return ['ADMIN','TEACHER'].includes(to);
 return false;
};
export async function GET(){
 const s=await getSession(); if(!s)return NextResponse.json({error:'No autenticado'},{status:401});
 const me=await prisma.user.findUnique({where:{id:s.sub},select:{id:true,schoolId:true,role:true}}); if(!me)return NextResponse.json({error:'Usuario no encontrado'},{status:404});
 const users=(await prisma.user.findMany({where:{schoolId:me.schoolId,status:'ACTIVE',NOT:{id:me.id}},select:{id:true,firstName:true,lastName:true,role:true},orderBy:[{role:'asc'},{firstName:'asc'}]})).filter(u=>allowed(me.role,u.role));
 const items=await prisma.message.findMany({where:{schoolId:me.schoolId,OR:[{senderId:me.id},{recipientId:me.id}]},include:{sender:{select:{id:true,firstName:true,lastName:true,role:true}},recipient:{select:{id:true,firstName:true,lastName:true,role:true}}},orderBy:{createdAt:'desc'},take:150});
 const unread=await prisma.message.count({where:{recipientId:me.id,readAt:null}});
 return NextResponse.json({users,items,unread});
}
export async function POST(req){
 const s=await getSession(); if(!s)return NextResponse.json({error:'No autenticado'},{status:401}); const b=await req.json();
 if(!b.recipientId||!String(b.body||'').trim())return NextResponse.json({error:'Destinatario y mensaje requeridos'},{status:400});
 const [me,to]=await Promise.all([prisma.user.findUnique({where:{id:s.sub}}),prisma.user.findUnique({where:{id:b.recipientId}})]);
 if(!me||!to||me.schoolId!==to.schoolId||to.status!=='ACTIVE'||!allowed(me.role,to.role))return NextResponse.json({error:'Destinatario no permitido'},{status:403});
 const msg=await prisma.message.create({data:{schoolId:me.schoolId,senderId:me.id,recipientId:to.id,subject:String(b.subject||'').trim().slice(0,120)||null,body:String(b.body).trim().slice(0,5000)}});
 await prisma.notification.create({data:{schoolId:me.schoolId,recipientId:to.id,type:'MESSAGE',title:`Nuevo mensaje de ${me.firstName} ${me.lastName}`,message:(msg.subject||msg.body).slice(0,180),link:'/mensajes'}});
 return NextResponse.json({ok:true,id:msg.id});
}
export async function PATCH(req){
 const s=await getSession(); if(!s)return NextResponse.json({error:'No autenticado'},{status:401}); const b=await req.json();
 if(b.all){await prisma.message.updateMany({where:{recipientId:s.sub,readAt:null},data:{readAt:new Date()}});return NextResponse.json({ok:true});}
 const m=await prisma.message.findFirst({where:{id:b.id,recipientId:s.sub}});if(!m)return NextResponse.json({error:'Mensaje no encontrado'},{status:404});
 await prisma.message.update({where:{id:m.id},data:{readAt:new Date()}});return NextResponse.json({ok:true});
}
