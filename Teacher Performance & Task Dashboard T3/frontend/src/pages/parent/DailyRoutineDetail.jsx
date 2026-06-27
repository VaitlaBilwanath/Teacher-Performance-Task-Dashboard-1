/* src/pages/parent/DailyRoutineDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Coffee, Moon, Droplet, Smile, Image as ImageIcon, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import CircularProgress from '../../components/CircularProgress';
import { mockChildren } from '../../data/mockData';
import { parentAPI } from '../../services/api';
import '../../styles/pages.css';

const DailyRoutineDetail = () => {
  const navigate = useNavigate();

  const activeRole = localStorage.getItem('activeRole');
  const activeUserStr = localStorage.getItem('activeUser');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;

  // API Integration States
  const [dbChild, setDbChild] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const resChild = await parentAPI.getMyChild();
      if (resChild.data && resChild.data.success) {
        setDbChild(resChild.data.data);
      }
      const resRoutines = await parentAPI.getDailyUpdates();
      if (resRoutines.data && resRoutines.data.success) {
        setRoutines(resRoutines.data.data);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        console.warn("Failed to fetch daily routine logs via API", err);
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

  const child = dbChild ? {
    id: dbChild.id,
    name: dbChild.name,
    avatar: dbChild.avatar || dbChild.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
    photos: dbChild.photos && dbChild.photos.length > 0 ? dbChild.photos : [
      { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&fit=crop', caption: 'Art Class - Finger Painting' }
    ],
    timeline: dbChild.timeline && dbChild.timeline.length > 0 ? dbChild.timeline : [
      { time: '08:30 AM', event: 'Arrival', desc: 'Checked in by parent.' }
    ]
  } : (activeRole === 'parent' && activeUser 
    ? (mockChildren.find(k => k.parentName === activeUser.name) || mockChildren[0])
    : mockChildren[0]);

  const latestRoutine = routines.length > 0 ? routines[0] : null;

  const getMealPercent = (routine) => {
    if (!routine) return 85;
    const map = { full: 100, partial: 50, none: 0 };
    const b = map[(routine.breakfast || 'full').toLowerCase()] || 0;
    const l = map[(routine.lunch || 'full').toLowerCase()] || 0;
    const s = map[(routine.snacks || 'full').toLowerCase()] || 0;
    return Math.round((b + l + s) / 3);
  };
  const getNapPercent = (routine) => {
    if (!routine) return 100;
    const nap = routine.napTime || '';
    if (nap.toLowerCase().includes('no') || nap.toLowerCase().includes('did not')) return 0;
    return 100;
  };
  const getWaterPercent = (routine) => {
    if (!routine) return 75;
    const cups = routine.waterCups !== undefined ? routine.waterCups : 4;
    return Math.min(Math.round((cups / 8) * 100), 100);
  };

  const mealsPct = getMealPercent(latestRoutine);
  const napPct = getNapPercent(latestRoutine);
  const waterPct = getWaterPercent(latestRoutine);
  const activitiesPct = latestRoutine ? 100 : 90;

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
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <ChevronLeft size={16} /> Back to Parent Dashboard
        </button>
      </div>

      {/* Progress Rings summary card */}
      <GlassCard delay={0.1} style={{ marginBottom: '20px' }}>
        <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
          <span>Daily Completion Ring Metrics: <strong>{child.name}</strong></span>
          <span className="badge success">Today</span>
        </div>

        <div className="progress-rings-row">
          <CircularProgress percent={mealsPct} size={110} color="var(--primary)" label="Meals Eaten" />
          <CircularProgress percent={napPct} size={110} color="var(--secondary)" label="Nap Sleep" />
          <CircularProgress percent={waterPct} size={110} color="var(--accent)" label="Hydration" />
          <CircularProgress percent={activitiesPct} size={110} color="var(--success)" label="Activities" />
        </div>
      </GlassCard>

      {/* Grid of details */}
      <div className="routine-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard delay={0.2}>
            <div className="chart-card-title">
              <span>Meals & Hydration Logs</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Coffee size={18} style={{ color: 'var(--primary)', marginTop: '3px' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Breakfast intake</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {latestRoutine 
                      ? `Intake: ${latestRoutine.breakfast.toUpperCase()} eaten. ${latestRoutine.activityNotes || ''}`
                      : 'Ate 1 bowl of vegetable oats. Drank warm milk. (100% Eaten)'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Coffee size={18} style={{ color: 'var(--secondary)', marginTop: '3px' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Lunch intake</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {latestRoutine 
                      ? `Intake: ${latestRoutine.lunch.toUpperCase()} eaten. Snacks: ${latestRoutine.snacks.toUpperCase()} eaten.`
                      : 'Finished 80% of steam rice and lintel soup. Refused salad carrots.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Droplet size={18} style={{ color: 'var(--accent)', marginTop: '3px' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Water Intake Intervals</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {latestRoutine 
                      ? `Total: ${latestRoutine.waterCups} Cups registered today.`
                      : 'Log checks: 10:00 AM, 12:30 PM, 2:30 PM, 3:45 PM. (Total: 4 Cups / 1 Litre)'}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard delay={0.3}>
            <div className="chart-card-title">
              <span>Behavior & Sleep Log</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Moon size={18} style={{ color: 'var(--primary)', marginTop: '3px' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sleep Time and Quality</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {latestRoutine 
                      ? `Nap duration: ${latestRoutine.napTime}.`
                      : 'Nap took place in Room 102. Fell asleep within 10 minutes. Slept 1.5 Hours total.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Smile size={18} style={{ color: 'var(--success)', marginTop: '3px' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Potty & Hygiene Checks</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {latestRoutine 
                      ? `Potty Check: ${latestRoutine.pottyCheck ? 'Completed check successfully.' : 'Pending check.'}`
                      : 'Checked twice at 10:30 AM and 2:15 PM. Diaper changed once. Stools normal.'}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard delay={0.4}>
            <div className="chart-card-title">
              <span>Classroom Activities Log</span>
            </div>
            
            <div className="timeline">
              {child.timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-badge"></div>
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-title">{item.event}</div>
                  <div className="timeline-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.5}>
            <div className="chart-card-title" style={{ marginBottom: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={18} style={{ color: 'var(--primary)' }} />
                Day Photo Gallery
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {child.photos.map((ph, idx) => (
                <div 
                  key={idx}
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    height: '110px',
                    position: 'relative',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  <img 
                    src={ph.url} 
                    alt={ph.caption} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', textAlign: 'center' }}>
                    {ph.caption.split(' - ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DailyRoutineDetail;
