/* src/pages/admin/TaskBoard.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, User, Plus, Trash2, X, Clock, AlertCircle, RefreshCw, CheckSquare } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { adminAPI } from '../../services/api';
import '../../styles/pages.css';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Under Review' },
  { id: 'COMPLETED', title: 'Completed' }
];

const TaskBoard = () => {
  const { success, warning, error } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDate, setNewDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const [tasksRes, teachersRes] = await Promise.all([
        adminAPI.getTasks(1, 100),
        adminAPI.getTeachers()
      ]);
      setTasks(tasksRes.data?.data || []);
      const loadedTeachers = teachersRes.data?.data || [];
      setTeachers(loadedTeachers);
      if (loadedTeachers.length > 0) {
        setNewAssignee(loadedTeachers[0].id);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    
    if (taskId) {
      // Optimistic update
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          if (t.status !== targetColumnId) {
            success('Task Updated', `Moved task to ${targetColumnId.replace('_', ' ')}`);
          }
          return { ...t, status: targetColumnId };
        }
        return t;
      }));
      // In a real app, send PUT /api/admin/tasks/:id
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      warning('Validation Error', 'Task title and details cannot be empty.');
      return;
    }

    const newTask = {
      id: `tsk-${Date.now()}`,
      title: newTitle,
      desc: newDesc,
      status: 'TODO',
      priority: newPriority,
      dueDate: newDate,
      assigneeId: newAssignee,
      assignee: teachers.find(t => t.id === newAssignee) || null
    };

    setTasks(prev => [newTask, ...prev]);
    success('Task Created', `New task "${newTitle}" has been added.`);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    success('Task Deleted', 'The task has been removed permanently.');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
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
          <button className="primary-btn" onClick={loadData} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} />
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>Kanban Task Board</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and assign operational tasks to teachers</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
          <CheckSquare size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 15px', display: 'block' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>No Tasks Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>There are no active tasks on the board.</p>
        </GlassCard>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className={`kanban-column ${dragOverColumn === col.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="kanban-column-header">
                  <h3>{col.title}</h3>
                  <span className="task-count">{colTasks.length}</span>
                </div>
                
                <div className="kanban-task-list">
                  <AnimatePresence>
                    {colTasks.map((task) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`kanban-card ${draggedTaskId === task.id ? 'dragging' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span 
                            style={{ 
                              fontSize: '0.7rem', 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              background: 'rgba(0,0,0,0.05)',
                              color: getPriorityColor(task.priority),
                              border: `1px solid ${getPriorityColor(task.priority)}`,
                              textTransform: 'uppercase',
                              fontWeight: 700
                            }}
                          >
                            {task.priority}
                          </span>
                          <button 
                            className="icon-btn-danger" 
                            style={{ background: 'transparent', padding: '2px', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{task.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px', lineHeight: '1.4' }}>{task.desc}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--divider)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                            <div className="avatar" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>
                              {task.assignee?.user?.name?.charAt(0) || 'U'}
                            </div>
                            {task.assignee?.user?.name?.split(' ')[0] || 'Unknown'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddTask} className="modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="E.g., Update Lesson Plans"
                  className="glass-input" 
                />
              </div>
              
              <div className="form-group">
                <label>Details / Instructions</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Provide specific instructions..."
                  className="glass-input" 
                  rows="3"
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Assign To</label>
                  <select 
                    value={newAssignee} 
                    onChange={(e) => setNewAssignee(e.target.value)} 
                    className="glass-input"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.user?.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={newPriority} 
                    onChange={(e) => setNewPriority(e.target.value)} 
                    className="glass-input"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)} 
                  className="glass-input" 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1 }}>
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
