import { get } from '@vercel/blob';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const s = await getSession();
  if (!s) return new Response('No autorizado', { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const kind = searchParams.get('kind');
  if (!id) return new Response('Archivo requerido', { status: 400 });

  let item = null;
  let allowed = false;
  if (kind === 'task') {
    item = await prisma.taskAttachment.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            teachingAssignment: {
              include: {
                group: { include: { enrollments: { where: { studentId: s.sub, status: 'ACTIVE' } } } },
              },
            },
          },
        },
      },
    });
    allowed = !!item && (s.role === 'ADMIN' || (s.role === 'TEACHER' && item.task.teachingAssignment.teacherId === s.sub) || (s.role === 'STUDENT' && item.task.teachingAssignment.group.enrollments.length > 0));
  } else {
    item = await prisma.submissionAttachment.findUnique({
      where: { id },
      include: { submission: { include: { task: { include: { teachingAssignment: true } } } } },
    });
    allowed = !!item && (s.role === 'ADMIN' || item.submission.studentId === s.sub || (s.role === 'TEACHER' && item.submission.task.teachingAssignment.teacherId === s.sub));
  }

  if (!allowed) return new Response('No autorizado', { status: 403 });
  const result = await get(item.pathname, { access: 'private' });
  if (!result) return new Response('Archivo no encontrado', { status: 404 });
  return new Response(result.stream, {
    headers: {
      'Content-Type': item.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(item.name)}`,
    },
  });
}
