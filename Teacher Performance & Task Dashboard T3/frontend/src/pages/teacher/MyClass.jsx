/* src/pages/teacher/MyClass.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BookOpen, Baby, Phone, User, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren, mockTeachers } from '../../data/mockData';
import { teacherAPI } from '../../services/api';
import '../../styles/pages.css';

const MyClass = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // API Integration States
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [children, setChildren] = useState([]);
  const [assignedClass, setAssignedClass] = useState(() => {
    const activeUserStr = localStorage.getItem('activeUser');
    if (activeUserStr) {
      try {
        const activeUser = JSON.parse(activeUserStr);
        if (activeUser.role.toLowerCase() === 'teacher') {
          if (activeUser.teacher && activeUser.teacher.classroom) {
            return activeUser.teacher.classroom.name;
          }
          const email = activeUser.email;
          const match = mockTeachers.find(t => t.email.toLowerCase() === email.toLowerCase());
          if (match) return match.assignedClass;
        }
      } catch (e) {}
    }
    return 'Playgroup A';
  });
  const [teacherName, setTeacherName] = useState('Aanya Sharma');

  const classKids = children.length > 0 ? children : mockChildren.filter(kid => kid.assignedClass === assignedClass);

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
          parentName: s.parent ? s.parent.user.name : 'Unknown Parent',
          parentContact: s.parent ? (s.parent.parentContact || s.parent.user.phone || '') : '',
          studentRegNo: s.studentRegNo,
          admissionNo: s.admissionNo
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

    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter based on search term
  const filteredKids = classKids.filter(kid => {
    const q = searchTerm.toLowerCase();
    return (
      kid.name.toLowerCase().includes(q) ||
      (kid.studentRegNo && kid.studentRegNo.toLowerCase().includes(q)) ||
      (kid.admissionNo && kid.admissionNo.toLowerCase().includes(q))
    );
  });

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
      {/* Search and Filters */}
      <div className="roster-header-bar" style={{ gap: '15px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          Class: <strong>{assignedClass}</strong> • Class Teacher: <strong>{teacherName}</strong>
        </h2>
        
        <div className="header-search" style={{ width: '320px', background: 'rgba(255,255,255,0.15)' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search student by name, reg no, adm no..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="roster-grid">
        {filteredKids.map((kid, index) => (
          <GlassCard key={kid.id} delay={index * 0.05} className="roster-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="badge info">{kid.assignedClass}</span>
              <span style={{ fontSize: '1.2rem' }} title={`Mood: ${kid.mood}`}>
                {kid.mood === 'Happy' ? '😊' : kid.mood === 'Energetic' ? '⚡' : '🧐'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '15px 0' }}>
              <div className="profile-avatar" style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', color: 'white', fontSize: '1.2rem' }}>
                {kid.avatar}
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{kid.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Age: {kid.age}</p>
                {(kid.admissionNo || kid.studentRegNo) && (
                  <p style={{ fontSize: '0.68rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                    {kid.admissionNo ? `Adm: ${kid.admissionNo}` : ''}{kid.admissionNo && kid.studentRegNo ? ' • ' : ''}{kid.studentRegNo ? `Reg: ${kid.studentRegNo}` : ''}
                  </p>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Parent Contact</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{kid.parentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Phone Number</span>
                <span style={{ color: 'var(--text-secondary)' }}>{kid.parentContact}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <motion.button 
                onClick={() => navigate(`/child/${kid.id}`)}
                className="btn-premium"
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                whileHover={{ scale: 1.02 }}
              >
                Growth Tracker <ArrowRight size={12} />
              </motion.button>
              <motion.button 
                onClick={() => navigate(`/teacher/notes?studentId=${kid.id}`)}
                className="btn-glass"
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                whileHover={{ scale: 1.02 }}
              >
                <BookOpen size={12} /> Notes
              </motion.button>
            </div>
          </GlassCard>
        ))}

        {filteredKids.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px' }}>
            No students found in your class.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClass;
