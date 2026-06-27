/* src/pages/parent/ActivityTimeline.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Activity, Coffee, BookOpen, Moon, Award, Heart, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren } from '../../data/mockData';
import { parentAPI } from '../../services/api';
import '../../styles/pages.css';

const ActivityTimeline = () => {
  const navigate = useNavigate();

  const [dbChild, setDbChild] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const fetchChildData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const resChild = await parentAPI.getMyChild();
      if (resChild.data && resChild.data.success) {
        setDbChild(resChild.data.data);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        console.warn("Failed to fetch timeline via API", err);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildData();
  }, []);

  // Find active parent child
  const activeRole = localStorage.getItem('activeRole');
  const activeUserStr = localStorage.getItem('activeUser');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;

  const child = dbChild ? {
    name: dbChild.name,
    timeline: dbChild.timeline && dbChild.timeline.length > 0 ? dbChild.timeline : [
      { time: '08:30 AM', event: 'Arrival', desc: 'Checked in by parent.' }
    ]
  } : (activeRole === 'parent' && activeUser 
    ? (mockChildren.find(k => k.parentName === activeUser.name) || mockChildren[0])
    : mockChildren[0]);

  const getEventIcon = (event) => {
    const ev = event.toLowerCase();
    if (ev.includes('arrival') || ev.includes('departure')) return <Clock size={16} />;
    if (ev.includes('breakfast') || ev.includes('snacks') || ev.includes('lunch')) return <Coffee size={16} />;
    if (ev.includes('learning') || ev.includes('storytime')) return <BookOpen size={16} />;
    if (ev.includes('nap')) return <Moon size={16} />;
    if (ev.includes('play')) return <Heart size={16} />;
    return <Activity size={16} />;
  };

  const getEventColor = (event) => {
    const ev = event.toLowerCase();
    if (ev.includes('arrival') || ev.includes('departure')) return 'var(--primary)';
    if (ev.includes('breakfast') || ev.includes('snacks') || ev.includes('lunch')) return 'var(--accent)';
    if (ev.includes('learning')) return 'var(--secondary)';
    if (ev.includes('nap')) return 'var(--primary)';
    return 'var(--success)';
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
          onClick={() => navigate('/parent/dashboard')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="child-profile-grid" style={{ gridTemplateColumns: '1fr' }}>
        <GlassCard>
          <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '20px' }}>
            <span>Activity Timeline: <strong>{child.name}</strong></span>
            <span className="badge success">Today's Timeline Log</span>
          </div>

          <div style={{ position: 'relative', paddingLeft: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Vertical Line */}
            <div 
              style={{ 
                position: 'absolute', 
                left: '9px', 
                top: '10px', 
                bottom: '10px', 
                width: '2px', 
                background: 'linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)',
                opacity: 0.3 
              }}
            ></div>

            {child.timeline.map((item, index) => (
              <motion.div 
                key={index} 
                className="timeline-item-detail"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                style={{ position: 'relative' }}
              >
                {/* Bullet Orb */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-30px', 
                    top: '2px', 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    background: getEventColor(item.event),
                    border: '4px solid var(--card-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                  }}
                ></div>

                {/* Timeline Card */}
                <div 
                  style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '8px', 
                          background: `${getEventColor(item.event)}15`, 
                          color: getEventColor(item.event) 
                        }}
                      >
                        {getEventIcon(item.event)}
                      </span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{item.event}</strong>
                    </div>
                    
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        color: 'var(--primary)', 
                        background: 'rgba(139,92,246,0.1)', 
                        padding: '2px 8px', 
                        borderRadius: '6px' 
                      }}
                    >
                      {item.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ActivityTimeline;
