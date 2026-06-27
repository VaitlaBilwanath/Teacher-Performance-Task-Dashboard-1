/* src/pages/admin/Reports.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Award, Download, AlertCircle, RefreshCw } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { adminAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import '../../styles/pages.css';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const Reports = () => {
  const { success } = useNotifications();
  const [activeTab, setActiveTab] = useState('teacher');
  const [teachers, setTeachers] = useState([]);
  const [kids, setKids] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedKidId, setSelectedKidId] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const [reportsRes, teachersRes, studentsRes] = await Promise.all([
        adminAPI.getReports(),
        adminAPI.getTeachers(),
        adminAPI.getStudents()
      ]);
      
      setReportsData(reportsRes.data?.data || null);
      
      const loadedTeachers = teachersRes.data?.data || [];
      setTeachers(loadedTeachers);
      if (loadedTeachers.length > 0) setSelectedTeacherId(loadedTeachers[0].id);

      const loadedStudents = studentsRes.data?.data || [];
      setKids(loadedStudents);
      if (loadedStudents.length > 0) setSelectedKidId(loadedStudents[0].id);

    } catch (err) {
      console.error('Failed to load reports:', err);
      setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (activeTab === 'teacher') {
      const headers = [
        { key: 'user.name', label: 'Name' },
        { key: 'teacherRegNo', label: 'Teacher Registration Number' },
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'classroom.name', label: 'Class Allocation' },
        { key: 'performance', label: 'Performance Score (%)' },
        { key: 'complianceScore', label: 'Compliance Score (%)' },
        { key: 'attendance', label: 'Attendance (%)' }
      ];
      exportToCSV(teachers, headers, 'teacher_performance_report.csv');
      success('Export Initiated', 'Teacher performance report CSV generated.');
    } else {
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'admissionNo', label: 'Admission Number' },
        { key: 'studentRegNo', label: 'Registration Number' },
        { key: 'classroom.name', label: 'Classroom' },
        { key: 'parent.user.name', label: 'Parent Name' },
        { key: 'parent.parentContact', label: 'Parent Contact' },
        { key: 'age', label: 'Age' },
        { key: 'mood', label: 'Current Mood' }
      ];
      exportToCSV(kids, headers, 'child_development_report.csv');
      success('Export Initiated', 'Child development report CSV generated.');
    }
  };

  const handleExportExcel = () => {
    if (activeTab === 'teacher') {
      const headers = [
        { key: 'user.name', label: 'Name' },
        { key: 'teacherRegNo', label: 'Teacher Registration Number' },
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'classroom.name', label: 'Class Allocation' },
        { key: 'performance', label: 'Performance Score (%)' },
        { key: 'complianceScore', label: 'Compliance Score (%)' },
        { key: 'attendance', label: 'Attendance (%)' }
      ];
      exportToExcel(teachers, headers, 'teacher_performance_report.xls');
      success('Export Initiated', 'Teacher performance report Excel generated.');
    } else {
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'admissionNo', label: 'Admission Number' },
        { key: 'studentRegNo', label: 'Registration Number' },
        { key: 'classroom.name', label: 'Classroom' },
        { key: 'parent.user.name', label: 'Parent Name' },
        { key: 'parent.parentContact', label: 'Parent Contact' },
        { key: 'age', label: 'Age' },
        { key: 'mood', label: 'Current Mood' }
      ];
      exportToExcel(kids, headers, 'child_development_report.xls');
      success('Export Initiated', 'Child development report Excel generated.');
    }
  };

  const handleExportPDF = () => {
    if (activeTab === 'teacher') {
      const headers = [
        { key: 'user.name', label: 'Name' },
        { key: 'teacherRegNo', label: 'Reg No' },
        { key: 'employeeId', label: 'Emp ID' },
        { key: 'classroom.name', label: 'Class' },
        { key: 'performance', label: 'Performance %' },
        { key: 'complianceScore', label: 'Compliance %' },
        { key: 'attendance', label: 'Attendance %' }
      ];
      exportToPDF(teachers, headers, 'Teacher Performance Report', 'teacher_performance_report.pdf');
      success('Export Initiated', 'Teacher performance report PDF generated.');
    } else {
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'classroom.name', label: 'Classroom' },
        { key: 'parent.user.name', label: 'Parent' },
        { key: 'age', label: 'Age' }
      ];
      exportToPDF(kids, headers, 'Child Development Report', 'child_development_report.pdf');
      success('Export Initiated', 'Child development report PDF generated.');
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

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  const selectedKid = kids.find(k => k.id === selectedKidId) || kids[0];

  return (
    <div className="page-container">
      <div className="roster-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="login-tabs" style={{ marginBottom: 0 }}>
          <button
            className={`login-tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            Staff Performance
          </button>
          <button
            className={`login-tab-btn ${activeTab === 'child' ? 'active' : ''}`}
            onClick={() => setActiveTab('child')}
          >
            Child Development
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-btn" onClick={handleExportCSV} style={{ padding: '8px 15px', fontSize: '0.85rem' }}>
            <Download size={14} /> CSV
          </button>
          <button className="secondary-btn" onClick={handleExportExcel} style={{ padding: '8px 15px', fontSize: '0.85rem' }}>
            <Download size={14} /> Excel
          </button>
          <button className="primary-btn" onClick={handleExportPDF} style={{ padding: '8px 15px', fontSize: '0.85rem' }}>
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'teacher' && (
            <>
              {/* Overall Center Teacher Stats */}
              <div className="kpi-grid">
                <GlassCard className="kpi-card" delay={0.1}>
                  <div className="kpi-content">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Avg Teacher Performance</h3>
                    <div className="kpi-value" style={{ color: 'var(--primary)' }}>
                      {reportsData?.averagePerformance || 0}%
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="kpi-card" delay={0.2}>
                  <div className="kpi-content">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Avg Compliance Score</h3>
                    <div className="kpi-value" style={{ color: 'var(--success)' }}>
                      {reportsData?.averageCompliance || 0}%
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="kpi-card" delay={0.3}>
                  <div className="kpi-content">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Staff Evaluated</h3>
                    <div className="kpi-value" style={{ color: 'var(--warning)' }}>
                      {teachers.length}
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <GlassCard>
                  <div className="chart-card-title">
                    <span>Performance Distribution</span>
                  </div>
                  <div style={{ height: 260 }}>
                    {reportsData?.performanceDistribution && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsData.performanceDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                          <XAxis dataKey="score" stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                          <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px' }} />
                          <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="chart-card-title">
                    <span>Center Compliance Audit</span>
                  </div>
                  <div style={{ height: 260 }}>
                    {reportsData?.complianceDetails && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportsData.complianceDetails}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {reportsData.complianceDetails.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px' }} />
                          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Individual Teacher View */}
              <GlassCard delay={0.4}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div className="chart-card-title" style={{ margin: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={20} style={{ color: 'var(--primary)' }}/> Individual Teacher Report</span>
                  </div>
                  <select 
                    className="glass-input" 
                    value={selectedTeacherId} 
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    style={{ width: 'auto', minWidth: '200px' }}
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.user?.name} - {t.teacherRegNo}</option>
                    ))}
                  </select>
                </div>

                {selectedTeacher && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div className="teacher-profile-summary" style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div className="profile-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                          {selectedTeacher.user?.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedTeacher.user?.name}</h3>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{selectedTeacher.teacherRegNo}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Performance Score</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{selectedTeacher.performance}%</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                          <div className="progress-bar-fill" style={{ width: `${selectedTeacher.performance}%`, background: 'var(--success)', height: '100%', borderRadius: '3px' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Compliance Score</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{selectedTeacher.complianceScore}%</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                          <div className="progress-bar-fill" style={{ width: `${selectedTeacher.complianceScore}%`, background: 'var(--primary)', height: '100%', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: '250px' }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: 'Pedagogy', A: selectedTeacher.performance, fullMark: 100 },
                          { subject: 'Communication', A: selectedTeacher.complianceScore, fullMark: 100 },
                          { subject: 'Punctuality', A: selectedTeacher.attendance, fullMark: 100 },
                          { subject: 'Creativity', A: 90, fullMark: 100 }, // Mock value if not in DB
                          { subject: 'Empathy', A: 95, fullMark: 100 }, // Mock value if not in DB
                          { subject: 'Tech Savvy', A: selectedTeacher.tasksCompleted, fullMark: 100 }
                        ]}>
                          <PolarGrid stroke="var(--divider)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                          <Radar name={selectedTeacher.user?.name} dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                          <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </GlassCard>
            </>
          )}

          {activeTab === 'child' && (
            <>
              {/* Individual Child Report View */}
              <GlassCard delay={0.1}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div className="chart-card-title" style={{ margin: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Individual Child Development Report</span>
                  </div>
                  <select 
                    className="glass-input" 
                    value={selectedKidId} 
                    onChange={(e) => setSelectedKidId(e.target.value)}
                    style={{ width: 'auto', minWidth: '200px' }}
                  >
                    {kids.map(k => (
                      <option key={k.id} value={k.id}>{k.name} - {k.admissionNo}</option>
                    ))}
                  </select>
                </div>

                {selectedKid && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <img 
                          src={selectedKid.photoUrl || `https://ui-avatars.com/api/?name=${selectedKid.name}&background=random`} 
                          alt={selectedKid.name} 
                          style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedKid.name}</h3>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{selectedKid.age} | {selectedKid.classroom?.name}</span>
                        </div>
                      </div>

                      <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Parent Name</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedKid.parent?.user?.name}</span>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Admission No</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedKid.admissionNo}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.95rem' }}>Developmental Milestones</h4>
                      {selectedKid.milestones && selectedKid.milestones.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {selectedKid.milestones.map((ms, i) => (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ms.name}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{ms.progress}%</span>
                              </div>
                              <div className="progress-bar-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                <div className="progress-bar-fill" style={{ width: `${ms.progress}%`, background: COLORS[i % COLORS.length], height: '100%', borderRadius: '3px' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No milestones recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Reports;
