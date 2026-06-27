/* src/pages/admin/DutyRoster.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, Edit3, X, AlertCircle, RefreshCw, Users } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { adminAPI } from '../../services/api';
import '../../styles/pages.css';

const DutyRoster = () => {
  const { success } = useNotifications();
  const [viewMode, setViewMode] = useState('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRosterIndex, setSelectedRosterIndex] = useState(null);

  const [roster, setRoster] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const [rosterRes, teachersRes] = await Promise.all([
        adminAPI.getDutyRoster(1, 100),
        adminAPI.getTeachers()
      ]);
      setRoster(rosterRes.data?.data || []);
      setTeachers(teachersRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load roster:', err);
      setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReassignModal = (index) => {
    setSelectedRosterIndex(index);
    setIsModalOpen(true);
  };

  const handleReassign = (teacherId) => {
    const updatedRoster = [...roster];
    updatedRoster[selectedRosterIndex].teacherId = teacherId;
    
    const newTeacher = teachers.find(t => t.id === teacherId);
    if (newTeacher) {
      updatedRoster[selectedRosterIndex].teacher = newTeacher;
    }
    
    setRoster(updatedRoster);
    setIsModalOpen(false);

    success('Roster Updated', `Assigned ${newTeacher?.user?.name || 'Teacher'} to ${updatedRoster[selectedRosterIndex].room}.`);
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GlassCard style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Connection Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>{errorState}</p>
          <button className="primary-btn" onClick={loadData} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} />
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div className="page-container">
        <GlassCard style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
          <Users size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 15px', display: 'block' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>No roster records found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>There are currently no active duty rosters in the database.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="roster-header-bar">
        <div className="login-tabs" style={{ marginBottom: 0 }}>
          {['daily'].map((mode) => (
            <button
              key={mode}
              className={`login-tab-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
              style={{ minWidth: '100px' }}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Total Active Shifts: <strong>{roster.length} Today</strong>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <div className="roster-grid">
            {roster.map((item, index) => {
              const teacher = item.teacher || {};
              const user = teacher.user || {};
              
              return (
                <GlassCard key={item.id || index} delay={index * 0.05} className="roster-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge info">{item.className || 'General'}</span>
                    <button 
                      onClick={() => openReassignModal(index)}
                      style={{ color: 'var(--primary)', padding: '4px', borderRadius: '4px' }}
                      title="Reassign Teacher"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                    <div className="profile-avatar" style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', fontSize: '1rem' }}>
                      {teacher.avatar || user.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name || 'Unknown Teacher'}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user.email || ''}</span>
                    </div>
                  </div>

                  <div className="roster-card-row">
                    <span><Clock size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Shift Time</span>
                    <span>{item.shift}</span>
                  </div>

                  <div className="roster-card-row">
                    <span><MapPin size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Room Number</span>
                    <span>{item.room}</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Reassign Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reassign Teacher</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                Select an available teacher to reassign to <strong>{roster[selectedRosterIndex]?.room}</strong> for the <strong>{roster[selectedRosterIndex]?.shift}</strong> shift.
              </p>
              
              <div className="roster-teacher-select-list">
                {teachers.map((t) => (
                  <div 
                    key={t.id}
                    className="roster-teacher-option"
                    onClick={() => handleReassign(t.id)}
                    style={{ 
                      padding: '12px 15px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      border: '1px solid var(--card-border)',
                      background: roster[selectedRosterIndex]?.teacherId === t.id ? 'var(--card-bg)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="profile-avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                      {t.avatar || t.user?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.user?.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.employeeId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutyRoster;
