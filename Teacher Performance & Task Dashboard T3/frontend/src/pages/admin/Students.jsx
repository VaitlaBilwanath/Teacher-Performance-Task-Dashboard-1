/* src/pages/admin/Students.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Baby, User, Phone, Search, ArrowRight, Download, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { mockChildren } from '../../data/mockData';
import { adminAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import '../../styles/pages.css';

const Students = () => {
  const navigate = useNavigate();
  const { success } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [kids, setKids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

    const fetchStudents = async (page = 1, limit = 12, search = '') => {
      setIsLoading(true);
      setErrorState(null);
      try {
        const res = await adminAPI.getStudents(page, limit, search);
        if (res.data && res.data.success) {
          const mapped = res.data.data.map(k => ({
            id: k.id,
            name: k.name,
            avatar: k.avatar || k.name.split(' ').map(p => p[0]).join('').toUpperCase(),
            age: k.age || '3 Years',
            mood: k.mood || 'Happy',
            assignedClass: k.classroom ? k.classroom.name : 'Not Assigned',
            assignedTeacher: k.classroom && k.classroom.teachers && k.classroom.teachers.length > 0
              ? k.classroom.teachers.map(t => t.user.name).join(", ")
              : 'Not Assigned',
            parentName: k.parent ? k.parent.user.name : 'Unknown',
            parentContact: k.parent ? k.parent.parentContact : 'N/A',
            studentRegNo: k.studentRegNo,
            admissionNo: k.admissionNo
          }));
          setKids(mapped);
          
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err) {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
          console.warn("Using mock fallback", err);
          setKids(mockChildren);
        } else {
          setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
        }
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchStudents(pagination.page, pagination.limit, searchTerm);
  }, [pagination.page, pagination.limit, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Backend handles search, but we keep this for mock data
  const filteredKids = kids;

  const handleExportCSV = () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
      { key: 'assignedClass', label: 'Classroom' },
      { key: 'admissionNo', label: 'Admission Number' },
      { key: 'studentRegNo', label: 'Registration Number' },
      { key: 'parentName', label: 'Parent Name' },
      { key: 'parentContact', label: 'Parent Contact' }
    ];
    exportToCSV(kids, headers, 'students_roster.csv');
    success('Export Initiated', 'CSV export completed successfully.');
  };

  const handleExportExcel = () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
      { key: 'assignedClass', label: 'Classroom' },
      { key: 'admissionNo', label: 'Admission Number' },
      { key: 'studentRegNo', label: 'Registration Number' },
      { key: 'parentName', label: 'Parent Name' },
      { key: 'parentContact', label: 'Parent Contact' }
    ];
    exportToExcel(kids, headers, 'students_roster.xls');
    success('Export Initiated', 'Excel export completed successfully.');
  };

  const handleExportPDF = () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
      { key: 'assignedClass', label: 'Class' },
      { key: 'admissionNo', label: 'Adm No' },
      { key: 'studentRegNo', label: 'Reg No' },
      { key: 'parentName', label: 'Parent' },
      { key: 'parentContact', label: 'Contact' }
    ];
    exportToPDF(kids, headers, 'Intellitots Student Enrollment Report');
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
      {/* Search and Filters */}
      <div className="roster-header-bar" style={{ gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>
          Search enrollment details, parent sync cards, and behavior indices
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
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

          <form onSubmit={handleSearch} className="header-search" style={{ width: '320px', background: 'rgba(255,255,255,0.15)', margin: 0, display: 'flex' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name, class, reg no, adm no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" style={{ display: 'none' }}>Search</button>
          </form>
        </div>
      </div>

      <div className="roster-grid">
        {filteredKids.map((kid, index) => (
          <GlassCard key={kid.id} delay={index * 0.05} className="roster-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="badge info">{kid.assignedClass}</span>
              <span style={{ fontSize: '1.2rem' }}>
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
                {(kid.studentRegNo || kid.admissionNo) && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {kid.admissionNo && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Adm: {kid.admissionNo}
                        <button
                          onClick={() => { navigator.clipboard.writeText(kid.admissionNo); success('Copied successfully'); }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                          title="Copy Admission Number"
                        >
                          📋
                        </button>
                      </span>
                    )}
                    {kid.admissionNo && kid.studentRegNo && (
                      <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    )}
                    {kid.studentRegNo && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Reg: {kid.studentRegNo}
                        <button
                          onClick={() => { navigator.clipboard.writeText(kid.studentRegNo); success('Copied successfully'); }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                          title="Copy Registration Number"
                        >
                          📋
                        </button>
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Assigned Teacher</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{kid.assignedTeacher}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Parent Contact</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{kid.parentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Phone Number</span>
                <span style={{ color: 'var(--text-secondary)' }}>{kid.parentContact}</span>
              </div>
            </div>

            <motion.button 
              onClick={() => navigate(`/child/${kid.id}`)}
              className="btn-glass"
              style={{ width: '100%', marginTop: '15px', padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
              whileHover={{ scale: 1.02 }}
            >
              View Growth Timeline <ArrowRight size={14} />
            </motion.button>
          </GlassCard>
        ))}
        {kids.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px' }}>
            No students found matching your query
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Showing {kids.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
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
    </div>
  );
};

export default Students;
