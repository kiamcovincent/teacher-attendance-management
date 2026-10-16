import { useEffect, useState } from 'react';
import { CalendarCheck2, Check, CheckCircle2, Clock3, History, Pencil, RotateCcw, Save, Users, X } from 'lucide-react';
import { useAppData } from '../context/AppData.jsx';
import { Field, SelectField } from '../components/Ui.jsx';

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const statuses = ['Present', 'Absent', 'Late'];

function sameSession(record, key) {
  return record.subjectId === key.subjectId && record.scheduleId === key.scheduleId && record.date === key.date;
}

function countMarks(marks = []) {
  return marks.reduce((counts, mark) => {
    if (statuses.includes(mark.status)) counts[mark.status] += 1;
    return counts;
  }, { Present: 0, Absent: 0, Late: 0 });
}

export default function AttendancePage() {
  const { data, setData } = useAppData();
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id || '');
  const [scheduleId, setScheduleId] = useState(data.schedules.find((item) => item.subjectId === data.subjects[0]?.id)?.id || '');
  const [date, setDate] = useState(localDate);
  const [marks, setMarks] = useState({});
  const [historySubject, setHistorySubject] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const schedules = data.schedules.filter((item) => item.subjectId === subjectId);
  const schedule = schedules.find((item) => item.id === scheduleId);
  const students = data.students.filter((student) => student.subjectId === subjectId);
  const sessionKey = { subjectId, scheduleId, date };
  const existing = subjectId && scheduleId && date
    ? data.attendance.find((record) => sameSession(record, sessionKey))
    : null;
  const sessionStudents = existing
    ? students.filter((student) => (existing.marks || []).some((mark) => mark.studentId === student.id))
    : students;

  useEffect(() => {
    const savedMarks = new Map((existing?.marks || []).map((mark) => [mark.studentId, mark.status]));
    setMarks(Object.fromEntries(sessionStudents.map((student) => [student.id, savedMarks.get(student.id) || ''])));
  }, [subjectId, scheduleId, date, existing?.id, data.students]);

  const summary = sessionStudents.reduce((counts, student) => {
    const status = marks[student.id];
    if (statuses.includes(status)) counts[status] += 1;
    return counts;
  }, { Present: 0, Absent: 0, Late: 0 });
  const formValid = Boolean(subjectId && schedule && date && sessionStudents.length && sessionStudents.every((student) => statuses.includes(marks[student.id])));
  const validationMessage = !subjectId ? 'Choose a subject to continue.'
    : !schedule ? 'Choose a class schedule to continue.'
      : !date ? 'Choose an attendance date to continue.'
        : !sessionStudents.length ? 'No students are available for this attendance session.'
          : !formValid ? 'Mark each student Present, Absent, or Late before saving.' : '';

  function clearForm() {
    setDate('');
    setMarks({});
    setFeedback(null);
  }

  function startNewSession() {
    setDate('');
    setMarks({});
    setFeedback(null);
    setShowHistory(false);
  }

  function saveAttendance(event) {
    event.preventDefault();
    if (!formValid || saving) {
      setFeedback({ type: 'error', text: validationMessage || 'Complete the attendance form before saving.' });
      return;
    }

    setSaving(true);
    const key = { subjectId, scheduleId, date };
    const updatedRecord = {
      subjectId,
      scheduleId,
      date,
      day: schedule.day,
      start: schedule.start,
      end: schedule.end,
      room: schedule.room,
      marks: sessionStudents.map((student) => ({ studentId: student.id, status: marks[student.id] })),
    };

    setData((previous) => {
      const prior = previous.attendance.find((record) => sameSession(record, key));
      const record = { ...updatedRecord, id: prior?.id || crypto.randomUUID() };
      return {
        ...previous,
        attendance: [...previous.attendance.filter((item) => !sameSession(item, key)), record],
      };
    });
    setFeedback({ type: 'success', text: existing ? 'Attendance updated successfully.' : 'Attendance saved successfully.' });
    setSaving(false);
  }

  function openSession(record) {
    setSubjectId(record.subjectId);
    setScheduleId(record.scheduleId);
    setDate(record.date);
    setFeedback(null);
    setShowHistory(false);
  }

  const filteredHistory = [...data.attendance]
    .filter((record) => (!historySubject || record.subjectId === historySubject) && (!historyDate || record.date === historyDate))
    .sort((first, second) => second.date.localeCompare(first.date) || (second.start || '').localeCompare(first.start || ''));

  return <>
    <div className="page-title-row attendance-title">
      <div><span className="eyebrow">CLASS RECORDS</span><h1>Attendance</h1><p>Take attendance, update a saved session, or review class history.</p></div>
      <div className="attendance-title-actions">
        <button className="button button-outline" type="button" onClick={startNewSession}><RotateCcw size={15} />New Attendance</button>
        <button className="button button-outline" type="button" onClick={() => setShowHistory((visible) => !visible)}><History size={15} />{showHistory ? 'Hide History' : 'View History'}</button>
      </div>
    </div>
    <div className="attendance-date-stamp"><CalendarCheck2 size={18} /><span>ATTENDANCE SESSIONS<small>{data.attendance.length} saved</small></span></div>

    <div className="attendance-layout">
      <section className="content-panel attendance-main">
        <div className="panel-heading"><div><span className="eyebrow">{existing ? 'SAVED SESSION' : 'ATTENDANCE SESSION'}</span><h2>{existing ? 'Review or edit attendance' : 'Mark attendance'}</h2></div><span className="live-badge"><span />{existing ? 'EDITABLE' : 'READY'}</span></div>
        <form onSubmit={saveAttendance}>
          <div className="attendance-filters">
            <SelectField label="Subject" value={subjectId} onChange={(event) => {
              const nextSubjectId = event.target.value;
              setSubjectId(nextSubjectId);
              setScheduleId(data.schedules.find((item) => item.subjectId === nextSubjectId)?.id || '');
              setFeedback(null);
            }} required>
              <option value="">Choose subject</option>{data.subjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.code} · {subject.name}</option>)}
            </SelectField>
            <SelectField label="Class schedule" value={scheduleId} onChange={(event) => { setScheduleId(event.target.value); setFeedback(null); }} required>
              <option value="">Choose class schedule</option>{schedules.map((item) => <option value={item.id} key={item.id}>{item.day} · {item.start}–{item.end} · {item.room}</option>)}
            </SelectField>
            <Field label="Attendance date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setFeedback(null); }} required />
          </div>
          {schedule && <div className="selected-class"><span className="selected-class-icon"><Clock3 size={17} /></span><span><strong>{schedule.day}, {schedule.start}–{schedule.end}</strong><small>{schedule.room}</small></span><span className="selected-class-roster">{sessionStudents.length} students</span></div>}

          {!data.subjects.length ? <div className="empty-state attendance-empty"><Users size={22} /><strong>No subjects available</strong><p>Set up a teacher, subjects, schedules, and students before taking attendance.</p></div>
            : !schedule ? <div className="empty-state attendance-empty"><CalendarCheck2 size={22} /><strong>No schedule selected</strong><p>Choose a class schedule or add one to this subject before taking attendance.</p></div>
              : !sessionStudents.length ? <div className="empty-state attendance-empty"><Users size={22} /><strong>No students in this session</strong><p>Enroll students in this subject to create an attendance record.</p></div>
                : <>
                  <div className="attendance-summary-strip"><span><i className="summary-dot present-dot" />Present <strong>{summary.Present}</strong></span><span><i className="summary-dot absent-dot" />Absent <strong>{summary.Absent}</strong></span><span><i className="summary-dot late-dot" />Late <strong>{summary.Late}</strong></span></div>
                  <div className="attendance-roster"><div className="roster-table-head"><span>STUDENT</span><span>STATUS</span></div>{sessionStudents.map((student) => <div className="attendance-student" key={student.id}><span className="attendance-student-name"><span className="student-avatar">{student.name.slice(0, 1).toUpperCase()}</span><span><strong>{student.name}</strong><small>{student.id} · {student.year} {student.section}</small></span></span><div className="status-control" role="group" aria-label={`Attendance status for ${student.name}`}>{statuses.map((status) => <button key={status} type="button" aria-pressed={marks[student.id] === status} className={`status-option ${status.toLowerCase()} ${marks[student.id] === status ? 'selected' : ''}`} onClick={() => { setMarks((current) => ({ ...current, [student.id]: status })); setFeedback(null); }}>{status === 'Present' ? <Check size={13} /> : status === 'Absent' ? <X size={13} /> : <Clock3 size={13} />}<span>{status}</span></button>)}</div></div>)}</div>
                  <div className="attendance-action-row">
                    <div className="attendance-form-feedback" aria-live="polite">
                      {feedback && <span className={feedback.type === 'success' ? 'saved-confirmation' : 'attendance-error'}><CheckCircle2 size={16} />{feedback.text}</span>}
                      {!feedback && validationMessage && <span className="attendance-validation">{validationMessage}</span>}
                    </div>
                    <div className="attendance-form-buttons">
                      <button className="button button-quiet" type="button" onClick={clearForm}>Clear Form</button>
                      <button className="button button-primary" type="submit" disabled={!formValid || saving}><Save size={16} />{saving ? 'Saving...' : existing ? 'Save Attendance' : 'Save Attendance'}</button>
                    </div>
                  </div>
                </>}
          {feedback?.type === 'error' && <p className="attendance-error" role="alert">{feedback.text}</p>}
        </form>
      </section>

      <aside className="attendance-aside">
        <section className="content-panel summary-panel"><div className="panel-heading"><div><span className="eyebrow">SESSION SUMMARY</span><h2>Attendance totals</h2></div></div><div className="attendance-big-number">{sessionStudents.length ? Math.round((summary.Present / sessionStudents.length) * 100) : 0}<span>%</span></div><p className="big-number-caption">of this session marked present</p><div className="summary-bar"><span style={{ width: `${sessionStudents.length ? (summary.Present / sessionStudents.length) * 100 : 0}%` }} /><i style={{ left: `${sessionStudents.length ? (summary.Present / sessionStudents.length) * 100 : 0}%` }} /></div><div className="summary-counts"><span>Present <strong>{summary.Present}</strong></span><span>Enrolled <strong>{sessionStudents.length}</strong></span></div></section>
        <section className="content-panel records-panel"><div className="panel-heading"><div><span className="eyebrow">RECENT</span><h2>Saved sessions</h2></div></div>{data.attendance.length ? <div className="saved-records">{[...data.attendance].sort((first, second) => second.date.localeCompare(first.date)).slice(0, 5).map((record) => {
          const subject = data.subjects.find((item) => item.id === record.subjectId);
          const counts = countMarks(record.marks);
          return <button className="saved-record saved-record-button" type="button" key={record.id} onClick={() => openSession(record)}><span className="saved-record-icon"><CheckCircle2 size={16} /></span><span className="saved-record-info"><strong>{subject?.code || 'Subject'}</strong><small>{new Date(`${record.date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {record.day}</small></span><span className="saved-record-counts"><b>{counts.Present}P</b><i>{counts.Late}L</i><em>{counts.Absent}A</em></span></button>;
        })}</div> : <div className="records-empty">No saved records yet.<br />Your class history will build here.</div>}</section>
      </aside>
    </div>

    {showHistory && <section className="content-panel attendance-history-panel" id="attendance-history">
      <div className="panel-heading"><div><span className="eyebrow">ATTENDANCE HISTORY</span><h2>Saved sessions</h2></div><span className="count-badge">{filteredHistory.length} sessions</span></div>
      <div className="history-filters">
        <SelectField label="Filter by subject" value={historySubject} onChange={(event) => setHistorySubject(event.target.value)}><option value="">All subjects</option>{data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>)}</SelectField>
        <Field label="Filter by date" type="date" value={historyDate} onChange={(event) => setHistoryDate(event.target.value)} />
      </div>
      {filteredHistory.length ? <div className="history-list">{filteredHistory.map((record) => {
        const subject = data.subjects.find((item) => item.id === record.subjectId);
        const recordSchedule = data.schedules.find((item) => item.id === record.scheduleId);
        const counts = countMarks(record.marks);
        const isSelected = existing?.id === record.id;
        return <article className={`history-record ${isSelected ? 'history-record-selected' : ''}`} key={record.id}>
          <div className="history-record-main"><strong>{subject?.code || 'Subject'} · {subject?.name || 'Unknown subject'}</strong><span>{new Date(`${record.date}T12:00:00`).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })} · {recordSchedule?.day || record.day} · {record.start || recordSchedule?.start}–{record.end || recordSchedule?.end} · {record.room || recordSchedule?.room}</span></div>
          <div className="history-counts"><span className="history-present">{counts.Present} Present</span><span className="history-absent">{counts.Absent} Absent</span><span className="history-late">{counts.Late} Late</span></div>
          <button className="button button-outline" type="button" onClick={() => openSession(record)}><Pencil size={14} />{isSelected ? 'Editing' : 'Edit Attendance'}</button>
        </article>;
      })}</div> : <div className="records-empty">No attendance sessions match these filters.</div>}
    </section>}
  </>;
}