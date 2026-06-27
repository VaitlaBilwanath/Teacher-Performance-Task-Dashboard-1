/* src/pages/parent/ChildDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Phone, Mail, Award, Smile, Frown, Sparkles, ChevronLeft, ChevronRight, ArrowRight, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren } from '../../data/mockData';
import { parentAPI, teacherAPI, adminAPI } from '../../services/api';
import '../../styles/pages.css';

const ChildDetail = () => {
  const navigate = useNavigate();
  const { success } = useNotifications();

  const { id } = useParams();
  const activeRole = localStorage.getItem('activeRole');
  const activeUserStr = localStorage.getItem('activeUser');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;

  // API Integration States
  const [dbChild, setDbChild] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const fetchChildData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      if (activeRole === 'parent') {
        const res = await parentAPI.getMyChild(id ? { studentId: id } : {});
        if (res.data && res.data.success) {
          setDbChild(res.data.data);
        }
      } else if (activeRole === 'teacher') {
        const res = await teacherAPI.getMyClass();
        if (res.data && res.data.success) {
          const match = res.data.data.find(s => s.id === id);
          if (match) setDbChild(match);
        }
      } else if (activeRole === 'admin') {
        const res = await adminAPI.getStudents();
        if (res.data && res.data.success) {
          const match = res.data.data.find(s => s.id === id);
          if (match) setDbChild(match);
        }
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        console.warn("Failed to fetch child details via API", err);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildData();
  }, [id, activeRole]);

  const child = dbChild ? {
    id: dbChild.id,
    name: dbChild.name,
    avatar: dbChild.avatar || dbChild.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
    age: dbChild.age || '3 Years',
    assignedClass: dbChild.classroom ? dbChild.classroom.name : (dbChild.assignedClass || 'Playgroup A'),
    parentName: dbChild.parent ? dbChild.parent.user.name : (dbChild.parentName || 'Parent'),
    parentContact: dbChild.parent ? (dbChild.parent.parentContact || dbChild.parent.user.phone || '') : (dbChild.parentContact || ''),
    milestones: dbChild.milestones && dbChild.milestones.length > 0 ? dbChild.milestones : [
      { name: 'Language & Speech', progress: 75 },
      { name: 'Fine Motor Skills', progress: 75 },
      { name: 'Social Interaction', progress: 75 },
      { name: 'Cognitive Ability', progress: 75 }
    ],
    timeline: dbChild.timeline && dbChild.timeline.length > 0 ? dbChild.timeline : [
      { time: '08:30 AM', event: 'Arrival', desc: 'Checked in by parent.' }
    ],
    photos: dbChild.photos && dbChild.photos.length > 0 ? dbChild.photos : [
      { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&fit=crop', caption: 'Art Class - Finger Painting' }
    ],
    mood: dbChild.mood || 'Happy',
    studentRegNo: dbChild.studentRegNo,
    admissionNo: dbChild.admissionNo
  } : (id 
    ? (mockChildren.find(k => k.id === id) || mockChildren[0])
    : (activeRole === 'parent' && activeUser 
        ? (mockChildren.find(k => k.parentName === activeUser.name) || mockChildren[0])
        : mockChildren[0]));

  const [activeMood, setActiveMood] = useState(child.mood);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [expandedTimelineIndex, setExpandedTimelineIndex] = useState(0);
  const [teacherNotes, setTeacherNotes] = useState('Aarav has been showing excellent improvement in shape matching and cooperative play. He sharing his toys nicely with Kabir.');

  useEffect(() => {
    setActiveMood(child.mood);
  }, [child.mood]);

  useEffect(() => {
    if (dbChild?.notes && dbChild.notes.length > 0) {
      // Find the first non-milestone observation or just take the latest note
      const latestNote = dbChild.notes.find(n => !n.content.includes('Milestone metrics synchronized')) || dbChild.notes[0];
      if (latestNote) {
        setTeacherNotes(latestNote.content);
      }
    }
  }, [dbChild]);

  const handleNextPhoto = () => {
    setCarouselIndex(prev => (prev + 1) % child.photos.length);
  };

  const handlePrevPhoto = () => {
    setCarouselIndex(prev => (prev - 1 + child.photos.length) % child.photos.length);
  };

  const moodsList = [
    { name: 'Happy', emoji: '😊', desc: 'Active & smiling' },
    { name: 'Energetic', emoji: '⚡', desc: 'Extremely active' },
    { name: 'Curious', emoji: '🧐', desc: 'Exploring toys' },
    { name: 'Tired', emoji: '😴', desc: 'Needs quiet rest' },
    { name: 'Fussy', emoji: '🥺', desc: 'Slightly emotional' }
  ];

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

      <div className="child-profile-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard className="child-avatar-card">
            <div className="child-big-avatar">
              {child.avatar}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{child.name}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Age: {child.age}</p>
              <span className="badge info" style={{ marginTop: '5px' }}>{child.assignedClass}</span>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--divider)', paddingTop: '15px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{child.parentContact} ({child.parentName})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <Mail size={16} style={{ color: 'var(--secondary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>parent.comm@intellitots.com</span>
              </div>
              {(child.admissionNo || child.studentRegNo) && (
                <div style={{ marginTop: '4px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Admission Details</p>
                  {child.admissionNo && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Adm No: {child.admissionNo}
                      <button 
                        onClick={() => { navigator.clipboard.writeText(child.admissionNo); success('Copied successfully'); }} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                        title="Copy Admission Number"
                      >
                        📋
                      </button>
                    </p>
                  )}
                  {child.studentRegNo && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Reg No: {child.studentRegNo}
                      <button 
                        onClick={() => { navigator.clipboard.writeText(child.studentRegNo); success('Copied successfully'); }} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                        title="Copy Registration Number"
                      >
                        📋
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="chart-card-title">
              <span>Learning & Growth Milestones</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {child.milestones.map((ms, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{ms.name}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{ms.progress}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--divider)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div 
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${ms.progress}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="chart-card-title">
              <span>Mood Tracking</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0' }}>
              {moodsList.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    minWidth: '70px',
                    padding: '8px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: activeMood === m.name ? 'var(--primary)' : 'var(--card-border)',
                    background: activeMood === m.name ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.02)',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '1.5rem', display: 'block' }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span>Daily Timeline Tracker</span>
              <button 
                onClick={() => navigate('/parent/updates')}
                style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Detailed Logs <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {child.timeline.map((item, index) => {
                const isExpanded = expandedTimelineIndex === index;
                return (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      padding: '12px',
                      background: isExpanded ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => setExpandedTimelineIndex(isExpanded ? null : index)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.time}
                        </span>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.event}</strong>
                      </div>
                      <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-tertiary)' }} />
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: '8px' }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                        >
                          {item.desc}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="chart-card-title">
              <span>Classroom Photos & Activities</span>
            </div>
            
            <div className="carousel-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  className="carousel-slide"
                  style={{ backgroundImage: `url(${child.photos[carouselIndex].url})` }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="carousel-caption">
                    {child.photos[carouselIndex].caption}
                  </div>
                </motion.div>
              </AnimatePresence>

              <button className="carousel-btn prev" onClick={handlePrevPhoto}>
                <ChevronLeft size={16} />
              </button>
              <button className="carousel-btn next" onClick={handleNextPhoto}>
                <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="chart-card-title">
              <span>Teacher Comments & Notes</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid var(--card-border)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {teacherNotes}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ChildDetail;
