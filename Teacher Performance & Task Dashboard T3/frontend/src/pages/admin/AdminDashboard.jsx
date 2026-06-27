/* src/pages/admin/AdminDashboard.jsx */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Users, CheckSquare, ShieldCheck, AlertCircle, 
  TrendingUp, TrendingDown, ArrowRight, Award, School 
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import CountUp from '../../components/CountUp';
import { 
  mockTeachers, mockChildren, mockTasks, attendanceTrendData, 
  taskCompletionData, complianceOverviewData, performanceDistributionData 
} from '../../data/mockData';
import { adminAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import '../../styles/pages.css';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const AdminDashboard = () => {
  const { success } = useNotifications();
  const [dashboardData, setDashboardData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statsRes = await adminAPI.getDashboardStats().catch(e => { throw e; });
      if (statsRes.data && statsRes.data.success) {
        setDashboardData(statsRes.data.data);
      }
      
      const teachersRes = await adminAPI.getTeachers().catch(e => { throw e; });
      if (teachersRes.data && teachersRes.data.success) {
        const mapped = teachersRes.data.data.map(t => ({
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
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("API failed. Using mock data fallback (Development Mode).");
        setTeachers(mockTeachers);
      } else {
        setError('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const totalTeachers = dashboardData?.stats?.totalTeachers ?? mockTeachers.length;
  const totalStudents = dashboardData?.stats?.totalStudents ?? 320; 
  const averageAttendance = dashboardData?.stats?.attendanceRate ?? 94.2;
  const pendingTasksCount = dashboardData?.stats?.totalTasks ?? mockTasks.filter(t => t.status !== 'completed').length;
  const overdueTasksCount = mockTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length;
  const curriculumCoverage = dashboardData?.stats?.avgCompliance ?? 95.8;

  const latestTeacherRegNo = dashboardData?.stats?.latestTeacherRegNo || 
    (teachers.length > 0 ? [...teachers].reverse().find(t => t.teacherRegNo)?.teacherRegNo : null) || 
    (mockTeachers.length > 0 ? [...mockTeachers].reverse().find(t => t.teacherRegNo)?.teacherRegNo : null) ||
    '26EMP1001';

  const latestEmployeeId = dashboardData?.stats?.latestEmployeeId || 
    (teachers.length > 0 ? [...teachers].reverse().find(t => t.employeeId)?.employeeId : null) || 
    (mockTeachers.length > 0 ? [...mockTeachers].reverse().find(t => t.employeeId)?.employeeId : null) ||
    '26EMP0001';

  const latestAdmissionNo = dashboardData?.stats?.latestAdmissionNo || 
    (mockChildren.length > 0 ? [...mockChildren].reverse().find(c => c.admissionNo)?.admissionNo : null) ||
    '26ADM0001';

  const latestStudentRegNo = dashboardData?.stats?.latestStudentRegNo || 
    (mockChildren.length > 0 ? [...mockChildren].reverse().find(c => c.studentRegNo)?.studentRegNo : null) ||
    '26STU0001';

  const kpis = [
    { title: 'Total Teachers', value: totalTeachers, suffix: '', trend: '+2 this month', isUp: true, icon: Users, delay: 0 },
    { title: 'Total Students', value: totalStudents, suffix: '', trend: '+15 this term', isUp: true, icon: School, delay: 0.1 },
    { title: 'Teacher Attendance', value: averageAttendance, suffix: '%', trend: '+0.5% vs last week', isUp: true, icon: TrendingUp, delay: 0.2 },
    { title: 'Pending Tasks', value: pendingTasksCount, suffix: '', trend: '-3 since yesterday', isUp: false, icon: CheckSquare, delay: 0.3 },
    { title: 'Overdue Tasks', value: overdueTasksCount, suffix: '', trend: '+1 since Monday', isUp: false, icon: AlertCircle, delay: 0.4 },
    { title: 'Curriculum Coverage', value: curriculumCoverage, suffix: '%', trend: '+1.2% ahead', isUp: true, icon: ShieldCheck, delay: 0.5 }
  ];

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GlassCard style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Connection Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>{error}</p>
          <button className="primary-btn" onClick={fetchData} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Try Again <ArrowRight size={16} />
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="kpi-grid">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={index} delay={kpi.delay} className="kpi-card">
              <div className="kpi-details">
                <h3>{kpi.title}</h3>
                <div className="kpi-value">
                  <CountUp value={kpi.value} suffix={kpi.suffix} />
                </div>
                <span className={`kpi-trend ${kpi.isUp ? 'up' : 'down'}`}>
                  {kpi.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend}
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <Icon size={24} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard delay={0.1} style={{ marginBottom: '20px' }}>
        <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px', marginBottom: '15px' }}>
          <span>ERP System Information Panel</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>System Identifiers & Registry Logs</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '12px 15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Latest Teacher Registration
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                {latestTeacherRegNo}
              </strong>
              <button
                onClick={() => { navigator.clipboard.writeText(latestTeacherRegNo); success('Copied successfully'); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                title="Copy Registration Number"
              >
                📋
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '12px 15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Latest Employee ID
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                {latestEmployeeId}
              </strong>
              <button
                onClick={() => { navigator.clipboard.writeText(latestEmployeeId); success('Copied successfully'); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                title="Copy Employee ID"
              >
                📋
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '12px 15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Latest Student Admission
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--secondary)' }}>
                {latestAdmissionNo}
              </strong>
              <button
                onClick={() => { navigator.clipboard.writeText(latestAdmissionNo); success('Copied successfully'); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                title="Copy Admission Number"
              >
                📋
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '12px 15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Latest Student Registration
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--secondary)' }}>
                {latestStudentRegNo}
              </strong>
              <button
                onClick={() => { navigator.clipboard.writeText(latestStudentRegNo); success('Copied successfully'); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                title="Copy Registration Number"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="dashboard-charts-grid">
        <GlassCard delay={0.2}>
          <div className="chart-card-title">
            <span>Teacher & Student Attendance Trend</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Weekly View</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.attendanceTrendData ?? attendanceTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', backdropFilter: 'blur(10px)', color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} />
                <Line type="monotone" dataKey="Teachers" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Students" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="chart-card-title">
            <span>Task Completion Rate</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Monthly History</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.taskCompletionData ?? taskCompletionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', backdropFilter: 'blur(10px)', color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                <Bar dataKey="Completed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Overdue" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="dashboard-charts-grid">
        <GlassCard delay={0.4}>
          <div className="chart-card-title">
            <span>Compliance Audit Score</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Topic Breakdown</span>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '55%', height: '100%' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', backdropFilter: 'blur(10px)', color: 'var(--text-primary)' }} />
                  <Pie
                    data={dashboardData?.complianceOverviewData ?? complianceOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(dashboardData?.complianceOverviewData ?? complianceOverviewData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '10px' }}>
              {(dashboardData?.complianceOverviewData ?? complianceOverviewData).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'inline-block' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}: <strong>{item.value}%</strong></span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <div className="chart-card-title">
            <span>Teacher Performance Distribution</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Score Tiers</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData?.performanceDistributionData ?? performanceDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                <XAxis dataKey="score" stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '0.8rem' }} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', backdropFilter: 'blur(10px)', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Teachers Performance Table */}
      <GlassCard delay={0.6} className="dashboard-table-card">
        <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '15px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} />
            Teacher Performance & Summary
          </span>
        </div>
        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Assigned Class</th>
                <th>Shift Details</th>
                <th>Attendance</th>
                <th>Compliance</th>
                <th>Performance Score</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="profile-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                        {teacher.avatar}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{teacher.name}</span>
                    </div>
                  </td>
                  <td>{teacher.assignedClass}</td>
                  <td>{teacher.shiftTime}</td>
                  <td>
                    <span className="badge success">{teacher.attendance}%</span>
                  </td>
                  <td>{teacher.complianceScore}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '100px', height: '8px', background: 'var(--divider)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${teacher.performance}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
                      </div>
                      <strong style={{ color: 'var(--text-primary)' }}>{teacher.performance}/100</strong>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;
