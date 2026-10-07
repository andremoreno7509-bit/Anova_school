import { prisma } from './prisma';

const round=(n,d=1)=>n==null?null:Number(n.toFixed(d));
const avg=(xs)=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));

function riskForStudent({student, grades, attendance, tasks, incidents, exams}){
  const scoreAvg=avg(grades.map(g=>g.score));
  const counted=attendance.filter(a=>['PRESENT','ABSENT','LATE'].includes(a.status));
  const attendanceRate=counted.length?counted.filter(a=>a.status!=='ABSENT').length/counted.length*100:null;
  const absences=attendance.filter(a=>a.status==='ABSENT').length;
  const lates=attendance.filter(a=>a.status==='LATE').length;
  const submitted=new Set();
  for(const t of tasks){for(const s of t.submissions||[]){if(s.studentId===student.id&&['SUBMITTED','LATE','GRADED'].includes(s.status))submitted.add(t.id)}}
  const now=Date.now();
  const overdue=tasks.filter(t=>new Date(t.dueDate).getTime()<now&&!submitted.has(t.id)).length;
  const pending=tasks.filter(t=>new Date(t.dueDate).getTime()>=now&&!submitted.has(t.id)).length;
  const openIncidents=incidents.filter(i=>i.status!=='CLOSED').length;
  const seriousIncidents=incidents.filter(i=>['HIGH','CRITICAL'].includes(String(i.severity).toUpperCase())).length;
  const periodMap=new Map();
  for(const g of grades){const arr=periodMap.get(g.period)||[];arr.push(g.score);periodMap.set(g.period,arr)}
  const periodAverages=[...periodMap.entries()].sort((a,b)=>a[0]-b[0]).map(([period,xs])=>({period,average:avg(xs)}));
  let drop=0;
  if(periodAverages.length>=2){const a=periodAverages.at(-2).average,b=periodAverages.at(-1).average;drop=Math.max(0,a-b)}
  let riskScore=0;const reasons=[];
  if(scoreAvg!=null){if(scoreAvg<6){riskScore+=35;reasons.push(`Promedio crítico (${round(scoreAvg)})`)}else if(scoreAvg<7){riskScore+=25;reasons.push(`Promedio bajo (${round(scoreAvg)})`)}else if(scoreAvg<8){riskScore+=10;reasons.push(`Promedio por debajo de 8 (${round(scoreAvg)})`)}}
  if(attendanceRate!=null){if(attendanceRate<85){riskScore+=30;reasons.push(`Asistencia baja (${Math.round(attendanceRate)}%)`)}else if(attendanceRate<90){riskScore+=20;reasons.push(`Asistencia en observación (${Math.round(attendanceRate)}%)`)}else if(attendanceRate<95){riskScore+=8;reasons.push(`Asistencia mejorable (${Math.round(attendanceRate)}%)`)}}
  if(overdue>=3){riskScore+=20;reasons.push(`${overdue} tareas vencidas`)}else if(overdue>0){riskScore+=10;reasons.push(`${overdue} tarea(s) vencida(s)`) }
  if(drop>=1){riskScore+=15;reasons.push(`Caída de ${round(drop)} puntos entre periodos`)}else if(drop>=0.5){riskScore+=8;reasons.push(`Descenso de ${round(drop)} puntos`) }
  if(seriousIncidents>0){riskScore+=15;reasons.push(`${seriousIncidents} incidencia(s) de severidad alta`)}else if(openIncidents>=2){riskScore+=8;reasons.push(`${openIncidents} incidencias abiertas`)}
  riskScore=clamp(riskScore);
  const risk=riskScore>=50?'HIGH':riskScore>=25?'MEDIUM':'LOW';
  const examScores=exams.map(e=>e.finalScore).filter(x=>typeof x==='number');
  const recommendations=[];
  if(scoreAvg!=null&&scoreAvg<7)recommendations.push('Revisión académica con profesor y plan de recuperación.');
  if(attendanceRate!=null&&attendanceRate<90)recommendations.push('Dar seguimiento inmediato a asistencia y causas de ausencias.');
  if(overdue>0)recommendations.push('Regularizar tareas vencidas y calendarizar entregas pendientes.');
  if(drop>=0.5)recommendations.push('Comparar materias con mayor caída entre periodos.');
  if(openIncidents>0)recommendations.push('Revisar incidencias con tutoría/control escolar.');
  if(!recommendations.length)recommendations.push('Mantener seguimiento ordinario y reforzar hábitos actuales.');
  return {average:round(scoreAvg),attendanceRate:attendanceRate==null?null:Math.round(attendanceRate),absences,lates,overdueTasks:overdue,pendingTasks:pending,incidents:openIncidents,examAverage:round(avg(examScores)),drop:round(drop),riskScore,risk,reasons,recommendations};
}

