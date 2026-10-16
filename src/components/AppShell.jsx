import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, CheckSquare, ChevronRight, GraduationCap, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react';
import { useAppData } from '../context/AppData.jsx';

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Subjects', path: '/dashboard/subjects', icon: BookOpen },
  { label: 'My Schedule', path: '/dashboard/schedule', icon: CalendarDays },
  { label: 'My Students', path: '/dashboard/students', icon: Users },
  { label: 'Attendance', path: '/dashboard/attendance', icon: CheckSquare },
];

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, signOut } = useAppData();
  const navigate = useNavigate();
  const academicYear = `${new Date().getFullYear()}–${String(new Date().getFullYear() + 1).slice(-2)}`;

  function logout() {
    signOut();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          <span><strong>FacultyDesk</strong><small>ATTENDANCE PORTAL</small></span>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === 'Attendance' && <ChevronRight className="nav-arrow" size={15} />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-chip">
            <span className="avatar">{data.teacher?.name?.slice(0, 1).toUpperCase() || 'T'}</span>
            <span className="profile-name"><strong>{data.teacher?.name || 'Teacher'}</strong><small>{data.teacher?.id || 'Faculty account'}</small></span>
            <button className="icon-button logout-button" title="Log out" aria-label="Log out" onClick={logout}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Faculty portal</strong></div>
          <div className="topbar-user"><span className="online-dot" /> Academic year {academicYear}</div>
        </header>
        <section className="page-content"><Outlet /></section>
      </main>
    </div>
  );
}