import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTeachers, mockChildren } from '../data/mockData';
import { 
  LayoutDashboard, 
  Users, 
  Baby, 
  Calendar, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  Megaphone, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronLeft, 
  Bell, 
  Search,
  MessageSquare,
  Activity,
  FileText,
  BookOpen,
  X,
  Check,
  User,
  AlertCircle,
  Shield
} from 'lucide-react';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { success, info } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const activeRole = localStorage.getItem('activeRole') || 'parent';

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Refs for click outside detection
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const defaultNotifications = [
    {
      id: 'n-1',
      title: 'School Sanitization Drive',
      desc: 'Sanitization scheduled this Saturday from 9 AM to 5 PM. Restricted staff access.',
      time: '10:15 AM',
      read: false,
      type: 'announcement'
    },
    {
      id: 'n-2',
      title: 'Activity Schedule Revision',
      desc: 'Send soft yoga mat for International Yoga Day preparation next Monday.',
      time: 'Yesterday',
      read: false,
      type: 'announcement'
    },
    {
      id: 'n-3',
      title: 'Audit Compliance Report',
      desc: 'FirstCry Orange Day classroom decoration designs checklist submitted.',
      time: '2 days ago',
      read: true,
      type: 'task'
    },
    {
      id: 'n-4',
      title: 'Attendance Alert',
      desc: 'Playgroup A daily attendance has been verified and logged.',
      time: '3 days ago',
      read: true,
      type: 'attendance'
    },
    {
      id: 'n-5',
      title: 'New Student Note',
      desc: 'Milestone progress remarks added for Aarav Patel.',
      time: '4 days ago',
      read: false,
      type: 'student_update'
    },
    {
      id: 'n-6',
      title: 'System Update Completed',
      desc: 'Version 2.4 dashboard patches applied successfully.',
      time: '5 days ago',
      read: true,
      type: 'system_alert'
    }
  ];

  const { logout, user, isOffline } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getNotifications();
      if (res.data && res.data.success) {
        const mapped = res.data.data.notifications.map(n => ({
          id: n.id,
          title: n.title,
          desc: n.content,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: n.isRead,
          type: n.type
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications from API. Using mock data fallback.", err);
      const local = localStorage.getItem('localNotifications');
      if (local) {
        try {
          setNotifications(JSON.parse(local));
          return;
        } catch (e) {}
      }
      setNotifications(defaultNotifications);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('localNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Megaphone size={14} />;
      case 'attendance':
        return <Calendar size={14} />;
      case 'task':
        return <CheckSquare size={14} />;
      case 'student_update':
        return <Baby size={14} />;
      case 'system_alert':
        return <AlertCircle size={14} />;
      default:
        return <Megaphone size={14} />;
    }
  };

  const handleLogout = () => {
    logout();
    info('Logged Out', 'You have been successfully logged out.');
    navigate('/', { replace: true });
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      success('Notifications Sync', 'All alerts marked as read.');
    } catch (err) {
      console.warn("Failed to mark all read via API. Falling back to local state.", err);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      success('Notifications Sync', 'All alerts marked as read (Offline).');
    }
  };

  const handleDismissNotification = async (id, e) => {
    e.stopPropagation();
    try {
      if (id.length > 8) {
        await notificationAPI.markAsRead(id);
      }
    } catch (err) {
      console.warn("Failed to mark notification read on API.", err);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getMenuItems = () => {
    if (activeRole === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Teachers', path: '/admin/teachers', icon: Users },
        { name: 'Students', path: '/admin/students', icon: Baby },
        { name: 'Manage Users', path: '/admin/users', icon: Users },
        { name: 'Staff Attendance', path: '/admin/attendance', icon: Calendar },
        { name: 'Task Board', path: '/admin/tasks', icon: CheckSquare },
        { name: 'Duty Roster', path: '/admin/roster', icon: Clock },
        { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
        { name: 'Settings', path: '/settings', icon: Settings }
      ];
    } else if (activeRole === 'teacher') {
      return [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'My Class', path: '/teacher/class', icon: Users },
        { name: 'Attendance', path: '/teacher/attendance', icon: Calendar },
        { name: 'Daily Routine Log', path: '/teacher/routinelog', icon: FileText },
        { name: 'My Tasks', path: '/teacher/tasks', icon: CheckSquare },
        { name: 'Student Notes', path: '/teacher/notes', icon: BookOpen },
        { name: 'Announcements', path: '/teacher/announcements', icon: Megaphone },
        { name: 'Profile', path: '/teacher/profile', icon: Settings }
      ];
    } else {
      // Parent
      return [
        { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
        { name: 'My Child', path: '/parent/child', icon: Baby },
        { name: 'Daily Updates', path: '/parent/updates', icon: Activity },
        { name: 'Activity Timeline', path: '/parent/timeline', icon: Clock },
        { name: 'Teacher Notes', path: '/parent/notes', icon: FileText },
        { name: 'Announcements', path: '/parent/announcements', icon: Megaphone },
        { name: 'Messages', path: '/parent/messages', icon: MessageSquare },
        { name: 'Profile', path: '/parent/profile', icon: Settings }
      ];
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('firstcry');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    return <Sparkles size={20} />;
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light Theme';
    if (theme === 'dark') return 'Dark Theme';
    return 'FirstCry Theme';
  };

  const menuItems = getMenuItems();

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => location.pathname === item.path);
    return activeItem ? activeItem.name : 'Intellitots Portal';
  };

  const getRoleBadgeColor = () => {
    if (activeRole === 'admin') return 'rgba(139, 92, 246, 0.15)';
    if (activeRole === 'teacher') return 'rgba(236, 72, 153, 0.15)';
    return 'rgba(59, 130, 246, 0.15)';
  };

  const getRoleLabel = () => {
    if (activeRole === 'admin') return 'Administrator';
    if (activeRole === 'teacher') return 'Class Teacher';
    return 'Parent Account';
  };

  const getUserInitials = () => {
    const name = getUserName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (user && user.name) return user.name;
    const userStr = localStorage.getItem('activeUser');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) return u.name;
      } catch (e) {}
    }
    if (activeRole === 'admin') return 'Admin Deshmukh';
    if (activeRole === 'teacher') return 'Aanya Sharma';
    return 'Sanjay Patel';
  };

  // Get dynamic profile data details
  const getProfileDetails = () => {
    const userStr = localStorage.getItem('activeUser');
    let details = {
      name: getUserName(),
      email: 'user@intellitots.com',
      role: getRoleLabel(),
      phone: '+91 98765 43210'
    };

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) details.email = u.email;
        if (u.phone) details.phone = u.phone;
      } catch (e) {}
    }

    if (user) {
      if (user.email) details.email = user.email;
      if (user.phone) details.phone = user.phone;
    }

    if (activeRole === 'admin') {
      details.adminDesignation = 'Head Administrator';
      details.centreInfo = 'Pune East';
    } else if (activeRole === 'teacher') {
      let teacherRegNo = '26EMP1001';
      let employeeId = '26EMP0001';
      let assignedClass = 'Playgroup A';

      if (user && user.teacher) {
        teacherRegNo = user.teacher.teacherRegNo || '26EMP1001';
        employeeId = user.teacher.employeeId || '26EMP0001';
        assignedClass = user.teacher.classroom ? user.teacher.classroom.name : 'Playgroup A';
      } else {
        const match = mockTeachers.find(t => t.email.toLowerCase() === details.email.toLowerCase());
        if (match) {
          teacherRegNo = match.teacherRegNo;
          employeeId = match.employeeId;
          assignedClass = match.assignedClass;
        }
      }
      details.teacherRegNo = teacherRegNo;
      details.employeeId = employeeId;
      details.assignedClass = assignedClass;
    } else {
      // Parent
      let childName = 'Aarav Patel';
      let admissionNo = '261FC10001';
      let studentRegNo = 'FCI260001001';
      let assignedTeacher = 'Prithika Sharma';

      if (user && user.parent && user.parent.students && user.parent.students.length > 0) {
        const firstChild = user.parent.students[0];
        childName = firstChild.name;
        admissionNo = firstChild.admissionNo || '261FC10001';
        studentRegNo = firstChild.studentRegNo || 'FCI260001001';
        assignedTeacher = firstChild.classroom && firstChild.classroom.teachers && firstChild.classroom.teachers.length > 0
          ? firstChild.classroom.teachers[0].name
          : 'Prithika Sharma';
      } else {
        const match = mockChildren.find(c => c.parentName.toLowerCase() === details.name.toLowerCase());
        if (match) {
          childName = match.name;
          admissionNo = match.admissionNo;
          studentRegNo = match.studentRegNo;
          const mt = mockTeachers.find(t => t.assignedClass === match.assignedClass);
          assignedTeacher = mt ? mt.name : 'Prithika Sharma';
        }
      }
      details.childName = childName;
      details.admissionNo = admissionNo;
      details.studentRegNo = studentRegNo;
      details.assignedTeacher = assignedTeacher;
    }

    return details;
  };

  const profile = getProfileDetails();

  return (
    <div className="app-layout">
      {/* Background Orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Sidebar */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-img">FC</div>
          <span className="sidebar-brand-name">FC Intellitots</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={item.name}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span className="sidebar-link-text">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}>
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <span className="sidebar-link-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Sidebar"
            >
              <ChevronLeft size={20} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getPageTitle()}
            </h1>
            <span className={isOffline ? "offline-badge-glow" : "online-badge-glow"} style={{
              marginLeft: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isOffline ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: isOffline ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              color: isOffline ? '#f59e0b' : '#10b981',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: isOffline ? '0 0 10px rgba(245, 158, 11, 0.2)' : '0 0 10px rgba(16, 185, 129, 0.2)'
            }}>
              <span className={isOffline ? "offline-dot" : "online-dot"} style={{
                width: '6px',
                height: '6px',
                background: isOffline ? '#f59e0b' : '#10b981',
                borderRadius: '50%',
                display: 'inline-block'
              }}></span>
              {isOffline ? 'Offline Fallback' : 'Online'}
            </span>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="header-search">
              <Search size={16} />
              <input type="text" placeholder="Search records..." />
            </div>

            {/* Theme Toggle */}
            <button 
              className="header-action-btn"
              onClick={toggleTheme}
              title={`Switch Theme (Current: ${getThemeLabel()})`}
            >
              {getThemeIcon()}
            </button>

            {/* Notification bell */}
            <div className="dropdown-wrapper" ref={notificationRef}>
              <button 
                className="header-action-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="btn-badge">{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="header-dropdown-panel"
                    initial={{ opacity: 0, scale: 0.95, y: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="dropdown-header-bar">
                      <h4>Notifications</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="dropdown-action-btn" onClick={handleMarkAllRead}>Mark all read</button>
                        <button style={{ color: 'var(--text-tertiary)', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}><X size={16} /></button>
                      </div>
                    </div>

                    <div className="notification-list-panel">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`notification-row-item ${n.read ? '' : 'unread'}`}
                          onClick={() => {
                            setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="notification-row-icon">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="notification-row-content">
                            <h5 className="notification-row-title">{n.title}</h5>
                            <p className="notification-row-desc">{n.desc}</p>
                            <span className="notification-row-time">{n.time}</span>
                          </div>
                          <button 
                            className="notification-row-close"
                            onClick={(e) => handleDismissNotification(n.id, e)}
                            title="Dismiss Alert"
                            style={{ background: 'transparent', border: 'none' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div style={{ 
                          textAlign: 'center', 
                          color: 'var(--text-secondary)', 
                          padding: '40px 20px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '10px' 
                        }}>
                          <span style={{ fontSize: '2rem' }}>🎉</span>
                          <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>You're all caught up!</h5>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>No new notifications.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="dropdown-wrapper" ref={profileRef}>
              <div 
                className="user-profile-menu"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                style={{ cursor: 'pointer' }}
                title="Profile Menu"
              >
                <div className="profile-avatar" style={{ background: getRoleBadgeColor() }}>{getUserInitials()}</div>
                <div className="profile-info">
                  <span className="profile-name">{getUserName()}</span>
                  <span className="profile-role">{getRoleLabel()}</span>
                </div>
              </div>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div 
                    className="profile-dropdown-panel"
                    initial={{ opacity: 0, scale: 0.95, y: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar" style={{ background: getRoleBadgeColor() }}>{getUserInitials()}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h4 className="profile-dropdown-name">{profile.name}</h4>
                        <span className="profile-dropdown-role">{profile.role}</span>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.7rem', 
                          fontWeight: 600, 
                          color: activeRole === 'admin' ? 'var(--success)' : 'var(--warning)', 
                          marginTop: '4px',
                          background: activeRole === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: activeRole === 'admin' ? 'var(--success)' : 'var(--warning)',
                            display: 'inline-block'
                          }}></span>
                          {activeRole === 'admin' ? 'Online' : 'Active Today'}
                        </div>
                      </div>
                    </div>

                    <div className="profile-details-grid">
                      <div className="profile-detail-row">
                        <span className="profile-detail-label">Email</span>
                        <span className="profile-detail-value" title={profile.email}>{profile.email}</span>
                      </div>
                      <div className="profile-detail-row">
                        <span className="profile-detail-label">Phone</span>
                        <span className="profile-detail-value">{profile.phone}</span>
                      </div>
                      
                      {activeRole === 'admin' && (
                        <>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Designation</span>
                            <span className="profile-detail-value">{profile.adminDesignation}</span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Centre</span>
                            <span className="profile-detail-value">{profile.centreInfo}</span>
                          </div>
                        </>
                      )}

                      {activeRole === 'teacher' && (
                        <>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Reg No</span>
                            <span className="profile-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {profile.teacherRegNo}
                              <button onClick={() => { navigator.clipboard.writeText(profile.teacherRegNo); success('Copied successfully'); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }} title="Copy Registration Number">📋</button>
                            </span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Employee ID</span>
                            <span className="profile-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {profile.employeeId}
                              <button onClick={() => { navigator.clipboard.writeText(profile.employeeId); success('Copied successfully'); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }} title="Copy Employee ID">📋</button>
                            </span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Class</span>
                            <span className="profile-detail-value">{profile.assignedClass}</span>
                          </div>
                        </>
                      )}

                      {activeRole === 'parent' && (
                        <>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Child Name</span>
                            <span className="profile-detail-value">{profile.childName}</span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Admission No</span>
                            <span className="profile-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {profile.admissionNo}
                              <button onClick={() => { navigator.clipboard.writeText(profile.admissionNo); success('Copied successfully'); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }} title="Copy Admission Number">📋</button>
                            </span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Reg No</span>
                            <span className="profile-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {profile.studentRegNo}
                              <button onClick={() => { navigator.clipboard.writeText(profile.studentRegNo); success('Copied successfully'); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }} title="Copy Registration Number">📋</button>
                            </span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Teacher</span>
                            <span className="profile-detail-value">{profile.assignedTeacher}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="profile-actions-column">
                      <button 
                        className="profile-action-btn"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/profile');
                        }}
                      >
                        <User size={16} /> View Profile
                      </button>
                      <button 
                        className="profile-action-btn"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          if (activeRole === 'admin') navigate('/settings');
                          else if (activeRole === 'teacher') navigate('/teacher/profile');
                          else navigate('/parent/profile');
                        }}
                      >
                        <Settings size={16} /> Settings
                      </button>
                      <button 
                        className="profile-action-btn logout-btn"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-scroll-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
