import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  ['teacher', 'Teacher'],
  ['subjects', 'Subjects'],
  ['schedule', 'Schedule'],
  ['students', 'Students'],
];

export default function RegistrationFrame({ current, children }) {
  const activeIndex = steps.findIndex(([key]) => key === current);
  return (
    <div className="registration-page">
      <header className="registration-header">
        <Link to="/register/teacher" className="brand-lockup light-brand">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          <span><strong>FacultyDesk</strong><small>ATTENDANCE PORTAL</small></span>
        </Link>
        <span className="secure-note">FACULTY ACCOUNT SETUP</span>
      </header>
      <div className="registration-wrap">
        <div className="registration-intro">
          <span className="eyebrow">GETTING STARTED</span>
          <h1>Set up your<br /><span>teaching workspace.</span></h1>
          <p>Bring your classes, schedules, and attendance into one organized place.</p>
          <div className="steps-list">
            {steps.map(([key, label], index) => (
              <div className={`setup-step ${index < activeIndex ? 'complete' : ''} ${index === activeIndex ? 'current' : ''}`} key={key}>
                <span className="step-number">{index < activeIndex ? '✓' : `0${index + 1}`}</span>
                <span>{label}</span>
                {index === activeIndex && <span className="step-now">IN PROGRESS</span>}
              </div>
            ))}
          </div>
          <div className="setup-footnote"><span className="footnote-line" />Your information stays on this device in this demo.</div>
        </div>
        <div className="registration-form-area">{children}</div>
      </div>
    </div>
  );
}