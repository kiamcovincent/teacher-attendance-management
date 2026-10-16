import { useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppData.jsx';
import { Field, SelectField } from '../components/Ui.jsx';

const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' });

function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title-row"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Metric({ label, value, note, icon: Icon, tone }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={19} /></span><span className="metric-label">{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function SubjectName({ subjectId }) {
  const { data } = useAppData();
  const subject = data.subjects.find((item) => item.id === subjectId);
  return subject ? <><strong>{subject.name}</strong><small>{subject.code}</small></> : <strong>Subject</strong>;
}

export function DashboardHome() {
  const { data } = useAppData();
  const today = new Date().getDay();
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today];
  const todaySchedule = data.schedules.filter((item) => item.day === todayName).sort((a, b) => a.start.localeCompare(b.start));
  const recent = [...data.attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  return <>
    <PageTitle eyebrow="YOUR OVERVIEW" title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${data.teacher?.name?.split(' ')[0] || 'Teacher'}.`} description={`${dateLabel.format(new Date())} · Here’s your teaching workspace at a glance.`} />
    <div className="metric-grid">
      <Metric label="Total subjects" value={data.subjects.length} note="Across your teaching load" icon={BookOpen} tone="tone-blue" />
      <Metric label="Class schedules" value={data.schedules.length} note="Weekly class meetings" icon={CalendarDays} tone="tone-indigo" />
      <Metric label="Students" value={data.students.length} note={`${new Set(data.students.map((student) => student.subjectId)).size} subjects with enrollment`} icon={Users} tone="tone-green" />
      <Metric label="Attendance records" value={data.attendance.length} note="Saved class sessions" icon={CheckCircle2} tone="tone-amber" />
    </div>
    <div className="dashboard-columns">
      <section className="content-panel schedule-panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR TIMETABLE</span><h2>Today’s classes</h2></div><span className="date-pill">{todayName}</span></div>
        {todaySchedule.length ? <div className="timeline">{todaySchedule.map((item) => <div className="timeline-item" key={item.id}><div className="timeline-time">{item.start}<small>{item.end}</small></div><span className="timeline-line" /><div className="timeline-class"><strong><SubjectName subjectId={item.subjectId} /></strong><span>{item.room}</span></div></div>)}</div> : <div className="empty-state"><span className="empty-icon"><CalendarDays size={21} /></span><strong>No classes today</strong><p>Your schedule is clear. Use this time to prepare for the week.</p></div>}
      </section>
      <section className="content-panel quick-panel">
        <div className="panel-heading"><div><span className="eyebrow">QUICK VIEW</span><h2>Class roster</h2></div><Users size={18} className="panel-muted-icon" /></div>
        {data.subjects.length ? <div className="roster-preview">{data.subjects.slice(0, 4).map((subject) => {
          const count = data.students.filter((student) => student.subjectId === subject.id).length;
          return <div className="roster-row" key={subject.id}><span className="subject-dot">{subject.code.slice(0, 2)}</span><span className="roster-name"><strong>{subject.name}</strong><small>{subject.code}</small></span><span className="roster-count">{count}<small>students</small></span></div>;
        })}</div> : <div className="empty-state compact"><strong>No subjects yet</strong><p>Complete registration to see your rosters.</p></div>}
      </section>
    </div>
    <section className="content-panel recent-panel">
      <div className="panel-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Attendance history</h2></div><Link className="inline-link" to="/dashboard/attendance">Open attendance <span>→</span></Link></div>
      {recent.length ? <div className="table-wrap"><table><thead><tr><th>SUBJECT</th><th>DATE</th><th>CLASS TIME</th><th>ATTENDANCE</th></tr></thead><tbody>{recent.map((record) => {
        const present = record.marks.filter((mark) => mark.status === 'Present').length;
        return <tr key={record.id}><td><span className="table-subject"><SubjectName subjectId={record.subjectId} /></span></td><td>{new Date(`${record.date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td><td>{record.start}–{record.end}</td><td><span className="attendance-fraction"><strong>{present}/{record.marks.length}</strong> present</span></td></tr>;
      })}</tbody></table></div> : <div className="table-empty">No attendance has been saved yet.</div>}
    </section>
  </>;
}

export function SubjectsPage() {
  const { data, setData } = useAppData();
  return <>
    <PageTitle eyebrow="TEACHING LOAD" title="My subjects" description="Your registered subjects and their current student enrollment." />
    <section className="content-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">SUBJECT DIRECTORY</span><h2>{data.subjects.length} subjects</h2></div><BookOpen size={19} className="panel-muted-icon" /></div>
      {data.subjects.length ? <div className="subject-grid">{data.subjects.map((subject, index) => {
        const students = data.students.filter((student) => student.subjectId === subject.id);
        const schedules = data.schedules.filter((item) => item.subjectId === subject.id);
        return <article className="subject-card" key={subject.id}><div className={`subject-card-mark mark-${index % 4}`}><BookOpen size={20} /></div><span className="subject-code">{subject.code}</span><h3>{subject.name}</h3><div className="subject-card-meta"><span><Users size={14} />{students.length} students</span><span><CalendarDays size={14} />{schedules.length} classes / week</span></div><div className="subject-student-list">{students.slice(0, 4).map((student) => <span className="tiny-avatar" title={student.name} key={student.id}>{student.name.slice(0, 1).toUpperCase()}</span>)}{students.length > 4 && <span className="more-students">+{students.length - 4}</span>}{!students.length && <small>No enrolled students</small>}</div></article>;
      })}</div> : <div className="empty-state"><BookOpen size={22} /><strong>No subjects registered</strong><p>Start a new demo registration to build your teaching workspace.</p><button className="button button-outline" onClick={() => setData({ ...data, teacher: null, subjects: [], schedules: [], students: [], attendance: [] })}>Reset demo</button></div>}
    </section>
  </>;
}

