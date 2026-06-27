/* src/pages/teacher/TeacherTasks.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Clock, CheckSquare, ChevronLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockTasks } from '../../data/mockData';
import { teacherAPI } from '../../services/api';
import '../../styles/pages.css';

const TeacherTasks = () => {
  const navigate = useNavigate();
  const { success } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const res = await teacherAPI.getTasks();
      if (res.data && res.data.success) {
        const mapped = res.data.data.map(t => ({
          id: t.id,
          title: t.title,
          desc: t.description || t.desc || '',
          status: t.status.toLowerCase().replace('_', '-'),
          priority: t.priority ? t.priority.toLowerCase() : 'medium',
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
        }));
        setTasks(mapped);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        setTasks(mockTasks.filter(t => t.assignee === 't1'));
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleProgress = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let nextStatus = 'TODO';
    if (task.status === 'to-do') nextStatus = 'IN_PROGRESS';
    else if (task.status === 'in-progress') nextStatus = 'REVIEW';
    else if (task.status === 'review') nextStatus = 'COMPLETED';
    else nextStatus = 'COMPLETED';

    try {
      await teacherAPI.updateTask(taskId, nextStatus);
      success('Task Updated', `Task status set to ${nextStatus}`);
      fetchTasks();
    } catch (err) {
      console.warn("Failed to progress task on API. Using offline local update.", err);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const nextStatusLower = nextStatus.toLowerCase().replace('_', '-');
          success('Task Updated (Offline)', `Task status set to ${nextStatusLower.toUpperCase()}`);
          return { ...t, status: nextStatusLower };
        }
        return t;
      }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'review': return 'warning';
      default: return 'danger';
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
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <GlassCard className="roster-card" hoverEffect={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`badge ${getStatusBadgeClass(task.status)}`} style={{ marginBottom: '6px' }}>
                      {task.status}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</h3>
                  </div>

                  <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '10px 0' }}>
                  {task.desc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--divider)', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Due date: {task.dueDate}
                  </span>

                  {task.status !== 'completed' ? (
                    <button
                      onClick={() => handleProgress(task.id)}
                      className="btn-premium"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Progress Task <ArrowRight size={12} />
                    </button>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                      <Check size={14} /> Completed
                    </span>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px' }}>
            No tasks assigned currently
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTasks;
