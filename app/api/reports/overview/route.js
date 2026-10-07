import {NextResponse} from 'next/server';
import {getSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';
import {buildIntelligence} from '../../../../lib/intelligence';
import {normalizeBranding} from '../../../../lib/branding';
import {writeAudit} from '../../../../lib/audit';
export async function GET(req){const s=await getSession();if(!s)return NextResponse.json({error:'No autorizado'},{status:401});const user=await prisma.user.findUnique({where:{id:s.sub},include:{school:{include:{settings:true}}}});if(!user)return NextResponse.json({error:'Usuario no encontrado'},{status:404});const data=await buildIntelligence(user);await writeAudit({schoolId:user.schoolId,actorId:user.id,action:'VIEW',entity:'Report',summary:'Consultó el reporte ejecutivo',request:req});return NextResponse.json({school:normalizeBranding(user.school,user.school.settings),generatedAt:new Date().toISOString(),data})}
