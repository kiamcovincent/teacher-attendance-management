import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, LoaderCircle, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppData.jsx';

export default function LoginPage() {
  const { data, signIn } = useAppData();
  const [email, setEmail] = useState(data.teacher?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    if (!data.teacher || email.trim().toLowerCase() !== data.teacher.email.trim().toLowerCase()) {
      setError('Email or password is incorrect. Check your details and try again.');
      setLoading(false);
      return;
    }
    signIn(rememberMe);
    navigate('/dashboard');
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <Link to="/login" className="auth-brand" aria-label="FacultyDesk sign in">
          <span className="auth-brand-mark"><GraduationCap size={23} /></span>
          <span><strong>FacultyDesk</strong><small>TEACHER ATTENDANCE PORTAL</small></span>
        </Link>
        <div className="auth-heading">
          <span className="eyebrow">TEACHER SIGN IN</span>
          <h1 id="login-title">Welcome back<span>.</span></h1>
          <p>Sign in to manage your classes and attendance.</p>
        </div>

        <form className="login-form" onSubmit={submit} noValidate>
          <label className="field">
            <span className="field-label">Email address</span>
            <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="you@school.edu" autoComplete="email" required />
          </label>
          <div className="field">
            <label className="field-label" htmlFor="login-password">Password</label>
            <span className="password-control">
              <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="At least 8 characters" autoComplete="current-password" required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </div>

          <div className="login-options">
            <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me</span></label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={loading}>
            {loading ? <><LoaderCircle className="loading-icon" size={17} /> Signing in...</> : <>Sign in <ArrowRight size={17} /> </>}
          </button>
        </form>

        <div className="demo-notice"><strong>Local demo authentication</strong><span>Use the registered teacher email and any password with 8 or more characters. Passwords are not saved or verified.</span></div>
        <p className="auth-register">New to FacultyDesk? <Link to="/register/teacher" className="auth-link">Register as a teacher</Link></p>
        <div className="login-bottom">DEMO WORKSPACE · NO BACKEND CONNECTED</div>
      </section>
    </main>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function submit(event) {
    event.preventDefault();
    setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    setError('');
    setMessage('Password reset is unavailable in this local demo. No email was sent; connect a backend to enable account recovery.');
  }

  return (
    <main className="auth-page">
      <section className="auth-card recovery-card" aria-labelledby="recovery-title">
        <Link to="/login" className="auth-brand" aria-label="Back to FacultyDesk sign in">
          <span className="auth-brand-mark"><GraduationCap size={23} /></span>
          <span><strong>FacultyDesk</strong><small>TEACHER ATTENDANCE PORTAL</small></span>
        </Link>
        <div className="auth-heading">
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h1 id="recovery-title">Forgot password?</h1>
          <p>Enter your account email to check recovery options.</p>
        </div>
        <form className="login-form" onSubmit={submit} noValidate>
          <label className="field">
            <span className="field-label">Email address</span>
            <span className="recovery-email"><Mail size={17} /><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); setMessage(''); }} placeholder="you@school.edu" autoComplete="email" required /></span>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="recovery-message" role="status">{message}</p>}
          <button className="button button-primary login-submit" type="submit">Check recovery options <ArrowRight size={17} /></button>
        </form>
        <Link to="/login" className="back-to-login"><ArrowLeft size={15} /> Back to sign in</Link>
        <p className="auth-register">New teacher? <Link to="/register/teacher" className="auth-link">Create an account</Link></p>
        <div className="login-bottom">DEMO WORKSPACE · NO BACKEND CONNECTED</div>
      </section>
    </main>
  );
}