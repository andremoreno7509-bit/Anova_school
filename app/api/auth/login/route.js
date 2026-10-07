import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {prisma} from '../../../../lib/prisma';
import {createSession} from '../../../../lib/auth';
import {writeAudit} from '../../../../lib/audit';
import {LOCKOUT_ATTEMPTS,LOCKOUT_MINUTES} from '../../../../lib/security';

export async function POST(req){
  try{
    const {email,password}=await req.json();
    if(!email||!password)return NextResponse.json({error:'Ingresa correo y contraseña.'},{status:400});
    const normalized=email.toLowerCase().trim();
    const user=await prisma.user.findUnique({where:{email:normalized}});
    if(!user||user.status!=='ACTIVE')return NextResponse.json({error:'Correo o contraseña incorrectos.'},{status:401});
    if(user.lockedUntil&&new Date(user.lockedUntil)>new Date())return NextResponse.json({error:'Cuenta bloqueada temporalmente por intentos fallidos. Intenta más tarde.'},{status:423});
    const ok=await bcrypt.compare(password,user.passwordHash);
    if(!ok){
      const next=(user.failedLoginCount||0)+1;const lock=next>=LOCKOUT_ATTEMPTS;
      await prisma.user.update({where:{id:user.id},data:{failedLoginCount:lock?LOCKOUT_ATTEMPTS:next,lockedUntil:lock?new Date(Date.now()+LOCKOUT_MINUTES*60*1000):null}});
      await writeAudit({schoolId:user.schoolId,actorId:user.id,action:'LOGIN_FAILED',entity:'User',entityId:user.id,summary:`Inicio de sesión fallido para ${user.email}`,details:{attempt:next,locked:lock},request:req});
      return NextResponse.json({error:lock?'Cuenta bloqueada temporalmente por intentos fallidos.':'Correo o contraseña incorrectos.'},{status:401});
    }
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-real-ip')||null;
    await prisma.user.update({where:{id:user.id},data:{failedLoginCount:0,lockedUntil:null,lastLoginAt:new Date(),lastLoginIp:ip}});
    await createSession(user);
    await writeAudit({schoolId:user.schoolId,actorId:user.id,action:'LOGIN_SUCCESS',entity:'User',entityId:user.id,summary:`Inicio de sesión correcto · ${user.email}`,request:req});
    return NextResponse.json({user:{id:user.id,firstName:user.firstName,lastName:user.lastName,email:user.email,role:user.role,mustChangePassword:user.mustChangePassword}});
  }catch(e){console.error(e);return NextResponse.json({error:'No se pudo iniciar sesión.'},{status:500})}
}
