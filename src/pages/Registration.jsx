import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react';
import { useAppData } from '../context/AppData.jsx';
import RegistrationFrame from '../components/RegistrationFrame.jsx';
import { AddButton, AddedList, Field, FormActions, FormHeading, Notice, SelectField, SuccessIcon } from '../components/Ui.jsx';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate'];

export default function RegistrationPage({ success = false }) {
  const { step = 'teacher' } = useParams();
  const { data, setData, signIn } = useAppData();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  function updateData(changes) {
    setData((previous) => ({ ...previous, ...changes }));
  }

  function next(path) {
    setError('');
    navigate(path);
  }

  if (success) {
    if (!data.teacher) return <Navigate to="/register/teacher" replace />;
    if (!data.subjects.length) return <Navigate to="/register/subjects" replace />;
    if (!data.schedules.length) return <Navigate to="/register/schedule" replace />;
    if (!data.students.length) return <Navigate to="/register/students" replace />;
    return (
      <div className="success-page">
        <div className="success-orbit orbit-one" /><div className="success-orbit orbit-two" />
        <div className="success-panel">
          <SuccessIcon />
          <span className="eyebrow">ALL SET</span>
          <h1>Registration Successfully Completed!</h1>
          <p className="success-copy">Welcome aboard, <strong>{data.teacher?.name}</strong>. Your teaching workspace is ready.</p>
          <div className="success-counts">
            <div><BookOpen size={18} /><strong>{data.subjects.length}</strong><span>Subjects</span></div>
            <div><CalendarDays size={18} /><strong>{data.schedules.length}</strong><span>Schedules</span></div>
            <div><Users size={18} /><strong>{data.students.length}</strong><span>Students</span></div>
          </div>
          <button className="button button-primary success-continue" onClick={() => { signIn(); navigate('/dashboard'); }}>Continue to Teacher Dashboard <ArrowRight size={17} /></button>
          <small className="demo-note">Demo workspace · Data is saved in this browser</small>
        </div>
      </div>
    );
  }

  const validStep = ['teacher', 'subjects', 'schedule', 'students'].includes(step) ? step : 'teacher';

  return <RegistrationFrame current={validStep}>{validStep === 'teacher' ? (
    <TeacherForm teacher={data.teacher} onSubmit={(teacher) => { updateData({ teacher }); next('/register/subjects'); }} />
  ) : validStep === 'subjects' ? (
    <SubjectsForm subjects={data.subjects} error={error} setError={setError} onAdd={(subjects) => {
      const validIds = new Set(subjects.map((subject) => subject.id));
      updateData({ subjects, schedules: data.schedules.filter((item) => validIds.has(item.subjectId)), students: data.students.filter((item) => validIds.has(item.subjectId)) });
    }} onNext={() => data.subjects.length ? next('/register/schedule') : setError('Add at least one subject to continue.')} />
  ) : validStep === 'schedule' ? (
    <ScheduleForm subjects={data.subjects} schedules={data.schedules} error={error} setError={setError} onAdd={(schedules) => updateData({ schedules })} onNext={() => data.schedules.length ? next('/register/students') : setError('Add at least one class schedule to continue.')} />
  ) : (
    <StudentsForm subjects={data.subjects} students={data.students} error={error} setError={setError} onAdd={(students) => updateData({ students })} onNext={() => data.students.length ? next('/registration-success') : setError('Add at least one student to complete registration.')} />
  )}</RegistrationFrame>;
}

