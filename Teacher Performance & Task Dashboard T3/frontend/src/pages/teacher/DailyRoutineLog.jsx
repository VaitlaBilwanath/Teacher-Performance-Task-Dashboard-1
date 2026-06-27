/* src/pages/teacher/DailyRoutineLog.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Coffee, Droplet, Smile, Moon, Send, ChevronLeft, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { teacherAPI } from '../../services/api';
import '../../styles/pages.css';

const DailyRoutineLog = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  
  // API Integration States
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedKidId, setSelectedKidId] = useState('');

  // Logs Form State
  const [breakfast, setBreakfast] = useState('full');
  const [lunch, setLunch] = useState('full');
  const [snacks, setSnacks] = useState('full');
  const [waterCups, setWaterCups] = useState(4);
  const [napTime, setNapTime] = useState('1.5 Hours');
  const [pottyCheck, setPottyCheck] = useState(true);
  const [activityNotes, setActivityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const resClass = await teacherAPI.getMyClass();
      if (resClass.data && resClass.data.success && resClass.data.data.length > 0) {
        const mapped = resClass.data.data.map(s => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar || s.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
          age: s.age,
          parentName: s.parent ? s.parent.user.name : 'Parent'
        }));
        setChildren(mapped);
        setSelectedKidId(mapped[0].id);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (children.length > 0 && !selectedKidId) {
      setSelectedKidId(children[0].id);
    }
  }, [children, selectedKidId]);

  const activeKid = children.find(k => k.id === selectedKidId) || children[0] || { name: 'Student', parentName: 'Parent' };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKidId) {
      error('No Student Selected', 'Please select a student before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await teacherAPI.postDailyRoutine({
        studentId: selectedKidId,
        breakfast,
        lunch,
        snacks,
        waterCups: Number(waterCups),
        napTime,
        pottyCheck,
        activityNotes
      });
      success('Routine Log Saved', `Daily routine for ${activeKid.name} saved. Parent has been notified.`);
      setActivityNotes('');
    } catch (err) {
      console.error('Failed to save daily routine:', err);
      const errMsg = err?.response?.data?.message || 'Unable to save routine log. Please try again.';
      error('Save Failed', errMsg);
    } finally {
      setIsSubmitting(false);
    }
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
          <button className="primary-btn" onClick={() => window.location.reload()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/teacher/dashboard')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <ChevronLeft size={16} /> Back to Teacher Dashboard
        </button>
      </div>

      <div className="routine-grid">
        {/* Child Selector */}
        <GlassCard>
          <div className="chart-card-title">
            <span>Select Active Student</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {children.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No students found in your class.</p>
            ) : children.map((kid) => (
              <div 
                key={kid.id}
                onClick={() => setSelectedKidId(kid.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: selectedKidId === kid.id ? 'var(--primary)' : 'var(--card-border)',
                  background: selectedKidId === kid.id ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.02) 100%)' : 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div className="profile-avatar" style={{ width: '30px', height: '30px' }}>
                  {kid.avatar}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{kid.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{kid.age}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Entry Form */}
        <GlassCard>
          <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '12px', marginBottom: '15px' }}>
            <span>Daily Routine Log for <strong>{activeKid.name}</strong></span>
          </div>

          <form onSubmit={handleLogSubmit} className="routine-form">
            <div className="routine-input-row">
              <div className="login-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coffee size={14} style={{ color: 'var(--primary)' }} /> Breakfast intake
                </label>
                <select 
                  className="input-glass" 
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                >
                  <option value="full">Full Eaten</option>
                  <option value="partial">Half Eaten</option>
                  <option value="none">Did Not Eat</option>
                </select>
              </div>
              <div className="login-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coffee size={14} style={{ color: 'var(--secondary)' }} /> Lunch intake
                </label>
                <select 
                  className="input-glass"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                >
                  <option value="full">Full Eaten</option>
                  <option value="partial">Half Eaten</option>
                  <option value="none">Did Not Eat</option>
                </select>
              </div>
            </div>

            <div className="routine-input-row">
              <div className="login-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coffee size={14} style={{ color: 'var(--accent)' }} /> Afternoon Snacks
                </label>
                <select 
                  className="input-glass"
                  value={snacks}
                  onChange={(e) => setSnacks(e.target.value)}
                >
                  <option value="full">Full Eaten</option>
                  <option value="partial">Half Eaten</option>
                  <option value="none">Did Not Eat</option>
                </select>
              </div>
              <div className="login-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplet size={14} style={{ color: 'var(--accent)' }} /> Water Intake
                </label>
                <select 
                  className="input-glass"
                  value={waterCups}
                  onChange={(e) => setWaterCups(Number(e.target.value))}
                >
                  <option value="2">2 Cups (500ml)</option>
                  <option value="4">4 Cups (1 Litre)</option>
                  <option value="6">6 Cups (1.5 Litres)</option>
                  <option value="8">8 Cups (2 Litres)</option>
                </select>
              </div>
            </div>

            <div className="routine-input-row">
              <div className="login-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Moon size={14} style={{ color: 'var(--primary)' }} /> Nap Duration
                </label>
                <select 
                  className="input-glass"
                  value={napTime}
                  onChange={(e) => setNapTime(e.target.value)}
                >
                  <option value="30 Mins">30 Minutes</option>
                  <option value="1 Hour">1 Hour</option>
                  <option value="1.5 Hours">1.5 Hours</option>
                  <option value="2 Hours">2 Hours</option>
                  <option value="No Nap">Did Not Nap</option>
                </select>
              </div>

              <div className="login-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smile size={14} style={{ color: 'var(--success)' }} /> Potty Check
                </span>
                <div className="routine-toggle-group">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {pottyCheck ? 'Completed Potty Check' : 'Pending Check'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={pottyCheck}
                      onChange={() => setPottyCheck(!pottyCheck)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="login-form-group">
              <label>Daily Activity & Behavior Notes</label>
              <textarea
                className="input-glass"
                rows={3}
                placeholder="Enter logs details..."
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <motion.button 
              type="submit"
              className="btn-premium"
              style={{ width: 'fit-content', alignSelf: 'flex-end', opacity: isSubmitting ? 0.7 : 1 }}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              disabled={isSubmitting}
            >
              <Send size={16} />
              {isSubmitting ? 'Saving...' : 'Save & Send Report'}
            </motion.button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default DailyRoutineLog;
