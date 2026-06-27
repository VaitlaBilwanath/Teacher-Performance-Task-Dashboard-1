/* src/pages/admin/StaffAttendance.jsx */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Check, X, Calendar, Clock, UserCheck, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import CountUp from '../../components/CountUp';
import { adminAPI } from '../../services/api';
import '../../styles/pages.css';

const StaffAttendance = () => {
  const { success, error } = useNotifications();
  const [teachers, setTeachers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      // Load both teachers and today's attendance logs
      const [teachersRes, logsRes] = await Promise.all([
        adminAPI.getTeachers(),
        adminAPI.getStaffAttendance(1, 100)
      ]);

      const loadedTeachers = teachersRes.data?.data || [];
      const loadedLogs = logsRes.data?.data || [];
      
      setTeachers(loadedTeachers);
      setAttendanceLogs(loadedLogs);

      // Pre-fill state based on logs for today
      const today = new Date().toISOString().split('T')[0];
      const todayState = {};
      
      loadedLogs.forEach(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        if (logDate === today) {
          todayState[log.teacherId] = log.status.toLowerCase();
        }
      });
      
      // Default rest to un-marked
      setAttendanceState(todayState);

    } catch (err) {
      console.error('Failed to load attendance:', err);
      setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (teacherId, status) => {
    // In a full implementation, this would call a POST API.
    // For now, we update local state to reflect UI change.
    setAttendanceState(prev => ({ ...prev, [teacherId]: status }));
    const teacher = teachers.find(t => t.id === teacherId);
    success('Attendance Logged', `${teacher?.user?.name || 'Teacher'} marked as ${status.toUpperCase()}.`);
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

  if (teachers.length === 0) {
    return (
      <div className="page-container">
        <GlassCard style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
          <UserCheck size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 15px', display: 'block' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>No Staff Members Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>There are currently no staff members in the database. Add teachers to track attendance.</p>
        </GlassCard>
      </div>
    );
  }

  const presentCount = Object.values(attendanceState).filter(v => v === 'present').length;
  const leaveCount = Object.values(attendanceState).filter(v => v === 'leave').length;
  const absentCount = Object.values(attendanceState).filter(v => v === 'absent').length;

  return (
    <div className="page-container">
      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }
        .attendance-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        .attendance-table {
          min-width: 1150px;
          width: 100%;
          border-collapse: collapse;
        }
        .attendance-table th, .recent-logs-table th {
          padding: 14px 22px;
          text-align: left;
          color: var(--text-tertiary);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--divider);
        }
        .attendance-row, .recent-log-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background var(--transition-fast);
        }
        .attendance-row:hover, .recent-log-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .attendance-row td, .recent-log-row td {
          padding: 18px 22px;
          color: var(--text-secondary);
          vertical-align: middle;
        }
        .action-btn {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all var(--transition-fast);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 36px;
        }
        .recent-logs-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        .recent-logs-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }
      `}</style>

      <div className="kpi-grid">
        <GlassCard className="kpi-card" delay={0.1}>
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <UserCheck size={24} />
          </div>
          <div className="kpi-content">
            <h3>Today's Present</h3>
            <div className="kpi-value">
              <CountUp end={presentCount} duration={1.5} />
            </div>
            <span className="kpi-trend positive">+ Updated Just Now</span>
          </div>
        </GlassCard>
        
        <GlassCard className="kpi-card" delay={0.2}>
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-content">
            <h3>Excused Leave</h3>
            <div className="kpi-value">
              <CountUp end={leaveCount} duration={1.5} />
            </div>
            <span className="kpi-trend">Pending Approval</span>
          </div>
        </GlassCard>

        <GlassCard className="kpi-card" delay={0.3}>
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Absences</h3>
            <div className="kpi-value">
              <CountUp end={absentCount} duration={1.5} />
            </div>
            <span className="kpi-trend negative">Requires Attention</span>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <GlassCard delay={0.2} style={{ padding: '0' }}>
          <div className="chart-card-title" style={{ padding: '20px', borderBottom: '1px solid var(--divider)' }}>
            <span>Mark Daily Staff Attendance</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Teacher</th>
                  <th style={{ width: '12%' }}>Employee ID</th>
                  <th style={{ width: '12%' }}>Registration No</th>
                  <th style={{ width: '15%' }}>Assigned Class</th>
                  <th style={{ width: '15%' }}>Shift Time</th>
                  <th style={{ width: '24%' }}>Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="attendance-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '1rem', flexShrink: 0 }}>
                          {teacher.avatar || teacher.user?.name?.charAt(0) || 'T'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{teacher.user?.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{teacher.user?.email || 'Teacher'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{teacher.employeeId}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{teacher.teacherRegNo}</td>
                    <td>{teacher.classroom?.name || 'Not Assigned'}</td>
                    <td>{teacher.shiftTime}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                          className="action-btn"
                          onClick={() => handleStatusChange(teacher.id, 'present')}
                          style={{
                            background: attendanceState[teacher.id] === 'present' ? 'var(--success)' : 'rgba(16, 185, 129, 0.1)',
                            color: attendanceState[teacher.id] === 'present' ? 'white' : 'var(--success)',
                          }}
                        >
                          Present
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleStatusChange(teacher.id, 'absent')}
                          style={{
                            background: attendanceState[teacher.id] === 'absent' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.1)',
                            color: attendanceState[teacher.id] === 'absent' ? 'white' : 'var(--danger)',
                          }}
                        >
                          Absent
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleStatusChange(teacher.id, 'leave')}
                          style={{
                            background: attendanceState[teacher.id] === 'leave' ? 'var(--warning)' : 'rgba(245, 158, 11, 0.1)',
                            color: attendanceState[teacher.id] === 'leave' ? 'white' : 'var(--warning)',
                          }}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.4} style={{ height: 'auto', minHeight: 'unset', padding: '0' }}>
        <div className="chart-card-title" style={{ padding: '20px', borderBottom: '1px solid var(--divider)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: 'var(--primary)' }} />
            Recent Attendance Logs
          </span>
        </div>

        <div className="recent-logs-wrapper">
          <table className="recent-logs-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Date</th>
                <th style={{ width: '25%' }}>Teacher</th>
                <th style={{ width: '20%' }}>Employee ID</th>
                <th style={{ width: '20%' }}>Marked Time</th>
                <th style={{ width: '20%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '30px' }}>
                    No recent attendance logs found.
                  </td>
                </tr>
              ) : (
                attendanceLogs.map(log => {
                  let statusBg = 'rgba(255,255,255,0.1)';
                  let statusColor = 'var(--text-secondary)';
                  if (log.status.toUpperCase() === 'PRESENT') {
                    statusBg = 'rgba(16, 185, 129, 0.15)';
                    statusColor = 'var(--success)';
                  } else if (log.status.toUpperCase() === 'ABSENT') {
                    statusBg = 'rgba(239, 68, 68, 0.15)';
                    statusColor = 'var(--danger)';
                  } else if (log.status.toUpperCase() === 'LEAVE') {
                    statusBg = 'rgba(245, 158, 11, 0.15)';
                    statusColor = 'var(--warning)';
                  }

                  return (
                    <tr key={log.id} className="recent-log-row">
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.teacher?.user?.name || 'Unknown Teacher'}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {log.teacher?.employeeId || '-'}
                      </td>
                      <td style={{ color: 'var(--text-tertiary)' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
                          borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                          background: statusBg, color: statusColor, letterSpacing: '0.05em'
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default StaffAttendance;
