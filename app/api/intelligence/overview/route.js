import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { buildIntelligence } from '../../../../lib/intelligence';

export async function GET(){
  try{
    const s=await getSession();
    if(!s)return NextResponse.json({error:'No autorizado'},{status:401});
    const user=await prisma.user.findUnique({where:{id:s.sub},select:{id:true,schoolId:true,role:true,status:true,firstName:true,lastName:true}});
    if(!user||user.status!=='ACTIVE')return NextResponse.json({error:'Usuario no disponible'},{status:403});
    return NextResponse.json(await buildIntelligence(user));
  }catch(error){
    console.error('intelligence overview',error);
    return NextResponse.json({error:'No se pudo calcular A-NOVA Intelligence.'},{status:500});
  }
}
