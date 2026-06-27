/* src/pages/admin/AdminManageUsers.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { refreshMockData, mockTeachers as mockTeachersImported, mockChildren as mockChildrenImported, mockAccounts } from '../../data/mockData';
import { adminAPI } from '../../services/api';
import { Users, UserPlus, Trash2, Edit2, X, Check, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import '../../styles/pages.css';

const AdminManageUsers = () => {
  const { success, error, warning } = useNotifications();
  const [activeTab, setActiveTab] = useState('teacher');
  const [searchTerm, setSearchTerm] = useState('');

  // API Integration States
  const [teachers, setTeachers] = useState([]);
  const [rawTeachers, setRawTeachers] = useState([]);
  const [children, setChildren] = useState([]);
  const [classroomsMap, setClassroomsMap] = useState({});
  const [classroomOptions, setClassroomOptions] = useState([]);

  const mockTeachers = teachers.length > 0 ? teachers : mockTeachersImported;
  const mockChildren = children.length > 0 ? children : mockChildrenImported;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // stores { user, type }

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedClass, setAssignedClass] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [teacherRegNo, setTeacherRegNo] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      // Fetch teachers
      const resTeachers = await adminAPI.getTeachers();
      let mappedTeachers = [];
      const cmap = {};
      if (resTeachers.data && resTeachers.data.success) {
        setRawTeachers(resTeachers.data.data);
        mappedTeachers = resTeachers.data.data.map(t => ({
          id: t.id,
          name: t.user.name,
          email: t.user.email,
          avatar: t.avatar || t.user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
          assignedClass: t.classroom ? t.classroom.name : 'Unassigned',
          shiftTime: t.shiftTime || '08:00 AM - 02:00 PM',
          roomNumber: t.classroom ? t.classroom.roomNumber : 'N/A',
          performance: t.performance || 90,
          attendance: t.attendance || 95,
          tasksCompleted: 0,
          complianceScore: t.complianceScore || 90,
          teacherRegNo: t.teacherRegNo,
          employeeId: t.employeeId,
          classroomId: t.classroom ? t.classroom.id : ''
        }));
        setTeachers(mappedTeachers);
        
        resTeachers.data.data.forEach(t => {
          if (t.classroom) {
            cmap[t.classroom.name.toLowerCase()] = t.classroom.id;
          }
        });
        setClassroomsMap(cmap);
      }

      // Fetch classrooms
      try {
        const resClassrooms = await adminAPI.getClassrooms();
        if (resClassrooms.data && resClassrooms.data.success) {
          setClassroomOptions(resClassrooms.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch classrooms', err);
      }

      // Fetch students
      const resStudents = await adminAPI.getStudents();
      if (resStudents.data && resStudents.data.success) {
        const mappedChildren = resStudents.data.data.map(s => ({
          id: s.id,
          parentId: s.parentId,
          name: s.name,
          avatar: s.avatar || s.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
          age: s.age || '3 Years',
          assignedClass: s.classroom ? s.classroom.name : 'Unassigned',
          parentName: s.parent ? s.parent.user.name : 'Unknown Parent',
          parentContact: s.parent ? (s.parent.parentContact || s.parent.user.phone || '') : '',
          email: s.parent ? s.parent.user.email : '',
          mood: s.mood || 'Happy',
          milestones: s.milestones,
          photos: s.photos,
          timeline: s.timeline,
          studentRegNo: s.studentRegNo,
          admissionNo: s.admissionNo
        }));
        setChildren(mappedChildren);
      }
    } catch (err) {
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.warn("Failed to fetch data from API, using mock fallbacks (Dev Mode)", err);
        setTeachers(mockTeachersImported);
        setChildren(mockChildrenImported);
      } else {
        setErrorState('Unable to connect to the server. Please try again later or contact your system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMockData();
    fetchData();
  }, []);

  // Sync Assigned Teacher default selection when modal opens
  useEffect(() => {
    if (mockTeachers.length > 0 && !assignedTeacherId) {
      setAssignedTeacherId(mockTeachers[0].id);
    }
  }, [showAddModal, mockTeachers]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showAddModal || editingUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, editingUser]);

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setEditingUser(null);
        resetForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isFormDirty = () => {
    return name.trim() !== '' || 
           email.trim() !== '' || 
           password.trim() !== '' || 
           phone.trim() !== '' || 
           assignedClass.trim() !== '' || 
           childName.trim() !== '' || 
           childAge.trim() !== '' ||
           studentRegNo.trim() !== '' ||
           admissionNo.trim() !== '';
  };

  const isEditFormDirty = () => {
    if (!editingUser) return false;
    const { user, type } = editingUser;
    const initialName = type === 'teacher' ? user.name : user.parentName;
    const initialEmail = user.email;
    const initialPhone = type === 'parent' ? user.parentContact : '';
    const initialClass = type === 'teacher' ? user.assignedClass : '';
    const initialChildName = type === 'parent' ? user.name : '';
    const initialChildAge = type === 'parent' ? user.age : '';
    const initialTeacherRegNo = type === 'teacher' ? (user.teacherRegNo || '') : '';
    const initialEmployeeId = type === 'teacher' ? (user.employeeId || '') : '';
    const initialStudentRegNo = type === 'parent' ? (user.studentRegNo || '') : '';
    const initialAdmissionNo = type === 'parent' ? (user.admissionNo || '') : '';

    return name !== initialName ||
           email !== initialEmail ||
           password !== '' ||
           phone !== initialPhone ||
           assignedClass !== initialClass ||
           childName !== initialChildName ||
           childAge !== initialChildAge ||
           teacherRegNo !== initialTeacherRegNo ||
           employeeId !== initialEmployeeId ||
           studentRegNo !== initialStudentRegNo ||
           admissionNo !== initialAdmissionNo;
  };

  const handleCloseModals = (force = false) => {
    if (!force) {
      const dirty = editingUser ? isEditFormDirty() : isFormDirty();
      if (dirty) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
          return;
        }
      }
    }
    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModals(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAssignedClass('');
    setClassroomId('');
    setChildName('');
    setChildAge('');
    setTeacherRegNo('');
    setEmployeeId('');
    setStudentRegNo('');
    setAdmissionNo('');
    if (mockTeachers.length > 0) {
      setAssignedTeacherId(mockTeachers[0].id);
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const validateForm = () => {
    if (!name.trim()) {
      error('Validation Error', 'Name is required.');
      return false;
    }
    if (!email.trim()) {
      error('Validation Error', 'Email is required.');
      return false;
    }
    if (!editingUser && !password) {
      error('Validation Error', 'Password is required.');
      return false;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      error('Validation Error', 'Please enter a valid email address.');
      return false;
    }

    // Check duplicate email
    const emailLower = email.trim().toLowerCase();
    const isEditingThisEmail = editingUser && editingUser.user.email.toLowerCase() === emailLower;
    
    if (!isEditingThisEmail) {
      const emailExists = mockAccounts.some(acc => acc.email.toLowerCase() === emailLower);
      if (emailExists) {
        error('Duplicate Account', 'An account with this email address already exists.');
        return false;
      }
    }

    return true;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const emailTrimmed = email.trim();
    const nameTrimmed = name.trim();

    try {
      if (activeTab === 'teacher') {
        if (!classroomId) {
          error('Validation Error', 'Please select an assigned class.');
          return;
        }
        await adminAPI.createTeacher({
          email: emailTrimmed,
          password: password,
          name: nameTrimmed,
          phone: phone.trim(),
          classroomId: classroomId,
          shiftTime: '08:00 AM - 02:00 PM',
          avatar: nameTrimmed.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          teacherRegNo: teacherRegNo.trim() || undefined,
          employeeId: employeeId.trim() || undefined
        });
        success('Teacher Registered', `Created account and teacher profile for ${nameTrimmed}.`);
      } else {
        // Parent
        const resParent = await adminAPI.createParent({
          email: emailTrimmed,
          password: password,
          name: nameTrimmed,
          phone: phone.trim(),
          parentContact: phone.trim()
        });

        if (resParent.data && resParent.data.success) {
          const parentId = resParent.data.data.id;
          
          // Find selected teacher classroomId
          const teacherObj = rawTeachers.find(t => t.id === assignedTeacherId);
          const classroomId = teacherObj?.classroomId || null;

          await adminAPI.createStudent({
            name: childName.trim(),
            age: childAge.trim(),
            teacherId: assignedTeacherId,
            parentId: parentId,
            avatar: childName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            studentRegNo: studentRegNo.trim() || undefined,
            admissionNo: admissionNo.trim() || undefined
          });
          success('Parent Registered', `Created account for parent ${nameTrimmed} and child ${childName.trim()}.`);
        }
      }
      fetchData();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      if (err.response) {
        error('Registration Failed', err.response.data?.message || 'Validation error');
        return;
      }
      console.warn("Failed to add user via API. Falling back to local state.", err);
      // Fallback
      if (activeTab === 'teacher') {
        const newUser = {
          email: emailTrimmed,
          password: password,
          role: 'teacher',
          name: nameTrimmed
        };

        const localTeachers = JSON.parse(localStorage.getItem('localTeachers') || '[]');
        const allTeachers = [...mockTeachersImported, ...localTeachers];
        
        let finalRegNo = teacherRegNo.trim();
        if (!finalRegNo) {
          const nextIndex = allTeachers.length + 1;
          finalRegNo = `26EMP${1000 + nextIndex}`;
        }
        let finalEmpId = employeeId.trim();
        if (!finalEmpId) {
          const nextIndex = allTeachers.length + 1;
          finalEmpId = `26EMP${String(nextIndex).padStart(4, '0')}`;
        }

        const newTeacherEntity = {
          id: `t_${Date.now()}`,
          name: nameTrimmed,
          avatar: nameTrimmed.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          assignedClass: assignedClass.trim() || 'Unassigned',
          shiftTime: '08:00 AM - 02:00 PM',
          roomNumber: 'Room ' + Math.floor(Math.random() * 200 + 101),
          email: emailTrimmed,
          performance: 90,
          attendance: 95,
          tasksCompleted: 0,
          complianceScore: 90,
          teacherRegNo: finalRegNo,
          employeeId: finalEmpId
        };
        
        localStorage.setItem('localUsers', JSON.stringify([...JSON.parse(localStorage.getItem('localUsers') || '[]'), newUser]));
        localStorage.setItem('localTeachers', JSON.stringify([...localTeachers, newTeacherEntity]));

        success('Teacher Registered (Offline)', `Created account and teacher profile for ${nameTrimmed}.`);
      } else {
        const newUser = {
          email: emailTrimmed,
          password: password,
          role: 'parent',
          name: nameTrimmed
        };

        const selectedTeacher = mockTeachers.find(t => t.id === assignedTeacherId) || mockTeachers[0];

        const localChildren = JSON.parse(localStorage.getItem('localChildren') || '[]');
        const allChildren = [...mockChildrenImported, ...localChildren];

        let finalRegNo = studentRegNo.trim();
        if (!finalRegNo) {
          const nextIndex = allChildren.length + 1;
          finalRegNo = `FCI260001${String(nextIndex).padStart(3, '0')}`;
        }
        let finalAdmissionNo = admissionNo.trim();
        if (!finalAdmissionNo) {
          const nextIndex = allChildren.length + 1;
          finalAdmissionNo = `261FC${10000 + nextIndex}`;
        }

        const newChildEntity = {
          id: `c_${Date.now()}`,
          name: childName.trim() || 'Unnamed Child',
          avatar: (childName.trim() || 'Unnamed Child').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          age: childAge.trim() || '3 Years',
          assignedClass: selectedTeacher ? selectedTeacher.assignedClass : 'Playgroup A',
          parentName: nameTrimmed,
          parentContact: phone.trim() || '+91 98765 43210',
          mood: 'Happy',
          milestones: [
            { name: 'Language & Speech', progress: 75 },
            { name: 'Fine Motor Skills', progress: 75 },
            { name: 'Social Interaction', progress: 75 },
            { name: 'Cognitive Ability', progress: 75 }
          ],
          photos: [
            { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&fit=crop', caption: 'Art Class - Finger Painting' }
          ],
          timeline: [
            { time: '08:30 AM', event: 'Arrival', desc: 'Checked in by parent.' }
          ],
          studentRegNo: finalRegNo,
          admissionNo: finalAdmissionNo
        };

        localStorage.setItem('localUsers', JSON.stringify([...JSON.parse(localStorage.getItem('localUsers') || '[]'), newUser]));
        localStorage.setItem('localChildren', JSON.stringify([...localChildren, newChildEntity]));

        success('Parent Registered (Offline)', `Created account for parent ${nameTrimmed} and child ${newChildEntity.name}.`);
      }

      refreshMockData();
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleEditClick = (user, type) => {
    setEditingUser({ user, type });
    setName(type === 'teacher' ? user.name : user.parentName);
    setEmail(user.email);
    setPhone(type === 'parent' ? user.parentContact : '');
    setAssignedClass(type === 'teacher' ? user.assignedClass : '');
    setClassroomId(type === 'teacher' ? (user.classroomId || '') : '');
    setChildName(type === 'parent' ? user.name : '');
    setChildAge(type === 'parent' ? user.age : '');
    setTeacherRegNo(type === 'teacher' ? (user.teacherRegNo || '') : '');
    setEmployeeId(type === 'teacher' ? (user.employeeId || '') : '');
    setStudentRegNo(type === 'parent' ? (user.studentRegNo || '') : '');
    setAdmissionNo(type === 'parent' ? (user.admissionNo || '') : '');
    
    if (type === 'parent') {
      const selectedT = mockTeachers.find(t => t.assignedClass === user.assignedClass);
      setAssignedTeacherId(selectedT ? selectedT.id : (mockTeachers[0]?.id || ''));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const emailTrimmed = email.trim();
    const nameTrimmed = name.trim();
    const { user, type } = editingUser;

    try {
      if (type === 'teacher') {
        if (!classroomId) {
          error('Validation Error', 'Please select an assigned class.');
          return;
        }
        await adminAPI.updateTeacher(user.id, {
          email: emailTrimmed,
          name: nameTrimmed,
          phone: phone.trim(),
          classroomId: classroomId,
        });
        success('Teacher Updated', `Saved profile details for ${nameTrimmed}.`);
      } else {
        await adminAPI.updateParent(user.parentId, {
          email: emailTrimmed,
          name: nameTrimmed,
          phone: phone.trim(),
          parentContact: phone.trim()
        });

        const teacherObj = rawTeachers.find(t => t.id === assignedTeacherId);
        const classroomId = teacherObj?.classroomId || null;

        await adminAPI.updateStudent(user.id, {
          name: childName.trim(),
          age: childAge.trim(),
          teacherId: assignedTeacherId,
          parentId: user.parentId,
          studentRegNo: studentRegNo.trim(),
          admissionNo: admissionNo.trim()
        });
        success('Parent Updated', `Saved child and parent profiles for ${nameTrimmed}.`);
      }
      fetchData();
      setEditingUser(null);
      resetForm();
    } catch (err) {
      console.warn("Failed to update user via API. Falling back to local state.", err);
      // Fallback
      const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const editedAccounts = JSON.parse(localStorage.getItem('editedAccounts') || '[]');
      const userIsLocal = localUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());

      if (userIsLocal) {
        const updatedLocalUsers = localUsers.map(u => {
          if (u.email.toLowerCase() === user.email.toLowerCase()) {
            const updated = { ...u, name: nameTrimmed, email: emailTrimmed };
            if (password) updated.password = password;
            return updated;
          }
          return u;
        });
        localStorage.setItem('localUsers', JSON.stringify(updatedLocalUsers));
      } else {
        const editRecord = { email: user.email, name: nameTrimmed, newEmail: emailTrimmed };
        if (password) editRecord.password = password;
        
        const filteredEdits = editedAccounts.filter(ea => ea.email.toLowerCase() !== user.email.toLowerCase());
        localStorage.setItem('editedAccounts', JSON.stringify([...filteredEdits, editRecord]));
      }

      if (type === 'teacher') {
        const localTeachers = JSON.parse(localStorage.getItem('localTeachers') || '[]');
        const editedTeachers = JSON.parse(localStorage.getItem('editedTeachers') || '[]');
        const teacherIsLocal = localTeachers.some(t => t.id === user.id);

        const updatedFields = {
          name: nameTrimmed,
          email: emailTrimmed,
          assignedClass: assignedClass.trim() || 'Unassigned'
        };

        if (teacherIsLocal) {
          const updatedLocal = localTeachers.map(t => t.id === user.id ? { ...t, ...updatedFields } : t);
          localStorage.setItem('localTeachers', JSON.stringify(updatedLocal));
        } else {
          const filteredEdits = editedTeachers.filter(et => et.id !== user.id);
          localStorage.setItem('editedTeachers', JSON.stringify([...filteredEdits, { id: user.id, ...updatedFields }]));
        }
        success('Teacher Updated (Offline)', `Saved profile details for ${nameTrimmed}.`);
      } else {
        const localChildren = JSON.parse(localStorage.getItem('localChildren') || '[]');
        const editedChildren = JSON.parse(localStorage.getItem('editedChildren') || '[]');
        const childIsLocal = localChildren.some(c => c.id === user.id);

        const selectedTeacher = mockTeachers.find(t => t.id === assignedTeacherId) || mockTeachers[0];

        const updatedFields = {
          name: childName.trim() || user.name,
          age: childAge.trim() || user.age,
          assignedClass: selectedTeacher ? selectedTeacher.assignedClass : 'Playgroup A',
          parentName: nameTrimmed,
          parentContact: phone.trim() || user.parentContact,
          studentRegNo: studentRegNo.trim(),
          admissionNo: admissionNo.trim()
        };

        if (childIsLocal) {
          const updatedLocal = localChildren.map(c => c.id === user.id ? { ...c, ...updatedFields } : c);
          localStorage.setItem('localChildren', JSON.stringify(updatedLocal));
        } else {
          const filteredEdits = editedChildren.filter(ec => ec.id !== user.id);
          localStorage.setItem('editedChildren', JSON.stringify([...filteredEdits, { id: user.id, ...updatedFields }]));
        }
        success('Parent Updated (Offline)', `Saved child and parent profiles for ${nameTrimmed}.`);
      }

      refreshMockData();
      setEditingUser(null);
      resetForm();
    }
  };

  const handleDeleteClick = async (user, type) => {
    const isConfirm = window.confirm(`Are you sure you want to delete ${type === 'teacher' ? 'Teacher ' + user.name : 'Parent ' + user.parentName}?`);
    if (!isConfirm) return;

    try {
      if (type === 'teacher') {
        await adminAPI.deleteTeacher(user.id);
        warning('Teacher Deleted', `Removed teacher profile and account.`);
      } else {
        await adminAPI.deleteParent(user.parentId);
        await adminAPI.deleteStudent(user.id);
        warning('Parent Deleted', `Removed parent account and child profile.`);
      }
      fetchData();
    } catch (err) {
      console.warn("Failed to delete user via API. Falling back to local state.", err);
      // Fallback
      const emailLower = user.email.toLowerCase();
      const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const deletedAccountEmails = JSON.parse(localStorage.getItem('deletedAccountEmails') || '[]');
      const userIsLocal = localUsers.some(u => u.email.toLowerCase() === emailLower);

      if (userIsLocal) {
        const updatedLocal = localUsers.filter(u => u.email.toLowerCase() !== emailLower);
        localStorage.setItem('localUsers', JSON.stringify(updatedLocal));
      } else {
        if (!deletedAccountEmails.includes(emailLower)) {
          localStorage.setItem('deletedAccountEmails', JSON.stringify([...deletedAccountEmails, emailLower]));
        }
      }

      if (type === 'teacher') {
        const localTeachers = JSON.parse(localStorage.getItem('localTeachers') || '[]');
        const deletedTeacherIds = JSON.parse(localStorage.getItem('deletedTeacherIds') || '[]');
        const teacherIsLocal = localTeachers.some(t => t.id === user.id);

        if (teacherIsLocal) {
          const updatedLocal = localTeachers.filter(t => t.id !== user.id);
          localStorage.setItem('localTeachers', JSON.stringify(updatedLocal));
        } else {
          if (!deletedTeacherIds.includes(user.id)) {
            localStorage.setItem('deletedTeacherIds', JSON.stringify([...deletedTeacherIds, user.id]));
          }
        }
        warning('Teacher Deleted (Offline)', `Removed teacher profile and account.`);
      } else {
        const localChildren = JSON.parse(localStorage.getItem('localChildren') || '[]');
        const deletedChildIds = JSON.parse(localStorage.getItem('deletedChildIds') || '[]');
        const childIsLocal = localChildren.some(c => c.id === user.id);

        if (childIsLocal) {
          const updatedLocal = localChildren.filter(c => c.id !== user.id);
          localStorage.setItem('localChildren', JSON.stringify(updatedLocal));
        } else {
          if (!deletedChildIds.includes(user.id)) {
            localStorage.setItem('deletedChildIds', JSON.stringify([...deletedChildIds, user.id]));
          }
        }
        warning('Parent Deleted (Offline)', `Removed parent account and child profile.`);
      }

      refreshMockData();
    }
  };

  const filteredTeachers = mockTeachers.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.assignedClass.toLowerCase().includes(q) ||
      (t.teacherRegNo && t.teacherRegNo.toLowerCase().includes(q)) ||
      (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q))
    );
  });

  const filteredParents = mockChildren.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.parentName.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.studentRegNo && c.studentRegNo.toLowerCase().includes(q)) ||
      (c.admissionNo && c.admissionNo.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Loading Users...</p>
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
          <button className="primary-btn" onClick={fetchData} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Search & Actions bar */}
      <div className="roster-header-bar" style={{ flexWrap: 'wrap', gap: '15px' }}>
        {/* Toggle tabs */}
        <div className="login-tabs" style={{ marginBottom: 0 }}>
          <button
            className={`login-tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('teacher');
              setSearchTerm('');
            }}
            style={{ minWidth: '130px' }}
          >
            Teachers
          </button>
          <button
            className={`login-tab-btn ${activeTab === 'parent' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('parent');
              setSearchTerm('');
            }}
            style={{ minWidth: '130px' }}
          >
            Parents
          </button>
        </div>

        {/* Search & Add */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '260px', background: 'rgba(255,255,255,0.15)' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder={activeTab === 'teacher' ? 'Search by name, class, reg no, emp ID...' : 'Search by name, reg no, adm no...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            onClick={handleOpenAddModal}
            className="btn-premium"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <UserPlus size={16} /> Add {activeTab === 'teacher' ? 'Teacher' : 'Parent'}
          </motion.button>
        </div>
      </div>

      {/* List Table */}
      <GlassCard className="dashboard-table-card">
        <div className="table-wrapper">
          {activeTab === 'teacher' ? (
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Email</th>
                  <th>Assigned Class</th>
                  <th>Room</th>
                  <th>Performance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((tch) => (
                  <tr key={tch.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="profile-avatar" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                          {tch.avatar}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tch.name}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            Reg No: {tch.teacherRegNo || 'N/A'} • Emp ID: {tch.employeeId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{tch.email}</td>
                    <td><span className="badge info">{tch.assignedClass}</span></td>
                    <td>{tch.roomNumber}</td>
                    <td><strong>{tch.performance}%</strong></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleEditClick(tch, 'teacher')}
                          style={{ color: 'var(--primary)', padding: '6px' }}
                          title="Edit Profile"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tch, 'teacher')}
                          style={{ color: 'var(--danger)', padding: '6px' }}
                          title="Delete Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No teacher records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Parent Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Child Name</th>
                  <th>Age</th>
                  <th>Class / Teacher</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((kid) => {
                  const parentEmail = kid.id === 'c1' ? 'neha@gmail.com' : kid.id === 'c2' ? 'nani@gmail.com' : kid.email || 'parent.comm@intellitots.com';
                  return (
                    <tr key={kid.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{kid.parentName}</span>
                      </td>
                      <td>{parentEmail}</td>
                      <td>{kid.parentContact}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="profile-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: 'var(--secondary)30' }}>
                            {kid.avatar}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{kid.name}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                              Reg No: {kid.studentRegNo || 'N/A'} • Adm No: {kid.admissionNo || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{kid.age}</td>
                      <td>
                        <span className="badge success">{kid.assignedClass}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleEditClick(kid, 'parent')}
                            style={{ color: 'var(--primary)', padding: '6px' }}
                            title="Edit Profile"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(kid, 'parent')}
                            style={{ color: 'var(--danger)', padding: '6px' }}
                            title="Delete Account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredParents.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No parent records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <motion.div
              className="modal-content glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px' }}>
                <span>Add New {activeTab === 'teacher' ? 'Teacher Account' : 'Parent Account'}</span>
                <button 
                  type="button" 
                  onClick={() => handleCloseModals(true)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--text-secondary)',
                    transition: 'color var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div className="login-form-group">
                  <label>{activeTab === 'teacher' ? 'Teacher Name' : 'Parent Name'}</label>
                  <input
                    type="text"
                    className="input-glass"
                    required
                    placeholder="Enter full name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="input-glass"
                    required
                    placeholder="Enter email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="input-glass"
                    required
                    placeholder="Set account password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="E.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {activeTab === 'teacher' ? (
                  <div className="login-form-group">
                    <label>Assigned Class</label>
                    <select
                      className="input-glass"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    >
                      <option value="">-- Select Classroom --</option>
                      {classroomOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.roomNumber}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="routine-input-row">
                      <div className="login-form-group">
                        <label>Child Name</label>
                        <input
                          type="text"
                          className="input-glass"
                          placeholder="Enter child full name..."
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                        />
                      </div>

                      <div className="login-form-group">
                        <label>Child Age</label>
                        <input
                          type="text"
                          className="input-glass"
                          placeholder="E.g. 3 Years, 2 Months"
                          value={childAge}
                          onChange={(e) => setChildAge(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="routine-input-row">
                      <div className="login-form-group">
                        <label>Registration Number</label>
                        <input
                          type="text"
                          className="input-glass"
                          placeholder="Registration number (optional)..."
                          value={studentRegNo}
                          onChange={(e) => setStudentRegNo(e.target.value)}
                        />
                      </div>

                      <div className="login-form-group">
                        <label>Admission Number</label>
                        <input
                          type="text"
                          className="input-glass"
                          placeholder="Admission number (optional)..."
                          value={admissionNo}
                          onChange={(e) => setAdmissionNo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label>Assigned Class Teacher</label>
                      <select
                        className="input-glass"
                        value={assignedTeacherId}
                        onChange={(e) => setAssignedTeacherId(e.target.value)}
                      >
                        {mockTeachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} - {t.assignedClass} - {t.teacherRegNo}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '15px', borderTop: '1px solid var(--divider)', paddingTop: '15px' }}>
                  <motion.button
                    type="button"
                    className="btn-glass"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    onClick={() => handleCloseModals(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-premium"
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Check size={16} style={{ marginRight: '6px' }} /> Register Account
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <motion.div
              className="modal-content glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="chart-card-title" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '10px' }}>
                <span>Edit {editingUser.type === 'teacher' ? 'Teacher' : 'Parent'} Details</span>
                <button 
                  type="button"
                  onClick={() => handleCloseModals(true)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--text-secondary)',
                    transition: 'color var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div className="login-form-group">
                  <label>{editingUser.type === 'teacher' ? 'Teacher Name' : 'Parent Name'}</label>
                  <input
                    type="text"
                    className="input-glass"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="input-glass"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label>Change Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="Enter new password if changing..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {editingUser.type === 'teacher' ? (
                  <div className="login-form-group">
                    <label>Assigned Class</label>
                    <select
                      className="input-glass"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    >
                      <option value="">-- Select Classroom --</option>
                      {classroomOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.roomNumber}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="login-form-group">
                      <label>Phone Contact</label>
                      <input
                        type="text"
                        className="input-glass"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="routine-input-row">
                      <div className="login-form-group">
                        <label>Child Name</label>
                        <input
                          type="text"
                          className="input-glass"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                        />
                      </div>

                      <div className="login-form-group">
                        <label>Child Age</label>
                        <input
                          type="text"
                          className="input-glass"
                          value={childAge}
                          onChange={(e) => setChildAge(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="routine-input-row">
                      <div className="login-form-group">
                        <label>Registration Number</label>
                        <input
                          type="text"
                          className="input-glass"
                          value={studentRegNo}
                          onChange={(e) => setStudentRegNo(e.target.value)}
                        />
                      </div>

                      <div className="login-form-group">
                        <label>Admission Number</label>
                        <input
                          type="text"
                          className="input-glass"
                          value={admissionNo}
                          onChange={(e) => setAdmissionNo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label>Assigned Class Teacher</label>
                      <select
                        className="input-glass"
                        value={assignedTeacherId}
                        onChange={(e) => setAssignedTeacherId(e.target.value)}
                      >
                        {mockTeachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} - {t.assignedClass} - {t.teacherRegNo}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '15px', borderTop: '1px solid var(--divider)', paddingTop: '15px' }}>
                  <motion.button
                    type="button"
                    className="btn-glass"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    onClick={() => handleCloseModals(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-premium"
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Check size={16} style={{ marginRight: '6px' }} /> Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManageUsers;
