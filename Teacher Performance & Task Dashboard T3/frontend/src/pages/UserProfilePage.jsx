/* src/pages/UserProfilePage.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Shield, Calendar, Award, 
  Activity, ArrowLeft, BookOpen, Clock, Settings 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { mockTeachers, mockChildren } from '../data/mockData';
import '../styles/pages.css';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const activeRole = localStorage.getItem('activeRole') || 'parent';
  const userStr = localStorage.getItem('activeUser');

  // Determine initial profile
  let name = 'Active User';
  let email = 'user@intellitots.com';
  let phone = '+91 98765 43210';
  let joinDate = 'August 12, 2024';

  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.name) name = u.name;
      if (u.email) email = u.email;
      if (u.phone) phone = u.phone;
    } catch (e) {}
  } else {
    if (activeRole === 'admin') {
      name = 'Admin Deshmukh';
      email = 'vaitlabinnu@gmail.com';
    } else if (activeRole === 'teacher') {
      name = 'Prithika Sharma';
      email = 'prithika@gmail.com';
    } else {
      name = 'Neha Patel';
      email = 'neha@gmail.com';
    }
  }

  // Find dynamic role records
  let dynamicDetails = {};
  if (activeRole === 'admin') {
    dynamicDetails.designation = 'Head Administrator';
    dynamicDetails.joinDate = 'March 10, 2023';
    dynamicDetails.performance = [
      { label: 'System Compliance', value: '98.5%' },
      { label: 'Curriculum Audit Score', value: '4.9/5' },
      { label: 'Staff Task Completion', value: '94.2%' }
    ];
    dynamicDetails.activities = [
      { title: 'System Configuration Updated', desc: 'Synchronized duty roster checklist tasks.', time: '2 hours ago' },
      { title: 'School-Wide Alert Sent', desc: 'Dispatched sanitization schedule notice to all parent profiles.', time: 'Yesterday' },
      { title: 'Teacher Profile Added', desc: 'Approved credentials for Playgroup class assistant teacher.', time: '3 days ago' }
    ];
  } else if (activeRole === 'teacher') {
    const teacherDetails = mockTeachers.find(t => t.email.toLowerCase() === email.toLowerCase()) || mockTeachers[0];
    name = teacherDetails.name;
    phone = '+91 98123 45678';
    dynamicDetails.assignedClass = teacherDetails.assignedClass;
    dynamicDetails.joinDate = 'October 5, 2023';
    dynamicDetails.performance = [
      { label: 'Class Attendance Average', value: `${teacherDetails.attendance}%` },
      { label: 'Compliance Audit Score', value: `${teacherDetails.complianceScore}%` },
      { label: 'Evaluation Rating', value: `${teacherDetails.performance}/100` }
    ];
    dynamicDetails.activities = [
      { title: 'Milestone Progress Logs Added', desc: `Updated development notes for students in ${teacherDetails.assignedClass}.`, time: '1 hour ago' },
      { title: 'Attendance Report Saved', desc: 'Completed and verified morning entry logging.', time: '5 hours ago' },
      { title: 'Classroom Activity Uploaded', desc: 'Posted 3 new photos to child media carousels.', time: '1 day ago' }
    ];
  } else {
    // Parent
    const childDetails = mockChildren.find(c => c.parentName === name) || mockChildren[0];
    name = childDetails.parentName;
    phone = childDetails.parentContact;
    const teacherDetails = mockTeachers.find(t => t.assignedClass === childDetails.assignedClass);
    dynamicDetails.childName = childDetails.name;
    dynamicDetails.assignedTeacher = teacherDetails ? teacherDetails.name : 'Prithika Sharma';
    dynamicDetails.joinDate = 'January 18, 2024';
    dynamicDetails.performance = [
      { label: 'Child Attendance Rate', value: '96.2%' },
      { label: 'Activity Logs Viewed', value: '24 Entries' },
      { label: 'Teacher Notes Read', value: '100%' }
    ];
    dynamicDetails.activities = [
      { title: 'Daily Activity Logs Checked', desc: `Reviewed routine feed for ${childDetails.name}.`, time: '30 mins ago' },
      { title: 'Teacher Message Sent', desc: `Asked ${dynamicDetails.assignedTeacher} about the class project checklist.`, time: 'Yesterday' },
      { title: 'School Event Registration', desc: 'Confirmed attendance for parent-teacher weekend orientation.', time: '2 days ago' }
    ];
  }

  const getInitials = () => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (activeRole === 'admin') return 'Administrator';
    if (activeRole === 'teacher') return 'Class Teacher';
    return 'Parent Account';
  };

  const getRoleBadgeColor = () => {
    if (activeRole === 'admin') return 'rgba(139, 92, 246, 0.15)';
    if (activeRole === 'teacher') return 'rgba(236, 72, 153, 0.15)';
    return 'rgba(59, 130, 246, 0.15)';
  };

  return (
    <div className="page-container">
      {/* Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-secondary)', 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => {
            if (activeRole === 'admin') navigate('/settings');
            else if (activeRole === 'teacher') navigate('/teacher/profile');
            else navigate('/parent/profile');
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--primary)', 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <Settings size={16} /> Edit Settings
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Profile Card details */}
        <GlassCard delay={0}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: getRoleBadgeColor(),
              color: 'var(--text-primary)',
              fontSize: '2.25rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              border: '3px solid var(--card-border)',
              marginBottom: '16px'
            }}>
              {getInitials()}
            </div>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{name}</h2>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'var(--primary)', 
              background: getRoleBadgeColor(), 
              padding: '4px 12px', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {getRoleLabel()}
            </span>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--divider)', margin: '15px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Email Address</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Phone Number</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Account Created</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dynamicDetails.joinDate || joinDate}</div>
              </div>
            </div>

            {activeRole === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={16} style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Role Designation</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dynamicDetails.designation}</div>
                </div>
              </div>
            )}

            {activeRole === 'teacher' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={16} style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Assigned Class</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dynamicDetails.assignedClass}</div>
                </div>
              </div>
            )}

            {activeRole === 'parent' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={16} style={{ color: 'var(--text-tertiary)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Child Student</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dynamicDetails.childName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BookOpen size={16} style={{ color: 'var(--text-tertiary)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Assigned Mentor</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dynamicDetails.assignedTeacher}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Performance Summary Cards */}
          <GlassCard delay={0.1}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              <Award size={18} style={{ color: 'var(--primary)' }} />
              Performance & Session Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dynamicDetails.performance.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Activity Logs */}
          <GlassCard delay={0.2}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              <Activity size={18} style={{ color: 'var(--secondary)' }} />
              Recent Portal Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dynamicDetails.activities.map((act, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: index === 0 ? 'var(--primary)' : 'var(--divider)',
                      zIndex: 1
                    }}></div>
                    {index < dynamicDetails.activities.length - 1 && (
                      <div style={{ 
                        width: '2px', 
                        flex: 1, 
                        background: 'var(--divider)', 
                        margin: '4px 0' 
                      }}></div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {act.time}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
