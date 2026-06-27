/* src/pages/settings/Settings.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { User, Bell, Palette, Save } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import '../../styles/pages.css';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { success, error } = useNotifications();
  const { updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const getInitialProfile = () => {
    const userStr = localStorage.getItem('activeUser');
    const role = localStorage.getItem('activeRole') || 'parent';
    let defaultName = 'Active User';
    let defaultEmail = 'user@intellitots.com';
    let defaultPhone = '+91 98765 43210';

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) defaultName = u.name;
        if (u.email) defaultEmail = u.email;
        if (u.phone) defaultPhone = u.phone;
      } catch (e) {}
    } else {
      if (role === 'admin') {
        defaultName = 'Admin Deshmukh';
        defaultEmail = 'vaitlabinnu@gmail.com';
      } else if (role === 'teacher') {
        defaultName = 'Prithika Sharma';
        defaultEmail = 'prithika@gmail.com';
      } else {
        defaultName = 'Neha Patel';
        defaultEmail = 'neha@gmail.com';
      }
    }

    if (defaultName.toLowerCase().includes('prithika') || defaultName.toLowerCase().includes('aanya')) {
      defaultPhone = '+91 98123 45678';
    }

    return { name: defaultName, email: defaultEmail, phone: defaultPhone };
  };

  const initialProfile = getInitialProfile();

  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [identifiers, setIdentifiers] = useState({ teacherRegNo: '', employeeId: '', studentRegNo: '', admissionNo: '' });
  const [userRole, setUserRole] = useState(localStorage.getItem('activeRole') || 'parent');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [chatAlerts, setChatAlerts] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data && res.data.success) {
          const apiUser = res.data.data.user;
          setName(apiUser.name || '');
          setEmail(apiUser.email || '');
          setPhone(apiUser.phone || '');
          setUserRole(apiUser.role || localStorage.getItem('activeRole') || 'parent');
          if (apiUser.teacher) {
            setIdentifiers(prev => ({
              ...prev,
              teacherRegNo: apiUser.teacher.teacherRegNo || '',
              employeeId: apiUser.teacher.employeeId || ''
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user profile from API. Using local state fallback.", err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(name, phone);
      if (res && res.success) {
        success('Settings Saved', 'Profile changes updated successfully.');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      error('Update Failed', err.response?.data?.message || 'Failed to update profile settings.');
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    success('Notification Rules Saved', 'System preferences synchronized.');
  };

  const themeCards = [
    {
      id: 'light',
      name: 'Light Theme',
      bgPreview: '#f5f3ff',
      colors: ['#8b5cf6', '#ec4899', '#3b82f6']
    },
    {
      id: 'dark',
      name: 'Dark Theme',
      bgPreview: '#090514',
      colors: ['#a78bfa', '#f472b6', '#60a5fa']
    },
    {
      id: 'firstcry',
      name: 'FirstCry Theme',
      bgPreview: '#fff5eb',
      colors: ['#ff7e36', '#ffc229', '#00b4d8']
    }
  ];

  return (
    <div className="page-container">
      <div className="settings-layout">
        <div className="settings-nav">
          <button
            className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={18} /> Profile Settings
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Palette size={18} /> Theme Settings
          </button>
        </div>

        <div style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <GlassCard>
                  <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
                    <span>Edit Profile Settings</span>
                  </div>

                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="login-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="input-glass"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="login-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        className="input-glass"
                        value={email}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="login-form-group">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        className="input-glass"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    {/* Teacher-only ID fields (read-only) */}
                    {userRole === 'teacher' && (identifiers.teacherRegNo || identifiers.employeeId) && (
                      <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Staff Identifiers (Read Only)</p>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          {identifiers.teacherRegNo && (
                            <div>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Registration No</p>
                              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{identifiers.teacherRegNo}</p>
                            </div>
                          )}
                          {identifiers.employeeId && (
                            <div>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Employee ID</p>
                              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{identifiers.employeeId}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      className="btn-premium"
                      style={{ width: 'fit-content', alignSelf: 'flex-end', marginTop: '10px' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save size={16} /> Save Changes
                    </motion.button>
                  </form>
                </GlassCard>
              )}

              {activeTab === 'notifications' && (
                <GlassCard>
                  <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
                    <span>Configure Notifications</span>
                  </div>

                  <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="routine-toggle-group">
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email Alerts</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Receive daily reports and attendance digests.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={emailAlerts}
                          onChange={() => setEmailAlerts(!emailAlerts)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="routine-toggle-group">
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>SMS alerts</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Receive emergency alerts on phone.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={smsAlerts}
                          onChange={() => setSmsAlerts(!smsAlerts)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="routine-toggle-group">
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Parent Chat notifications</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Alert on instant parent-teacher query rooms.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={chatAlerts}
                          onChange={() => setChatAlerts(!chatAlerts)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <motion.button
                      type="submit"
                      className="btn-premium"
                      style={{ width: 'fit-content', alignSelf: 'flex-end', marginTop: '10px' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save size={16} /> Save Settings
                    </motion.button>
                  </form>
                </GlassCard>
              )}

              {activeTab === 'theme' && (
                <GlassCard>
                  <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
                    <span>Configure Theme Palette</span>
                  </div>

                  <div className="theme-options-grid">
                    {themeCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          setTheme(card.id);
                          success('Theme Switch', `Applied ${card.name}`);
                        }}
                        className={`theme-card ${theme === card.id ? 'active' : ''}`}
                      >
                        <div 
                          className="theme-color-preview"
                          style={{
                            background: card.bgPreview,
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {card.colors.map((c, i) => (
                            <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }}></span>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{card.name}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
