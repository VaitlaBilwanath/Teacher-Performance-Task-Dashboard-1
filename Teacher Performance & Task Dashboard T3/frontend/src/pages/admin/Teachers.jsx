/* src/pages/admin/Teachers.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Users, Award, ShieldAlert, Edit2, Phone, Mail, X, Check, Download, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockTeachers } from '../../data/mockData';
import { adminAPI } from '../../services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import '../../styles/pages.css';

const Teachers = () => {
  const { success } = useNotifications();
  const [teachers, setTeachers] = useState([]);
  const [classroomsMap, setClassroomsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editClass, setEditClass] = useState('');
  const [editShift, setEditShift] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

  const fetchTeachers = async (page = 1, limit = 12, search = '') => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const res = await adminAPI.getTeachers(page, limit, search);
      if (res.data && res.data.success) {
        const mapped = res.data.data.map(t => ({
          id: t.id,
          name: t.user.name,
          email: t.user.email,
          avatar: t.avatar || t.user.name.split(' ').map(p => p[0]).join('').toUpperCase(),
          assignedClass: t.classroom ? t.classroom.name : 'Not Allocated',
          shiftTime: t.shiftTime || '09:00 AM - 03:00 PM',
          roomNumber: t.classroom ? t.classroom.roomNumber : 'N/A',
          performance: t.performance,
          complianceScore: t.complianceScore,
          attendance: t.attendance,
          teacherRegNo: t.teacherRegNo,
          employeeId: t.employeeId
        }));
        setTeachers(mapped);
        
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }

        const cmap = {};
        res.data.data.forEach(t => {
          if (t.classroom) {
            cmap[t.classroom.name.toLowerCase()] = t.classroom.id;
          }
        });
        setClassroomsMap(cmap);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Using mock fallback", err);
        setTeachers(mockTeachers);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(pagination.page, pagination.limit, searchTerm);
  }, [pagination.page, pagination.limit, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeachers(1, pagination.limit, searchTerm);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setEditClass(teacher.assignedClass);
    setEditShift(teacher.shiftTime);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const cid = classroomsMap[editClass.toLowerCase()] || null;
      await adminAPI.updateTeacher(editingTeacher.id, {
        classroomId: cid,
        shiftTime: editShift,
        name: editingTeacher.name
      });
      success('Teacher Reassigned', `Updated details for ${editingTeacher.name}.`);
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      console.warn("Failed to update teacher via API. Falling back to local state.", err);
      setTeachers(prev => prev.map(t => {
        if (t.id === editingTeacher.id) {
          return {
            ...t,
            assignedClass: editClass,
            shiftTime: editShift
          };
        }
        return t;
      }));
      success('Teacher Reassigned (Offline)', `Updated details for ${editingTeacher.name}.`);
      setEditingTeacher(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'teacherRegNo', label: 'Teacher Registration Number' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'assignedClass', label: 'Class Allocation' },
      { key: 'shiftTime', label: 'Working Shift' },
      { key: 'roomNumber', label: 'Room Number' },
      { key: 'performance', label: 'Performance Score (%)' },
      { key: 'complianceScore', label: 'Compliance Score (%)' }
    ];
    exportToCSV(teachers, headers, 'teachers_roster.csv');
    success('Export Initiated', 'CSV export completed successfully.');
  };

  const handleExportExcel = () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'teacherRegNo', label: 'Teacher Registration Number' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'assignedClass', label: 'Class Allocation' },
      { key: 'shiftTime', label: 'Working Shift' },
      { key: 'roomNumber', label: 'Room Number' },
      { key: 'performance', label: 'Performance Score (%)' },
      { key: 'complianceScore', label: 'Compliance Score (%)' }
    ];
    exportToExcel(teachers, headers, 'teachers_roster.xls');
    success('Export Initiated', 'Excel export completed successfully.');
  };

  const handleExportPDF = () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'teacherRegNo', label: 'Reg No' },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'assignedClass', label: 'Class' },
      { key: 'shiftTime', label: 'Shift' },
      { key: 'performance', label: 'Perf %' },
      { key: 'complianceScore', label: 'Audit %' }
    ];
    exportToPDF(teachers, headers, 'Intellitots Staff & Teacher Roster Report');
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
      <div className="roster-header-bar">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>
          Review staff attendance indices, reassign classes, and modify schedules
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleExportCSV} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Download size={13} /> CSV
          </button>
          <button 
            onClick={handleExportExcel} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Download size={13} /> Excel
          </button>
          <button 
            onClick={handleExportPDF} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Download size={13} /> PDF
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button type="submit" className="primary-btn" style={{ position: 'absolute', right: '5px', top: '5px', bottom: '5px', padding: '0 15px' }}>
            Search
          </button>
        </form>
      </div>

      <div className="roster-grid">
        {teachers.map((teacher, index) => (
          <GlassCard key={teacher.id} delay={index * 0.05} className="roster-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="badge success">Active</span>
              <button 
                onClick={() => handleEditClick(teacher)}
                style={{ color: 'var(--primary)', padding: '4px' }}
                title="Edit Details"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '15px 0 10px 0' }}>
              <div className="profile-avatar" style={{ width: '45px', height: '45px', fontSize: '1.15rem' }}>
                {teacher.avatar}
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teacher.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{teacher.email}</p>
                {(teacher.teacherRegNo || teacher.employeeId) && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {teacher.teacherRegNo && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Reg: {teacher.teacherRegNo}
                        <button
                          onClick={() => { navigator.clipboard.writeText(teacher.teacherRegNo); success('Copied successfully'); }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                          title="Copy Registration Number"
                        >
                          📋
                        </button>
                      </span>
                    )}
                    {teacher.teacherRegNo && teacher.employeeId && (
                      <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    )}
                    {teacher.employeeId && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Emp: {teacher.employeeId}
                        <button
                          onClick={() => { navigator.clipboard.writeText(teacher.employeeId); success('Copied successfully'); }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                          title="Copy Employee ID"
                        >
                          📋
                        </button>
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)', padding: '10px 0', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="roster-card-row">
                <span>Class Allocation</span>
                <strong style={{ color: 'var(--text-primary)' }}>{teacher.assignedClass}</strong>
              </div>
              <div className="roster-card-row">
                <span>Working Shift</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{teacher.shiftTime}</span>
              </div>
              <div className="roster-card-row">
                <span>Room Number</span>
                <span>{teacher.roomNumber}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <Award size={14} style={{ color: 'var(--warning)' }} /> Score: <strong>{teacher.performance}%</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <ShieldAlert size={14} style={{ color: 'var(--primary)' }} /> Audit: <strong>{teacher.complianceScore}%</strong>
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Showing {teachers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} teachers
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            style={{
              background: pagination.page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              color: pagination.page === 1 ? 'rgba(255,255,255,0.3)' : 'var(--text-primary)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Prev
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Page {pagination.page} of {pagination.totalPages || 1}
          </div>

          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
            style={{
              background: pagination.page === pagination.totalPages || pagination.totalPages === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              color: pagination.page === pagination.totalPages || pagination.totalPages === 0 ? 'rgba(255,255,255,0.3)' : 'var(--text-primary)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: pagination.page === pagination.totalPages || pagination.totalPages === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      <AnimatePresence>
        {editingTeacher && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px' }}>
                <span>Modify Details: <strong>{editingTeacher.name}</strong></span>
                <button onClick={() => setEditingTeacher(null)} style={{ color: 'var(--text-tertiary)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="login-form-group">
                  <label>Assigned Class</label>
                  <input
                    type="text"
                    className="input-glass"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label>Shift Timing</label>
                  <input
                    type="text"
                    className="input-glass"
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn-premium"
                  style={{ width: 'fit-content', alignSelf: 'flex-end', marginTop: '10px' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check size={16} /> Save Changes
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
