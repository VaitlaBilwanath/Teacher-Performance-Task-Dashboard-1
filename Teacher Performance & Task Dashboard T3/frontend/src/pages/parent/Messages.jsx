/* src/pages/parent/Messages.jsx */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { ChevronLeft, Send, MessageSquare, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren, mockTeachers } from '../../data/mockData';
import { parentAPI, messageAPI } from '../../services/api';
import '../../styles/pages.css';

const Messages = () => {
  const navigate = useNavigate();
  const { success, info } = useNotifications();
  const chatEndRef = useRef(null);

  // Find active parent child
  const activeRole = localStorage.getItem('activeRole');
  const activeUserStr = localStorage.getItem('activeUser');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;

  const child = activeRole === 'parent' && activeUser 
    ? (mockChildren.find(k => k.parentName === activeUser.name) || mockChildren[0])
    : mockChildren[0];

  // Find Class Teacher
  const teacher = mockTeachers.find(t => t.assignedClass === child.assignedClass) || mockTeachers[0];

  // API Integration States
  const [dbMessages, setDbMessages] = useState([]);
  const [teacherUserId, setTeacherUserId] = useState('');
  const [dbTeacher, setDbTeacher] = useState(null);
  const [simulatedMessages, setSimulatedMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const mockMessagesFallback = [
    {
      id: 'm1',
      sender: 'teacher',
      name: teacher.name,
      avatar: teacher.avatar,
      text: `Hello! I noticed ${child.name} was very excited during the shape matching game today. He successfully matched all circular and triangular blocks!`,
      time: '02:30 PM'
    },
    {
      id: 'm2',
      sender: 'parent',
      name: child.parentName,
      avatar: 'PA',
      text: `That's wonderful to hear! Thank you for the update, teacher. Did he eat his lunch fully?`,
      time: '02:45 PM'
    },
    {
      id: 'm3',
      sender: 'teacher',
      name: teacher.name,
      avatar: teacher.avatar,
      text: `Yes, he finished about 80% of his rice and lentil soup. He was a bit hesitant with the carrots, but we encouraged him and he did well!`,
      time: '02:50 PM'
    }
  ];

  const currentUserId = activeUser ? activeUser.id : '';

  const activeMessages = dbMessages.length > 0
    ? dbMessages.map(m => {
        const isUser = m.senderId === currentUserId;
        return {
          id: m.id,
          sender: isUser ? 'parent' : 'teacher',
          name: isUser ? (child?.parentName || 'Parent') : (dbTeacher?.user?.name || teacher.name),
          avatar: isUser ? 'PA' : (dbTeacher?.avatar || teacher.avatar),
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      })
    : [...mockMessagesFallback, ...simulatedMessages];

  const fetchChat = async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    }
    setErrorState(null);
    try {
      const resChild = await parentAPI.getMyChild();
      if (resChild.data && resChild.data.success) {
        const student = resChild.data.data;
        const teacherObj = student.classroom?.teachers?.[0];
        if (teacherObj) {
          setTeacherUserId(teacherObj.user.id);
          setDbTeacher(teacherObj);
        }
      }

      const resMsgs = await parentAPI.getMessages();
      if (resMsgs.data && resMsgs.data.success) {
        setDbMessages(resMsgs.data.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        return; // Handled globally by axios response interceptor
      }
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        console.warn("Failed to fetch chat messages via API", err);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChat(true);
    const interval = setInterval(() => fetchChat(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    try {
      if (teacherUserId) {
        await messageAPI.sendMessage(teacherUserId, inputVal);
        success('Message Sent', 'Sent to Class Mentor.');
        setInputVal('');
        fetchChat(false);
      } else {
        throw new Error("No teacherUserId found");
      }
    } catch (err) {
      console.warn("Failed to send message via API. Falling back to simulated reply.", err);
      const userMessage = {
        id: `usr-${Date.now()}`,
        sender: 'parent',
        name: child.parentName,
        avatar: 'PA',
        text: inputVal,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSimulatedMessages(prev => [...prev, userMessage]);
      setInputVal('');
      success('Message Sent (Offline)', 'Sent to Class Mentor.');

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const teacherReply = {
          id: `tch-${Date.now()}`,
          sender: 'teacher',
          name: teacher.name,
          avatar: teacher.avatar,
          text: `Thank you for details! I will monitor this closely in class. Feel free to sync with me if you need any further updates!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSimulatedMessages(prev => [...prev, teacherReply]);
        info('New Message (Offline)', `Received reply from ${teacher.name}`);
      }, 2000);
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
          <button className="primary-btn" onClick={() => fetchChat(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => navigate('/parent/dashboard')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', height: 'calc(100vh - 180px)', minHeight: '450px' }}>
        <GlassCard hoverEffect={false} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ padding: '15px', borderBottom: '1px solid var(--divider)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="profile-avatar" style={{ width: '40px', height: '40px', background: 'var(--primary)20', color: 'var(--primary)', fontWeight: 700 }}>
              {teacher.avatar}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teacher.name}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                Online • Class Mentor
              </span>
            </div>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {activeMessages.map((m) => {
              const isUser = m.sender === 'parent';
              return (
                <div 
                  key={m.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: '10px' 
                  }}
                >
                  {!isUser && (
                    <div className="profile-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem', flexShrink: 0 }}>
                      {m.avatar}
                    </div>
                  )}
                  
                  <div style={{ maxWidth: '70%' }}>
                    <div 
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255,255,255,0.08)',
                        border: isUser ? 'none' : '1px solid var(--card-border)',
                        color: isUser ? 'white' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      {m.text}
                    </div>
                    
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--text-tertiary)', 
                        marginTop: '4px', 
                        display: 'block',
                        textAlign: isUser ? 'right' : 'left'
                      }}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="profile-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                  {teacher.avatar}
                </div>
                <div 
                  style={{ 
                    padding: '8px 14px', 
                    borderRadius: '16px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid var(--card-border)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    typing
                    <span className="dot-blink">.</span>
                    <span className="dot-blink" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="dot-blink" style={{ animationDelay: '0.4s' }}>.</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          {/* Message Input Footer */}
          <form 
            onSubmit={handleSendMessage} 
            style={{ 
              padding: '12px 15px', 
              borderTop: '1px solid var(--divider)', 
              background: 'rgba(255,255,255,0.02)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Send message to ${teacher.name}...`}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <motion.button 
              type="submit"
              className="btn-premium"
              style={{ padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={16} />
            </motion.button>
          </form>
        </GlassCard>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .dot-blink {
          animation: blink 1.4s infinite;
        }
      `}</style>
    </div>
  );
};

export default Messages;
