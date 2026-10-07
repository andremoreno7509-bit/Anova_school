import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const s = await getSession();
  if (!s || s.role !== 'TUTOR') return NextResponse.json({ error: 'Solo tutores' }, { status: 403 });

  const id = new URL(req.url).searchParams.get('studentId');
  if (!id) return NextResponse.json({ error: 'studentId requerido' }, { status: 400 });

  const link = await prisma.guardianStudent.findUnique({
    where: { guardianId_studentId: { guardianId: s.sub, studentId: id } },
    include: { student: true },
  });
  if (!link) return NextResponse.json({ error: 'Alumno no vinculado' }, { status: 403 });

  const student = link.student;
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: id, status: 'ACTIVE' },
    include: {
      group: {
        include: {
          cycle: true,
          teaching: {
            include: {
              subject: true,
              teacher: { select: { firstName: true, lastName: true } },
              grades: { where: { studentId: id }, orderBy: { period: 'asc' } },
              attendance: { where: { studentId: id }, orderBy: { date: 'desc' } },
              tasks: {
                where: { active: true },
                orderBy: { dueDate: 'asc' },
                include: { submissions: { where: { studentId: id } } },
              },
              schedule: { where: { active: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
            },
          },
        },
      },
    },
  });

  const teaching = enrollment?.group?.teaching || [];
  const grades = teaching.flatMap((x) => x.grades.map((g) => ({ ...g, subject: x.subject.name })));
  const attendance = teaching.flatMap((x) => x.attendance.map((a) => ({ ...a, subject: x.subject.name })));
  const tasks = teaching.flatMap((x) => x.tasks.map((t) => ({ ...t, subject: x.subject.name, submission: t.submissions?.[0] || null })));
  const incidents = await prisma.incident.findMany({
    where: { studentId: id },
    include: { reporter: { select: { firstName: true, lastName: true } } },
    orderBy: { occurredAt: 'desc' },
  });

  const avg = grades.length ? grades.reduce((n, g) => n + g.score, 0) / grades.length : null;
  const counted = attendance.filter((a) => ['PRESENT', 'ABSENT', 'LATE'].includes(a.status));
  const rate = counted.length ? (counted.filter((a) => a.status !== 'ABSENT').length / counted.length) * 100 : null;
  const today = new Date(new Date().toDateString());
  const pending = tasks.filter((t) => !['SUBMITTED', 'LATE', 'GRADED'].includes(t.submission?.status) && new Date(t.dueDate) >= today);
  const pulse = Math.round((avg === null ? 100 : Math.max(0, Math.min(100, avg * 10))) * 0.55 + (rate === null ? 100 : rate) * 0.35 + Math.max(60, 100 - Math.min(pending.length, 8) * 5) * 0.10);

  return NextResponse.json({
    student: { id: student.id, firstName: student.firstName, lastName: student.lastName, studentCode: student.studentCode, email: student.email },
    cycle: enrollment?.group?.cycle?.name || null,
    group: enrollment ? `${enrollment.group.grade}° ${enrollment.group.name}` : null,
    metrics: { average: avg === null ? null : Number(avg.toFixed(1)), attendanceRate: rate === null ? null : Math.round(rate), absences: attendance.filter((a) => a.status === 'ABSENT').length, academicPulse: pulse },
    grades,
    attendance,
    tasks,
    pendingTasks: pending,
    incidents,
    schedule: teaching.flatMap((x) => x.schedule.map((h) => ({ ...h, subject: x.subject.name, teacher: `${x.teacher.firstName} ${x.teacher.lastName}` }))),
  });
}