export async function buildIntelligence(user){
  let studentIds=[];let assignmentIds=null;let scopeLabel='';
  if(user.role==='ADMIN'){
    const students=await prisma.user.findMany({where:{schoolId:user.schoolId,role:'STUDENT',status:'ACTIVE'},select:{id:true}});
    studentIds=students.map(x=>x.id);scopeLabel='Toda la escuela';
  }else if(user.role==='TEACHER'){
    const assignments=await prisma.teachingAssignment.findMany({where:{teacherId:user.id},select:{id:true,groupId:true}});
    assignmentIds=assignments.map(x=>x.id);const groupIds=[...new Set(assignments.map(x=>x.groupId))];
    const ens=await prisma.enrollment.findMany({where:{groupId:{in:groupIds},status:'ACTIVE'},select:{studentId:true}});
    studentIds=[...new Set(ens.map(x=>x.studentId))];scopeLabel='Mis grupos y materias';
  }else if(user.role==='TUTOR'){
    const links=await prisma.guardianStudent.findMany({where:{guardianId:user.id},select:{studentId:true}});
    studentIds=links.map(x=>x.studentId);scopeLabel='Alumnos vinculados';
  }else{
    studentIds=[user.id];scopeLabel='Mi desempeño';
  }

  if(!studentIds.length)return {role:user.role,scopeLabel,generatedAt:new Date().toISOString(),metrics:{students:0,average:null,attendanceRate:null,approvalRate:null,highRisk:0,mediumRisk:0,lowRisk:0,overdueTasks:0},trend:[],subjects:[],groups:[],students:[],alerts:[]};

  const enrollmentWhere={studentId:{in:studentIds},status:'ACTIVE'};
  const enrollments=await prisma.enrollment.findMany({where:enrollmentWhere,include:{student:{select:{id:true,firstName:true,lastName:true,studentCode:true,email:true}},group:{include:{cycle:true}}},orderBy:{enrolledAt:'desc'}});
  const enrollmentByStudent=new Map();
  for(const e of enrollments)if(!enrollmentByStudent.has(e.studentId))enrollmentByStudent.set(e.studentId,e);
  const groupIds=[...new Set([...enrollmentByStudent.values()].map(e=>e.groupId))];

  const gradeWhere={studentId:{in:studentIds}};
  const attendanceWhere={studentId:{in:studentIds}};
  if(assignmentIds){gradeWhere.teachingAssignmentId={in:assignmentIds};attendanceWhere.teachingAssignmentId={in:assignmentIds}}
  const taskWhere=assignmentIds?{teachingAssignmentId:{in:assignmentIds},active:true}:{teachingAssignment:{groupId:{in:groupIds}},active:true};
  const examWhere={studentId:{in:studentIds}};
  if(assignmentIds)examWhere.exam={teachingAssignmentId:{in:assignmentIds}};

  const [grades,attendance,tasks,incidents,exams,groups]=await Promise.all([
    prisma.grade.findMany({where:gradeWhere,include:{teachingAssignment:{include:{subject:true,group:true}}}}),
    prisma.attendanceRecord.findMany({where:attendanceWhere,include:{teachingAssignment:{include:{subject:true,group:true}}}}),
    prisma.academicTask.findMany({where:taskWhere,include:{teachingAssignment:{include:{subject:true,group:true}},submissions:{where:{studentId:{in:studentIds}},select:{studentId:true,status:true,score:true}}}}),
    prisma.incident.findMany({where:{studentId:{in:studentIds}},select:{id:true,studentId:true,severity:true,status:true,occurredAt:true,category:true}}),
    prisma.examAttempt.findMany({where:examWhere,select:{studentId:true,finalScore:true,status:true,exam:{select:{teachingAssignment:{select:{subject:{select:{name:true}},group:{select:{id:true,name:true,grade:true}}}}}}}}),
    prisma.group.findMany({where:{id:{in:groupIds}},include:{cycle:true}}),
  ]);

  const students=enrollments.filter((e,i,a)=>a.findIndex(x=>x.studentId===e.studentId)===i).map(e=>{
    const sg=grades.filter(g=>g.studentId===e.studentId);
    const sa=attendance.filter(a=>a.studentId===e.studentId);
    const st=tasks.filter(t=>t.teachingAssignment.groupId===e.groupId);
    const si=incidents.filter(i=>i.studentId===e.studentId);
    const se=exams.filter(x=>x.studentId===e.studentId&&x.status==='GRADED');
    const metrics=riskForStudent({student:e.student,grades:sg,attendance:sa,tasks:st,incidents:si,exams:se});
    return {id:e.student.id,name:`${e.student.firstName} ${e.student.lastName}`,studentCode:e.student.studentCode,email:e.student.email,groupId:e.groupId,group:`${e.group.grade}° ${e.group.name}`,cycle:e.group.cycle.name,...metrics};
  }).sort((a,b)=>b.riskScore-a.riskScore||String(a.name).localeCompare(String(b.name)));

  const overallAverage=avg(grades.map(g=>g.score));
  const counted=attendance.filter(a=>['PRESENT','ABSENT','LATE'].includes(a.status));
  const attendanceRate=counted.length?counted.filter(a=>a.status!=='ABSENT').length/counted.length*100:null;
  const approvalRate=grades.length?grades.filter(g=>g.score>=6).length/grades.length*100:null;
  const overdueTasks=students.reduce((n,s)=>n+s.overdueTasks,0);

  const periodMap=new Map();
  for(const g of grades){const arr=periodMap.get(g.period)||[];arr.push(g.score);periodMap.set(g.period,arr)}
  const trend=[...periodMap.entries()].sort((a,b)=>a[0]-b[0]).map(([period,xs])=>({period,label:`Periodo ${period}`,average:round(avg(xs)),count:xs.length}));

  const subjectMap=new Map();
  for(const g of grades){const s=g.teachingAssignment.subject;const key=s.id;const row=subjectMap.get(key)||{id:key,name:s.name,code:s.code,scores:[],groupIds:new Set()};row.scores.push(g.score);row.groupIds.add(g.teachingAssignment.groupId);subjectMap.set(key,row)}
  const subjects=[...subjectMap.values()].map(s=>({id:s.id,name:s.name,code:s.code,average:round(avg(s.scores)),failureRate:Math.round(s.scores.filter(x=>x<6).length/s.scores.length*100),grades:s.scores.length,groups:s.groupIds.size})).sort((a,b)=>b.failureRate-a.failureRate||a.average-b.average);

  const groupsStats=groups.map(g=>{const gs=grades.filter(x=>x.teachingAssignment.groupId===g.id);const ga=attendance.filter(x=>x.teachingAssignment.groupId===g.id&&['PRESENT','ABSENT','LATE'].includes(x.status));const ss=students.filter(s=>s.groupId===g.id);return {id:g.id,name:`${g.grade}° ${g.name}`,cycle:g.cycle.name,students:ss.length,average:round(avg(gs.map(x=>x.score))),attendanceRate:ga.length?Math.round(ga.filter(x=>x.status!=='ABSENT').length/ga.length*100):null,highRisk:ss.filter(x=>x.risk==='HIGH').length,mediumRisk:ss.filter(x=>x.risk==='MEDIUM').length}}).sort((a,b)=>(a.average??99)-(b.average??99));

  const alerts=[];
  const highRisk=students.filter(s=>s.risk==='HIGH');
  if(highRisk.length)alerts.push({level:'HIGH',title:`${highRisk.length} alumno(s) en riesgo alto`,message:`Prioridad: ${highRisk.slice(0,3).map(x=>x.name).join(', ')}${highRisk.length>3?'…':''}`});
  const worstSubject=subjects[0];
  if(worstSubject&&worstSubject.failureRate>=20)alerts.push({level:worstSubject.failureRate>=35?'HIGH':'MEDIUM',title:`Rezago en ${worstSubject.name}`,message:`${worstSubject.failureRate}% de calificaciones reprobatorias; promedio ${worstSubject.average??'—'}.`});
  const worstGroup=groupsStats.filter(g=>g.attendanceRate!=null).sort((a,b)=>a.attendanceRate-b.attendanceRate)[0];
  if(worstGroup&&worstGroup.attendanceRate<90)alerts.push({level:worstGroup.attendanceRate<85?'HIGH':'MEDIUM',title:`Asistencia baja en ${worstGroup.name}`,message:`Asistencia acumulada de ${worstGroup.attendanceRate}%.`});
  if(overdueTasks)alerts.push({level:overdueTasks>=10?'HIGH':'MEDIUM',title:'Entregas vencidas',message:`Se detectaron ${overdueTasks} tareas vencidas sin entrega en el alcance analizado.`});
  if(!alerts.length)alerts.push({level:'LOW',title:'Sin alertas críticas',message:'Los indicadores disponibles se encuentran dentro de los umbrales definidos.'});

  return {role:user.role,scopeLabel,generatedAt:new Date().toISOString(),metrics:{students:students.length,average:round(overallAverage),attendanceRate:attendanceRate==null?null:Math.round(attendanceRate),approvalRate:approvalRate==null?null:Math.round(approvalRate),highRisk:students.filter(s=>s.risk==='HIGH').length,mediumRisk:students.filter(s=>s.risk==='MEDIUM').length,lowRisk:students.filter(s=>s.risk==='LOW').length,overdueTasks},trend,subjects,groups:groupsStats,students,alerts};
}

