import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { buildIntelligence, answerIntelligenceQuestion } from '../../../../lib/intelligence';

export async function POST(req){
  try{
    const s=await getSession();
    if(!s)return NextResponse.json({error:'No autorizado'},{status:401});
    const user=await prisma.user.findUnique({where:{id:s.sub},select:{id:true,schoolId:true,role:true,status:true,firstName:true,lastName:true}});
    if(!user||user.status!=='ACTIVE')return NextResponse.json({error:'Usuario no disponible'},{status:403});
    const {question}=await req.json();
    if(!question||String(question).trim().length<3)return NextResponse.json({error:'Escribe una pregunta.'},{status:400});
    const data=await buildIntelligence(user);
    return NextResponse.json({...answerIntelligenceQuestion(data,question),mode:'DETERMINISTIC',generatedAt:new Date().toISOString()});
  }catch(error){
    console.error('intelligence assistant',error);
    return NextResponse.json({error:'No se pudo procesar la consulta.'},{status:500});
  }
}