function TeacherForm({ teacher, onSubmit }) {
  const [form, setForm] = useState({ id: teacher?.id || '', name: teacher?.name || '', email: teacher?.email || '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.id.trim()) nextErrors.id = 'Teacher ID is required.';
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (form.password !== form.confirm) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSubmit({ id: form.id.trim(), name: form.name.trim(), email: form.email.trim().toLowerCase() });
  }
  return <form className="form-card" onSubmit={submit} noValidate>
    <FormHeading title="Teacher details" description="Create your faculty profile to get started." />
    <div className="form-grid">
      <Field label="Teacher ID" name="id" value={form.id} onChange={change} placeholder="e.g. FAC-2048" autoComplete="off" error={errors.id} required />
      <Field label="Full name" name="name" value={form.name} onChange={change} placeholder="Your full name" autoComplete="name" error={errors.name} required />
      <Field label="Email address" name="email" type="email" value={form.email} onChange={change} placeholder="you@university.edu" autoComplete="email" error={errors.email} required />
      <Field label="Password" name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" autoComplete="new-password" error={errors.password} required />
      <Field label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={change} placeholder="Enter password again" autoComplete="new-password" error={errors.confirm} required />
    </div>
    <Notice>Demo-only setup. Passwords are validated in this form and never saved.</Notice>
    <FormActions><button className="button button-primary" type="submit">Continue <ArrowRight size={16} /></button></FormActions>
  </form>;
}

function SubjectsForm({ subjects, onAdd, onNext, error, setError }) {
  const [form, setForm] = useState({ code: '', name: '' });
  function submit(event) {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    if (!code || !name) return setError('Enter both a subject code and subject name.');
    if (subjects.some((item) => item.code === code)) return setError('That subject code is already in your list.');
    onAdd([...subjects, { id: crypto.randomUUID(), code, name }]);
    setForm({ code: '', name: '' }); setError('');
  }
  return <div className="form-card">
    <FormHeading title="Add your subjects" description="Add each subject you teach. You can assign schedules and students next." />
    <form className="entry-form" onSubmit={submit}>
      <Field label="Subject code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS204" required />
      <Field label="Subject name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" required />
      <AddButton>Add subject</AddButton>
    </form>
    {error && <p className="form-error">{error}</p>}
    <AddedList title="Your subjects" items={subjects} emptyText="Subjects you add will appear here." onRemove={(id) => onAdd(subjects.filter((item) => item.id !== id))} renderItem={(item) => <><span className="item-icon blue"><BookOpen size={17} /></span><span className="added-item-copy"><strong>{item.name}</strong><small>{item.code}</small></span></>} />
    <FormActions back="/register/teacher"><button className="button button-primary" type="button" onClick={onNext}>Continue <ArrowRight size={16} /></button></FormActions>
  </div>;
}

function ScheduleForm({ subjects, schedules, onAdd, onNext, error, setError }) {
  const [form, setForm] = useState({ subjectId: subjects[0]?.id || '', day: 'Monday', start: '09:00', end: '10:00', room: '' });
  function submit(event) {
    event.preventDefault();
    if (!form.subjectId || !form.room.trim()) return setError('Choose a subject and enter a classroom or laboratory.');
    if (form.start >= form.end) return setError('End time must be later than start time.');
    if (schedules.some((item) => item.day === form.day && form.start < item.end && form.end > item.start)) return setError('This time overlaps another schedule on the selected day.');
    onAdd([...schedules, { id: crypto.randomUUID(), ...form, room: form.room.trim() }]);
    setForm({ ...form, start: '09:00', end: '10:00', room: '' }); setError('');
  }
  return <div className="form-card">
    <FormHeading title="Create class schedules" description="Set meeting times and locations for your subjects." />
    <form className="entry-form schedule-entry" onSubmit={submit}>
      <SelectField label="Subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}><option value="">Select subject</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</SelectField>
      <SelectField label="Day of week" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>{days.map((day) => <option key={day}>{day}</option>)}</SelectField>
      <Field label="Start time" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required />
      <Field label="End time" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} required />
      <Field label="Classroom / lab" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Science 302" required />
      <AddButton>Add schedule</AddButton>
    </form>
    {error && <p className="form-error">{error}</p>}
    <AddedList title="Class schedules" items={schedules} emptyText="Your class schedule will appear here." onRemove={(id) => onAdd(schedules.filter((item) => item.id !== id))} renderItem={(item) => <><span className="item-icon amber"><Clock3 size={17} /></span><span className="added-item-copy"><strong>{subjects.find((subject) => subject.id === item.subjectId)?.name || 'Subject'}</strong><small>{item.day} · {item.start}–{item.end} · {item.room}</small></span></>} />
    <FormActions back="/register/subjects"><button className="button button-primary" type="button" onClick={onNext}>Continue <ArrowRight size={16} /></button></FormActions>
  </div>;
}

function StudentsForm({ subjects, students, onAdd, onNext, error, setError }) {
  const [form, setForm] = useState({ id: '', name: '', course: '', year: years[0], section: '', subjectId: subjects[0]?.id || '' });
  function submit(event) {
    event.preventDefault();
    const id = form.id.trim();
    if (!id || !form.name.trim() || !form.course.trim() || !form.section.trim() || !form.subjectId) return setError('Complete all student details before adding.');
    if (students.some((item) => item.id.toLowerCase() === id.toLowerCase())) return setError('A student with that ID is already registered.');
    onAdd([...students, { ...form, id, name: form.name.trim(), course: form.course.trim(), section: form.section.trim() }]);
    setForm({ ...form, id: '', name: '', course: '', section: '' }); setError('');
  }
  return <div className="form-card">
    <FormHeading title="Add your students" description="Enroll students in a subject. Each student ID must be unique." />
    <form className="entry-form student-entry" onSubmit={submit}>
      <Field label="Student ID" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. STU-1082" required />
      <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" required />
      <Field label="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. B.Sc. Computer Science" required />
      <SelectField label="Year level" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>{years.map((year) => <option key={year}>{year}</option>)}</SelectField>
      <Field label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. A" required />
      <SelectField label="Assign to subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}><option value="">Select subject</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</SelectField>
      <AddButton>Add student</AddButton>
    </form>
    {error && <p className="form-error">{error}</p>}
    <AddedList title="Enrolled students" items={students} emptyText="Students you enroll will appear here." onRemove={(id) => onAdd(students.filter((item) => item.id !== id))} renderItem={(item) => <><span className="student-avatar">{item.name.slice(0, 1).toUpperCase()}</span><span className="added-item-copy"><strong>{item.name}</strong><small>{item.id} · {item.year} {item.section} · {subjects.find((subject) => subject.id === item.subjectId)?.code}</small></span></>} />
    <FormActions back="/register/schedule"><button className="button button-primary" type="button" onClick={onNext}>Complete registration <ArrowRight size={16} /></button></FormActions>
  </div>;
}