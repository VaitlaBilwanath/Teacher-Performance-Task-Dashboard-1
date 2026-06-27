/* src/pages/teacher/StudentNotes.jsx */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { BookOpen, Send, Smile, Plus, User, Award, CheckCircle, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren as mockChildrenImported, mockTeachers } from '../../data/mockData';
import { teacherAPI } from '../../services/api';
import '../../styles/pages.css';

const StudentNotes = () => {
  const { success, warning } = useNotifications();
  const location = useLocation();

  // API Integration States
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [children, setChildren] = useState([]);
  const [assignedClass, setAssignedClass] = useState('Playgroup A');
  const [teacherName, setTeacherName] = useState('Aanya Sharma');
  const [selectedKidId, setSelectedKidId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [milestonesProgress, setMilestonesProgress] = useState({
    language: 80,
    motor: 75,
    social: 85,
    cognitive: 80
  });

  const [localNotesHistory, setLocalNotesHistory] = useState({});

  const notesHistoryFallback = {
    c1: [
      { date: '2026-06-16', author: 'Aanya Sharma', content: 'Aarav finished his block assembly in record time. Demonstrated good sharing with Kiara.', mood: 'Happy' },
      { date: '2026-06-12', author: 'Aanya Sharma', content: 'Very active in story reading circle today. Successfully identified letters A to G.', mood: 'Energetic' }
    ],
    c2: [
      { date: '2026-06-15', author: 'Aanya Sharma', content: 'Kiara had a bit of a fussy morning but settled down and painted a beautiful clay cup.', mood: 'Curious' },
      { date: '2026-06-11', author: 'Aanya Sharma', content: 'Excellent vocabulary growth. Traced alphabet outlines correctly.', mood: 'Happy' }
    ],
    c3: [
      { date: '2026-06-14', author: 'Varun Mehta', content: 'Kabir built a mock sand castle and explained how water goes in the moat.', mood: 'Curious' }
    ]
  };

  const mockChildren = children.length > 0 ? children : mockChildrenImported.filter(kid => kid.assignedClass === 'Playgroup A');
  const classKids = mockChildren;

  const fetchData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const resClass = await teacherAPI.getMyClass();
      if (resClass.data && resClass.data.success && resClass.data.data.length > 0) {
        const firstStudent = resClass.data.data[0];
        if (firstStudent.classroom) {
          setAssignedClass(firstStudent.classroom.name);
        }
        const mapped = resClass.data.data.map(s => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar || s.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
          age: s.age,
          assignedClass: s.classroom ? s.classroom.name : 'Playgroup A',
          mood: s.mood || 'Happy',
          notes: s.notes || [],
          milestones: s.milestones || []
        }));
        setChildren(mapped);
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
    const activeUserStr = localStorage.getItem('activeUser');
    if (activeUserStr) {
      const activeUser = JSON.parse(activeUserStr);
      setTeacherName(activeUser.name);
    }
  }, []);

  const queryParams = new URLSearchParams(location.search);

  // Sync selectedKidId when query params or list changes
  useEffect(() => {
    const kidId = queryParams.get('studentId');
    if (kidId && classKids.some(k => k.id === kidId)) {
      setSelectedKidId(kidId);
    } else if (classKids.length > 0 && !selectedKidId) {
      setSelectedKidId(classKids[0].id);
    }
  }, [location.search, children]);

  const activeKid = classKids.find(k => k.id === selectedKidId) || classKids[0] || { id: 'default', name: 'Student', mood: 'Happy' };

  // Sync milestones state when child selection changes
  useEffect(() => {
    if (activeKid && activeKid.id !== 'default') {
      const ms = activeKid.milestones || [];
      const languageObj = ms.find(m => m.name.toLowerCase().includes('lang') || m.name.toLowerCase().includes('speech'));
      const motorObj = ms.find(m => m.name.toLowerCase().includes('motor') || m.name.toLowerCase().includes('fine'));
      const socialObj = ms.find(m => m.name.toLowerCase().includes('social') || m.name.toLowerCase().includes('interaction'));
      const cognitiveObj = ms.find(m => m.name.toLowerCase().includes('cognit') || m.name.toLowerCase().includes('ability'));
      
      setMilestonesProgress({
        language: languageObj ? languageObj.progress : 75,
        motor: motorObj ? motorObj.progress : 75,
        social: socialObj ? socialObj.progress : 75,
        cognitive: cognitiveObj ? cognitiveObj.progress : 75
      });
      setSelectedMood(activeKid.mood || 'Happy');
    }
  }, [selectedKidId, children]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      warning('Empty Note', 'Please enter some text observations before publishing.');
      return;
    }

    try {
      await teacherAPI.postStudentNote({
        studentId: selectedKidId,
        content: noteText,
        mood: selectedMood
      });
      success('Note Logged', `Observation card posted for ${activeKid.name}.`);
      setNoteText('');
      fetchData();
    } catch (err) {
      console.warn("Failed to post student note to backend, saving offline locally", err);
      const newNote = {
        date: new Date().toISOString().split('T')[0],
        author: teacherName,
        content: noteText,
        mood: selectedMood
      };
      setLocalNotesHistory(prev => ({
        ...prev,
        [activeKid.id]: [newNote, ...(prev[activeKid.id] || [])]
      }));
      success('Note Logged (Offline)', `Observation card posted for ${activeKid.name}.`);
      setNoteText('');
    }
  };

  const handleMilestoneChange = (key, val) => {
    setMilestonesProgress(prev => ({
      ...prev,
      [key]: parseInt(val)
    }));
  };

  const handleUpdateMilestones = async () => {
    try {
      const milestoneList = [
        { name: 'Language & Speech', progress: milestonesProgress.language },
        { name: 'Fine Motor Skills', progress: milestonesProgress.motor },
        { name: 'Social Interaction', progress: milestonesProgress.social },
        { name: 'Cognitive Ability', progress: milestonesProgress.cognitive }
      ];
      await teacherAPI.postStudentNote({
        studentId: selectedKidId,
        content: `Milestone metrics synchronized.`,
        mood: selectedMood,
        milestones: milestoneList
      });
      success('Milestones Synchronized', `Learning outcomes updated for ${activeKid.name}.`);
      fetchData();
    } catch (err) {
      console.warn("Failed to update milestones on API. Using offline state.", err);
      success('Milestones Synchronized (Offline)', `Learning outcomes updated for ${activeKid.name}.`);
    }
  };

  const moodsList = ['Happy', 'Energetic', 'Curious', 'Tired', 'Fussy'];
  
  const activeKidNotes = activeKid && activeKid.notes && activeKid.notes.length > 0
    ? activeKid.notes
    : (localNotesHistory[activeKid.id] || notesHistoryFallback[activeKid.id] || []);

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
      <div className="routine-grid">
        {/* Left Side: Child List Selector */}
        <GlassCard>
          <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
            <span>Class Students roster</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {classKids.map((kid) => (
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
                <div className="profile-avatar" style={{ width: '32px', height: '32px' }}>
                  {kid.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{kid.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{kid.assignedClass}</p>
                </div>
                <span style={{ fontSize: '1.1rem' }}>
                  {kid.mood === 'Happy' ? '😊' : kid.mood === 'Energetic' ? '⚡' : '🧐'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right Side: Form and History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notes Log Form */}
          <GlassCard>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span>Log Daily Observation: <strong>{activeKid.name}</strong></span>
            </div>

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="login-form-group">
                <label>Observation Comments</label>
                <textarea
                  className="input-glass"
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={`Write developmental index, meals behavior, or class details for ${activeKid.name}...`}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="routine-input-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div className="login-form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Assessed Mood State</label>
                  <select 
                    className="input-glass" 
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                  >
                    {moodsList.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="login-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <motion.button 
                    type="submit"
                    className="btn-premium"
                    style={{ width: '100%', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Send size={14} /> Publish Observation
                  </motion.button>
                </div>
              </div>
            </form>
          </GlassCard>

          {/* Developmental Milestones Slider */}
          <GlassCard>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Milestones Progress Matrix</span>
              <button 
                onClick={handleUpdateMilestones}
                className="btn-glass"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                Sync Metrics
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="login-form-group">
                <label>Speech & Language: {milestonesProgress.language}%</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={milestonesProgress.language}
                  onChange={(e) => handleMilestoneChange('language', e.target.value)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
              <div className="login-form-group">
                <label>Fine Motor Skills: {milestonesProgress.motor}%</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={milestonesProgress.motor}
                  onChange={(e) => handleMilestoneChange('motor', e.target.value)}
                  style={{ accentColor: 'var(--secondary)', cursor: 'pointer' }}
                />
              </div>
              <div className="login-form-group">
                <label>Social Interaction: {milestonesProgress.social}%</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={milestonesProgress.social}
                  onChange={(e) => handleMilestoneChange('social', e.target.value)}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
              <div className="login-form-group">
                <label>Cognitive Ability: {milestonesProgress.cognitive}%</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={milestonesProgress.cognitive}
                  onChange={(e) => handleMilestoneChange('cognitive', e.target.value)}
                  style={{ accentColor: 'var(--success)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Historical Logs feed */}
          <GlassCard>
            <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
              <span>Recent Observations History</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AnimatePresence>
                {activeKidNotes.map((note, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <strong>{note.author}</strong> • {note.date}
                      </span>
                      <span className="badge info" style={{ fontSize: '0.7rem' }}>Mood: {note.mood}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {note.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {activeKidNotes.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>
                  No previous logs available for this student.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default StudentNotes;
