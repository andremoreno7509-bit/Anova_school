import {NextResponse} from 'next/server';
import {getSession} from '../../../lib/auth';
import {prisma} from '../../../lib/prisma';
import {normalizeBranding} from '../../../lib/branding';

export async function GET(req){
  try{
    const s=await getSession();let school=null;
    if(s?.sub){const u=await prisma.user.findUnique({where:{id:s.sub},select:{school:{include:{settings:true}}}});school=u?.school||null}
    if(!school){const requested=new URL(req.url).searchParams.get('code')?.trim().toUpperCase();const code=requested||process.env.NEXT_PUBLIC_SCHOOL_CODE||process.env.SCHOOL_CODE;school=code?await prisma.school.findUnique({where:{code},include:{settings:true}}):await prisma.school.findFirst({include:{settings:true},orderBy:{createdAt:'asc'}})}
    if(!school)return NextResponse.json(normalizeBranding(null,null));return NextResponse.json(normalizeBranding(school,school.settings));
  }catch{return NextResponse.json(normalizeBranding(null,null))}
}