export function SchedulePage() {
  const { data } = useAppData();
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return <>
    <PageTitle eyebrow="WEEKLY TIMETABLE" title="My schedule" description="A complete view of your recurring classes and locations." />
    <section className="content-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">CLASS MEETINGS</span><h2>{data.schedules.length} scheduled classes</h2></div><CalendarDays size={19} className="panel-muted-icon" /></div>
      {data.schedules.length ? <div className="week-list">{order.map((day) => {
        const classes = data.schedules.filter((item) => item.day === day).sort((a, b) => a.start.localeCompare(b.start));
        if (!classes.length) return null;
        return <div className="week-day" key={day}><div className="week-day-name">{day}</div><div className="week-day-classes">{classes.map((item) => <article className="week-class" key={item.id}><span className="week-class-time">{item.start}<small>{item.end}</small></span><span className="week-class-bar" /><span className="week-class-main"><strong><SubjectName subjectId={item.subjectId} /></strong><small><Clock3 size={13} />{item.room}</small></span></article>)}</div></div>;
      })}</div> : <div className="table-empty">No class schedules registered.</div>}
    </section>
  </>;
}

export function StudentsPage() {
  const { data, setData } = useAppData();
  const [form, setForm] = useState({ subjectId: data.subjects[0]?.id || '', id: '', name: '', course: '', year: 'Year 1', section: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function addStudent(event) {
    event.preventDefault();
    const studentId = form.id.trim();
    const name = form.name.trim();
    const course = form.course.trim();
    const section = form.section.trim();
    if (!form.subjectId || !studentId || !name || !course || !section) {
      setError('Complete each field and choose a subject before adding the student.');
      setSuccess('');
      return;
    }
    if (data.students.some((student) => student.id.toLowerCase() === studentId.toLowerCase())) {
      setError('A student with that ID is already registered.');
      setSuccess('');
      return;
    }

    const student = { ...form, id: studentId, name, course, section };
    setData((previous) => ({ ...previous, students: [...previous.students, student] }));
    setForm((previous) => ({ ...previous, id: '', name: '', course: '', section: '' }));
    setError('');
    setSuccess(`${name} was added to the class roster.`);
  }

  return <>
    <PageTitle eyebrow="ENROLLMENT" title="My students" description="Students enrolled in your subjects, grouped by course assignment." />
    <section className="content-panel student-add-panel">
      <div className="panel-heading"><div><span className="eyebrow">ROSTER MANAGEMENT</span><h2>Add a student</h2></div><Users size={19} className="panel-muted-icon" /></div>
      <form className="student-add-form" onSubmit={addStudent}>
        <SelectField label="Subject" value={form.subjectId} onChange={(event) => { setForm({ ...form, subjectId: event.target.value }); setError(''); setSuccess(''); }} required><option value="">Choose subject</option>{data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>)}</SelectField>
        <Field label="Student ID" value={form.id} onChange={(event) => { setForm({ ...form, id: event.target.value }); setError(''); setSuccess(''); }} placeholder="e.g. STU-1082" required />
        <Field label="Full name" value={form.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); setError(''); setSuccess(''); }} placeholder="Student name" required />
        <Field label="Course" value={form.course} onChange={(event) => { setForm({ ...form, course: event.target.value }); setError(''); setSuccess(''); }} placeholder="e.g. B.Sc. Computer Science" required />
        <SelectField label="Year level" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}>{['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate'].map((year) => <option key={year}>{year}</option>)}</SelectField>
        <Field label="Section" value={form.section} onChange={(event) => { setForm({ ...form, section: event.target.value }); setError(''); setSuccess(''); }} placeholder="e.g. A" required />
        <button className="button button-primary student-add-submit" type="submit">Add student</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {success && <p className="student-add-success" role="status">{success} Existing attendance sessions are unchanged.</p>}
    </section>
    {data.subjects.map((subject) => {
      const students = data.students.filter((student) => student.subjectId === subject.id);
      return <section className="content-panel student-subject-panel" key={subject.id}><div className="panel-heading"><div><span className="eyebrow">{subject.code}</span><h2>{subject.name}</h2></div><span className="count-badge">{students.length} enrolled</span></div>
        {students.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>COURSE</th><th>YEAR & SECTION</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><span className="person-cell"><span className="student-avatar">{student.name.slice(0, 1).toUpperCase()}</span><strong>{student.name}</strong></span></td><td>{student.id}</td><td>{student.course}</td><td>{student.year} · {student.section}</td></tr>)}</tbody></table></div> : <div className="table-empty">No students enrolled in this subject.</div>}
      </section>;
    })}
    {!data.subjects.length && <section className="content-panel full-panel"><div className="empty-state"><Users size={22} /><strong>No student lists</strong><p>Subjects and student enrollments will appear here.</p></div></section>}
  </>;
}