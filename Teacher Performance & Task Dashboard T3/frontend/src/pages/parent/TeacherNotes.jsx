/* src/pages/parent/TeacherNotes.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { ChevronLeft, MessageSquare, User, Calendar, PhoneCall, Check, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren, mockTeachers } from '../../data/mockData';
import { parentAPI } from '../../services/api';
import '../../styles/pages.css';

const TeacherNotes = () => {
  const navigate = useNavigate();
  const { success } = useNotifications();

  // Find active parent child
  const activeRole = localStorage.getItem('activeRole');
  const activeUserStr = localStorage.getItem('activeUser');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;

  // API Integration States
  const [dbChild, setDbChild] = useState(null);
  const [dbNotes, setDbNotes] = useState([]);
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
      const resNotes = await parentAPI.getTeacherNotes();
      if (resNotes.data && resNotes.data.success) {
        setDbNotes(resNotes.data.data);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        console.warn("Failed to fetch teacher notes via API", err);
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
    assignedClass: dbChild.classroom ? dbChild.classroom.name : 'Playgroup A'
  } : (activeRole === 'parent' && activeUser 
    ? (mockChildren.find(k => k.parentName === activeUser.name) || mockChildren[0])
    : mockChildren[0]);

  // Find Class Teacher details
  const teacher = mockTeachers.find(t => t.assignedClass === child.assignedClass) || mockTeachers[0];

  const [acknowledged, setAcknowledged] = useState({});
  const [requestCall, setRequestCall] = useState(false);

  // Mask list of teacher observations for this child
  const notesList = dbNotes.length > 0
    ? dbNotes.map(n => ({
        id: n.id,
        date: n.date,
        author: n.author,
        avatar: n.author.split(' ').map(namePart => namePart[0]).join('').toUpperCase().slice(0, 2),
        title: `Observation Note (${n.mood})`,
        content: n.content
      }))
    : [
        {
          id: 'nt-1',
          date: '2026-06-16',
          author: teacher.name,
          avatar: teacher.avatar,
          title: 'Excellent Cooperative Play',
          content: `${child.name} has been showing excellent improvement in shape matching and cooperative play. He was happily sharing his toys with Kabir during the sandpit castle activity today.`
        },
        {
          id: 'nt-2',
          date: '2026-06-12',
          author: teacher.name,
          avatar: teacher.avatar,
          title: 'Speech and Sound Milestones',
          content: `Demonstrated superb engagement during the letter circle activity. Pronounces vowel sounds clearly and can trace shapes with minimal guide support.`
        }
      ];

  const handleAcknowledge = (id) => {
    setAcknowledged(prev => ({ ...prev, [id]: true }));
    success('Note Acknowledged', 'Thank you for reading the teacher feedback.');
  };

  const handleRequestCall = () => {
    setRequestCall(true);
    success('Request Registered', 'Class teacher will schedule a call during standard PTM slots.');
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

      <div className="routine-grid">
        {/* Notes Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {notesList.map((note) => (
            <GlassCard key={note.id} hoverEffect={false}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="profile-avatar" style={{ width: '36px', height: '36px' }}>
                    {note.avatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{note.author}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class mentor • {child.assignedClass}</span>
                  </div>
                </div>
                
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {note.date}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{note.title}</h3>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '15px' }}>
                {note.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {acknowledged[note.id] ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                    <Check size={14} /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(note.id)}
                    className="btn-glass"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span>Parent Quick Sync</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '15px' }}>
              Want to discuss your child's progress, nutrition plans, or milestone indicators with <strong>{teacher.name}</strong>?
            </p>

            {requestCall ? (
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Check size={16} /> Callback requested successfully!
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>The teacher will contact you during parent hours.</p>
              </div>
            ) : (
              <motion.button
                onClick={handleRequestCall}
                className="btn-premium"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PhoneCall size={16} /> Request Callback
              </motion.button>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherNotes;
