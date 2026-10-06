import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';

async function adminContext(){
  const s=await getSession();
  if(!s||s.role!=='ADMIN') return {error:NextResponse.json({error:'Solo administradores'},{status:403})};
  const me=await prisma.user.findUnique({where:{id:s.sub}});
  if(!me) return {error:NextResponse.json({error:'Usuario no encontrado'},{status:404})};
  return {s,me};
}
const clean=v=>typeof v==='string'?v.trim():v;
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'');

export async function POST(req){
  const ctx=await adminContext(); if(ctx.error)return ctx.error;
  const b=await req.json();
  const firstName=clean(b.firstName),lastName=clean(b.lastName),email=clean(b.email)?.toLowerCase();
  if(!firstName||!lastName||!validEmail(email)||!['STUDENT','TEACHER','ADMIN','TUTOR'].includes(b.role)) return NextResponse.json({error:'Completa nombre, apellidos, correo válido y rol.'},{status:400});
  if(b.password && b.password.length<8) return NextResponse.json({error:'La contraseña temporal debe tener al menos 8 caracteres.'},{status:400});
  try{
    const u=await prisma.user.create({data:{schoolId:ctx.me.schoolId,firstName,lastName,email,role:b.role,passwordHash:await bcrypt.hash(b.password||'Nova2026!',12),studentCode:b.role==='STUDENT'?(clean(b.code)||null):null,employeeCode:['TEACHER','ADMIN'].includes(b.role)?(clean(b.code)||null):null}});
    if(b.role==='STUDENT'&&b.groupId) await prisma.enrollment.create({data:{studentId:u.id,groupId:b.groupId}});
    return NextResponse.json({ok:true,id:u.id,message:'Usuario creado correctamente.'});
  }catch(e){return NextResponse.json({error:'No se pudo crear. Revisa correo o matrícula/número de empleado duplicado.'},{status:400})}
}

export async function PUT(req){
  const ctx=await adminContext(); if(ctx.error)return ctx.error;
  const b=await req.json();
  const current=await prisma.user.findUnique({where:{id:b.id},include:{enrollments:{where:{status:'ACTIVE'}}}});
  if(!current||current.schoolId!==ctx.me.schoolId)return NextResponse.json({error:'Usuario no encontrado.'},{status:404});
  const firstName=clean(b.firstName),lastName=clean(b.lastName),email=clean(b.email)?.toLowerCase();
  if(!firstName||!lastName||!validEmail(email)||!['STUDENT','TEACHER','ADMIN','TUTOR'].includes(b.role))return NextResponse.json({error:'Datos de usuario incompletos.'},{status:400});
  if(b.id===ctx.s.sub&&b.role!=='ADMIN')return NextResponse.json({error:'No puedes quitarte el rol de administrador.'},{status:400});
  try{
    await prisma.$transaction(async tx=>{
      await tx.user.update({where:{id:b.id},data:{firstName,lastName,email,role:b.role,studentCode:b.role==='STUDENT'?(clean(b.code)||null):null,employeeCode:['TEACHER','ADMIN'].includes(b.role)?(clean(b.code)||null):null,...(b.password?{passwordHash:await bcrypt.hash(b.password,12)}:{})}});
      if(b.role==='STUDENT'){
        await tx.enrollment.updateMany({where:{studentId:b.id,status:'ACTIVE'},data:{status:'WITHDRAWN'}});
        if(b.groupId) await tx.enrollment.upsert({where:{studentId_groupId:{studentId:b.id,groupId:b.groupId}},update:{status:'ACTIVE'},create:{studentId:b.id,groupId:b.groupId}});
      } else await tx.enrollment.updateMany({where:{studentId:b.id,status:'ACTIVE'},data:{status:'WITHDRAWN'}});
    });
    return NextResponse.json({ok:true,message:'Usuario actualizado.'});
  }catch(e){return NextResponse.json({error:'No se pudo actualizar. Revisa correo o código duplicado.'},{status:400})}
}

export async function PATCH(req){
  const ctx=await adminContext(); if(ctx.error)return ctx.error;
  const b=await req.json();
  const target=await prisma.user.findUnique({where:{id:b.id}});
  if(!target||target.schoolId!==ctx.me.schoolId)return NextResponse.json({error:'Usuario no encontrado.'},{status:404});
  if(b.id===ctx.s.sub&&b.status!=='ACTIVE')return NextResponse.json({error:'No puedes desactivar tu propia cuenta.'},{status:400});
  if(!['ACTIVE','INACTIVE','SUSPENDED'].includes(b.status))return NextResponse.json({error:'Estado inválido.'},{status:400});
  await prisma.user.update({where:{id:b.id},data:{status:b.status}});
  return NextResponse.json({ok:true});
}
