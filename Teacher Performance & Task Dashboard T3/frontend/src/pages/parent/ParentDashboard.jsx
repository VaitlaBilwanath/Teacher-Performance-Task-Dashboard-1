/* src/pages/parent/ParentDashboard.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Baby, Activity, Heart, ArrowRight, Bell, MessageSquare, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import CircularProgress from '../../components/CircularProgress';
import { mockChildren } from '../../data/mockData';
import { parentAPI } from '../../services/api';
import '../../styles/pages.css';

const ParentDashboard = () => {
  const navigate = useNavigate();

  // API Integration States
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const res = await parentAPI.getDashboard();
      if (res.data && res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        console.warn("Failed to fetch parent dashboard data from API", err);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const child = dashboardData?.child ? {
    id: dashboardData.child.id,
    name: dashboardData.child.name,
    parentName: dashboardData.child.parentName || 'Parent',
    avatar: dashboardData.child.avatar || dashboardData.child.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    age: dashboardData.child.age,
    assignedClass: dashboardData.child.assignedClass,
    mood: dashboardData.child.mood
  } : mockChildren[0];

  const teacher = dashboardData?.child?.classroomTeacher;

  const announcements = dashboardData?.announcements || [];

  const getMealPercent = (routine) => {
    if (!routine) return 85; // fallback
    const map = { full: 100, partial: 50, none: 0 };
    const b = map[(routine.breakfast || 'full').toLowerCase()] || 0;
    const l = map[(routine.lunch || 'full').toLowerCase()] || 0;
    const s = map[(routine.snacks || 'full').toLowerCase()] || 0;
    return Math.round((b + l + s) / 3);
  };
  const getNapPercent = (routine) => {
    if (!routine) return 100; // fallback
    const nap = routine.napTime || '';
    if (nap.toLowerCase().includes('no') || nap.toLowerCase().includes('did not')) return 0;
    return 100;
  };
  const getWaterPercent = (routine) => {
    if (!routine) return 75; // fallback
    const cups = routine.waterCups !== undefined ? routine.waterCups : 4;
    return Math.min(Math.round((cups / 8) * 100), 100);
  };

  const mealsPct = getMealPercent(dashboardData?.latestRoutine);
  const napPct = getNapPercent(dashboardData?.latestRoutine);
  const waterPct = getWaterPercent(dashboardData?.latestRoutine);

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
      {/* Welcome banner */}
      <GlassCard delay={0.1} style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.05) 100%)' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Welcome back, {child.parentName}!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
          Here is a summary of <strong>{child.name}'s</strong> daycare activities at FC Intellitots today.
        </p>
      </GlassCard>

      {/* Child Metrics Quick Ring */}
      <div className="routine-grid">
        {/* Left: Quick indicators rings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard delay={0.2}>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span>Today's Log Completion</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '15px' }}>
              <CircularProgress percent={mealsPct} size={90} color="var(--primary)" label="Meals" />
              <CircularProgress percent={napPct} size={90} color="var(--secondary)" label="Nap Sleep" />
              <CircularProgress percent={waterPct} size={90} color="var(--accent)" label="Water" />
            </div>
          </GlassCard>

          {/* Profile Quick Links */}
          <GlassCard delay={0.3}>
            <div className="chart-card-title">
              <span>Quick Shortcuts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={() => navigate('/parent/child')}
                className="btn-premium"
                style={{ width: '100%', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
              >
                <Baby size={16} /> View Profile & Milestones <ArrowRight size={14} />
              </button>
              <button 
                onClick={() => navigate('/parent/updates')}
                className="btn-glass"
                style={{ width: '100%', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
              >
                <Activity size={16} /> View Detailed Log Timeline <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right: Notices & Teacher Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Notices */}
          <GlassCard delay={0.4}>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={18} style={{ color: 'var(--primary)' }} /> Alerts & Announcements
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map((ann, idx) => (
                <div key={ann.id || idx} style={{ padding: '10px', background: ann.isUrgent ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.08)', border: ann.isUrgent ? '1px solid rgba(239,68,68,0.15)' : '1px solid var(--card-border)', borderRadius: '10px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{ann.title}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{ann.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <>
                  <div style={{ padding: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>School Sanitization drive</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Daycare closed this Saturday for advanced sanitization auditing.</p>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--card-border)', borderRadius: '10px' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Yoga prep next Monday</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Please send a soft yoga mat with kids for morning circles.</p>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* Teacher inbox communications */}
          <GlassCard delay={0.5}>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={18} style={{ color: 'var(--secondary)' }} /> Contact Teacher
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
              <div className="profile-avatar" style={{ width: '36px', height: '36px' }}>
                {teacher?.avatar || (teacher?.name ? teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AS')}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>{teacher?.name || 'Aanya Sharma'}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{teacher ? `Class Mentor • ${child.assignedClass}` : 'Class Mentor • Playgroup A'}</span>
              </div>
              <button 
                onClick={() => navigate('/parent/messages')}
                className="btn-glass"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                Chat
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