export function answerIntelligenceQuestion(data,question){
  const q=String(question||'').trim().toLowerCase();
  if(!q)return {answer:'Escribe una pregunta sobre riesgo, asistencia, promedios, materias, grupos o tareas.',evidence:[]};
  const high=data.students.filter(s=>s.risk==='HIGH');
  const student=data.students.find(s=>q.includes(s.name.toLowerCase())||s.name.toLowerCase().split(' ').some(p=>p.length>3&&q.includes(p)));
  if(student)return {answer:`${student.name} tiene promedio ${student.average??'sin datos'}, asistencia ${student.attendanceRate==null?'sin datos':student.attendanceRate+'%'} y riesgo ${student.risk==='HIGH'?'alto':student.risk==='MEDIUM'?'medio':'bajo'} (${student.riskScore}/100). ${student.reasons.length?`Factores: ${student.reasons.join('; ')}.`:'No hay factores de riesgo relevantes con los datos actuales.'}`,evidence:student.recommendations};
  if(q.includes('riesgo'))return {answer:high.length?`Hay ${high.length} alumno(s) en riesgo alto. Los casos prioritarios son ${high.slice(0,5).map(s=>`${s.name} (${s.riskScore})`).join(', ')}.`:'No hay alumnos clasificados en riesgo alto con los datos actuales.',evidence:high.slice(0,5).flatMap(s=>s.reasons.slice(0,2))};
  if(q.includes('asistencia')||q.includes('falta')){const worst=[...data.groups].filter(g=>g.attendanceRate!=null).sort((a,b)=>a.attendanceRate-b.attendanceRate)[0];return {answer:`La asistencia del alcance es ${data.metrics.attendanceRate==null?'sin datos':data.metrics.attendanceRate+'%'}.${worst?` El grupo con menor asistencia es ${worst.name} con ${worst.attendanceRate}%.`:''}`,evidence:worst?[`Grupo ${worst.name}: ${worst.attendanceRate}%`]:[]}}
  if(q.includes('materia')||q.includes('reprob')){const s=data.subjects[0];return {answer:s?`${s.name} presenta el mayor porcentaje de reprobación (${s.failureRate}%) y promedio ${s.average??'—'}.`:'Todavía no hay suficientes calificaciones para comparar materias.',evidence:s?[`${s.grades} calificaciones analizadas`,`Presente en ${s.groups} grupo(s)`]:[]}}
  if(q.includes('grupo')){const g=data.groups[0];return {answer:g?`${g.name} tiene el promedio más bajo de los grupos analizados: ${g.average??'sin datos'}, con asistencia ${g.attendanceRate==null?'sin datos':g.attendanceRate+'%'}.`:'No hay grupos con información suficiente.',evidence:g?[`${g.highRisk} alumno(s) en riesgo alto`,`${g.mediumRisk} en riesgo medio`]:[]}}
  if(q.includes('tarea')||q.includes('pendiente')||q.includes('vencid'))return {answer:`Se detectaron ${data.metrics.overdueTasks} tareas vencidas sin entrega dentro del alcance actual.`,evidence:data.students.filter(s=>s.overdueTasks>0).slice(0,5).map(s=>`${s.name}: ${s.overdueTasks} vencida(s)`) };
  if(q.includes('promedio')||q.includes('rendimiento'))return {answer:`El promedio general del alcance es ${data.metrics.average??'sin datos'} y la aprobación de registros de calificación es ${data.metrics.approvalRate==null?'sin datos':data.metrics.approvalRate+'%'}.`,evidence:data.trend.map(t=>`${t.label}: ${t.average??'—'}`).slice(-4)};
  return {answer:`Resumen: ${data.metrics.students} alumno(s), promedio ${data.metrics.average??'—'}, asistencia ${data.metrics.attendanceRate==null?'—':data.metrics.attendanceRate+'%'}, ${data.metrics.highRisk} en riesgo alto y ${data.metrics.overdueTasks} tareas vencidas.`,evidence:data.alerts.slice(0,4).map(a=>a.title)};
}
