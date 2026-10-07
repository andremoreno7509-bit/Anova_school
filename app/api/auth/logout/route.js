import {NextResponse} from 'next/server';
import {getSession,clearSession} from '../../../../lib/auth';
import {prisma} from '../../../../lib/prisma';
import {writeAudit} from '../../../../lib/audit';
export async function POST(req){const s=await getSession();if(s?.sub){const u=await prisma.user.findUnique({where:{id:s.sub},select:{id:true,schoolId:true,email:true}});if(u)await writeAudit({schoolId:u.schoolId,actorId:u.id,action:'LOGOUT',entity:'User',entityId:u.id,summary:`Cierre de sesión · ${u.email}`,request:req})}await clearSession();return NextResponse.json({ok:true})}
