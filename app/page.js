'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhfkkznbigrluumhvipw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZmtrem5iaWdybHV1bWh2aXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQ0MTUsImV4cCI6MjA5NjE1MDQxNX0.saHO8140W4Vp3cWiZjL2NiNIpupJvf0eWy_sz4speE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DIAS = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];

// Component gràfic
const DonutChart = ({ data }) => {
  const canvas = React.useRef(null);
  
  React.useEffect(() => {
    if (!canvas.current || !data.length) return;
    
    const ctx = canvas.current.getContext('2d');
    const centerX = 60, centerY = 60, radius = 50;
    const total = data.reduce((a, b) => a + b.value, 0);
    
    let currentAngle = -Math.PI / 2;
    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      currentAngle += sliceAngle;
    });
  }, [data]);
  
  return <canvas ref={canvas} width="120" height="120" style={{ maxWidth: '100%' }} />;
};

export default function MusicSchoolAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classTypes, setClassTypes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
    bank_account: '', bank_holder: '', bank_iban: '', active: true
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', phone: '', specialties: '', hourly_rate: '', bio: '', active: true
  });

  const [classTypeForm, setClassTypeForm] = useState({
    name: '', description: '', duration_minutes: 60
  });

  const [scheduleForm, setScheduleForm] = useState({
    student_id: '', teacher_id: '', classroom_id: '', class_type_id: '',
    day_of_week: 'Dilluns', start_time: '10:00', duration_minutes: 60
  });

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [s, t, ct, sch] = await Promise.all([
        supabase.from('students').select('*').order('first_name'),
        supabase.from('teachers').select('*').order('name'),
        supabase.from('class_types').select('*').order('name'),
        supabase.from('schedules').select('*')
      ]);

      setStudents(s.data || []);
      setTeachers(t.data || []);
      setClassTypes(ct.data || []);
      setSchedules(sch.data || []);
    } catch (err) {
      setError('Error carregant dades: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // CRUD ALUMNES
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supabase.from('students').update(formData).eq('id', editingId);
        setStudents(students.map(s => s.id === editingId ? { ...s, ...formData } : s));
        showSuccessMsg('✅ Alumne actualitzat!');
      } else {
        const { data } = await supabase.from('students').insert([formData]).select();
        if (data) setStudents([...students, data[0]]);
        showSuccessMsg('✅ Alumne afegit!');
      }
      setShowModal(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', bank_account: '', bank_holder: '', bank_iban: '', active: true });
      setEditingId(null);
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  const deleteStudent = async (id) => {
    if (!confirm('Eliminar alumne?')) return;
    try {
      await supabase.from('students').delete().eq('id', id);
      setStudents(students.filter(s => s.id !== id));
      showSuccessMsg('✅ Eliminat!');
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  // CRUD PROFESSORS
  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      const teacherData = { name: teacherForm.name, email: teacherForm.email, phone: teacherForm.phone, specialties: teacherForm.specialties, hourly_rate: parseFloat(teacherForm.hourly_rate) || 0, bio: teacherForm.bio, active: teacherForm.active };
      if (editingId) {
        const { error: updateError } = await supabase.from('teachers').update(teacherData).eq('id', editingId);
        if (updateError) throw updateError;
        setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...teacherData } : t));
        showSuccessMsg('✅ Professor actualitzat!');
      } else {
        const { data: newTeacher, error: insertError } = await supabase.from('teachers').insert([teacherData]).select();
        if (insertError) throw insertError;
        if (newTeacher?.length > 0) setTeachers([...teachers, newTeacher[0]]);
        showSuccessMsg('✅ Professor afegit!');
      }
      setShowModal(false);
      setTeacherForm({ name: '', email: '', phone: '', specialties: '', hourly_rate: '', bio: '', active: true });
      setEditingId(null);
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  const deleteTeacher = async (id) => {
    if (!confirm('Eliminar professor?')) return;
    try {
      await supabase.from('teachers').delete().eq('id', id);
      setTeachers(teachers.filter(t => t.id !== id));
      showSuccessMsg('✅ Eliminat!');
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  // CRUD CLASSES
  const handleSaveClassType = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supabase.from('class_types').update(classTypeForm).eq('id', editingId);
        setClassTypes(classTypes.map(ct => ct.id === editingId ? { ...ct, ...classTypeForm } : ct));
        showSuccessMsg('✅ Classe actualitzada!');
      } else {
        const { data } = await supabase.from('class_types').insert([classTypeForm]).select();
        if (data) setClassTypes([...classTypes, data[0]]);
        showSuccessMsg('✅ Classe afegida!');
      }
      setShowModal(false);
      setClassTypeForm({ name: '', description: '', duration_minutes: 60 });
      setEditingId(null);
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  const deleteClassType = async (id) => {
    if (!confirm('Eliminar classe?')) return;
    try {
      await supabase.from('class_types').delete().eq('id', id);
      setClassTypes(classTypes.filter(ct => ct.id !== id));
      showSuccessMsg('✅ Eliminat!');
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  // CRUD HORARIS
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const end_time = addMinutesToTime(scheduleForm.start_time, scheduleForm.duration_minutes);
      const data = { ...scheduleForm, end_time, active: true };
      if (editingId) {
        await supabase.from('schedules').update(data).eq('id', editingId);
        setSchedules(schedules.map(s => s.id === editingId ? { ...s, ...data } : s));
        showSuccessMsg('✅ Horari actualitzat!');
      } else {
        const { data: newSchedule } = await supabase.from('schedules').insert([data]).select();
        if (newSchedule) setSchedules([...schedules, newSchedule[0]]);
        showSuccessMsg('✅ Horari afegit!');
      }
      setShowModal(false);
      setScheduleForm({ student_id: '', teacher_id: '', classroom_id: '', class_type_id: '', day_of_week: 'Dilluns', start_time: '10:00', duration_minutes: 60 });
      setEditingId(null);
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  const addMinutesToTime = (time, minutes) => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const deleteSchedule = async (id) => {
    if (!confirm('Eliminar horari?')) return;
    try {
      await supabase.from('schedules').delete().eq('id', id);
      setSchedules(schedules.filter(s => s.id !== id));
      showSuccessMsg('✅ Eliminat!');
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  // HELPERS
  const getStudentName = (id) => students.find(s => s.id === id)?.first_name + ' ' + students.find(s => s.id === id)?.last_name || 'N/A';
  const getTeacherName = (id) => teachers.find(t => t.id === id)?.name || 'N/A';
  const getClassName = (id) => classTypes.find(c => c.id === id)?.name || 'N/A';

  const getCurrentClasses = () => {
    const dayIdx = currentTime.getDay();
    const dayName = DIAS[dayIdx];
    const currentTimeStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
    return schedules.filter(s => 
      s.day_of_week === dayName && 
      s.start_time <= currentTimeStr && 
      s.end_time > currentTimeStr
    );
  };

  const getTopClasses = () => {
    const counts = {};
    schedules.forEach(s => {
      const name = getClassName(s.class_type_id);
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const getClassesPerDay = () => {
    const counts = {};
    DIAS.forEach(d => counts[d] = 0);
    schedules.forEach(s => {
      counts[s.day_of_week] = (counts[s.day_of_week] || 0) + 1;
    });
    return Object.entries(counts).map(([day, count]) => ({ day, count }));
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div><div style={styles.loadingText}>Carregant escola...</div></div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.logo}>🎵 Escola de Música Sant Just</h1>
            <p style={styles.subtitle}>Gestor Intel·ligent de Classes</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.timeBox}>
              <div style={styles.timeValue}>{currentTime.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              <div style={styles.timeLabel}>{DIAS[currentTime.getDay()]}</div>
            </div>
          </div>
        </div>
      </header>

      {error && <div style={styles.alertError}>{error}</div>}
      {success && <div style={styles.alertSuccess}>{success}</div>}

      <nav style={styles.nav}>
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'students', label: '👨‍🎓 Alumnes', icon: '👨‍🎓' },
          { id: 'teachers', label: '👨‍🏫 Professors', icon: '👨‍🏫' },
          { id: 'classes', label: '🎹 Classes', icon: '🎹' },
          { id: 'schedules', label: '📅 Horaris', icon: '📅' }
        ].map(tab => (
          <button key={tab.id} style={{ ...styles.navBtn, ...(activeTab === tab.id ? styles.navBtnActive : {}) }} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {activeTab === 'dashboard' && (
          <>
            {/* KPI Cards */}
            <div style={styles.gridStats}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiIcon}>👨‍🎓</div>
                <div style={styles.kpiContent}>
                  <div style={styles.kpiValue}>{students.length}</div>
                  <div style={styles.kpiLabel}>Alumnes</div>
                </div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiIcon}>👨‍🏫</div>
                <div style={styles.kpiContent}>
                  <div style={styles.kpiValue}>{teachers.length}</div>
                  <div style={styles.kpiLabel}>Professors</div>
                </div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiIcon}>🎹</div>
                <div style={styles.kpiContent}>
                  <div style={styles.kpiValue}>{classTypes.length}</div>
                  <div style={styles.kpiLabel}>Classes</div>
                </div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiIcon}>📅</div>
                <div style={styles.kpiContent}>
                  <div style={styles.kpiValue}>{getCurrentClasses().length}</div>
                  <div style={styles.kpiLabel}>Ara en Viu 🔴</div>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div style={styles.dashboardGrid}>
              {/* Classes en Curs */}
              <div style={styles.cardLarge}>
                <h3 style={styles.cardTitle}>🔴 Classes en Directe Ara</h3>
                {getCurrentClasses().length > 0 ? (
                  <div style={styles.classesLive}>
                    {getCurrentClasses().map((sch, idx) => (
                      <div key={sch.id} style={{ ...styles.liveClass, backgroundColor: ['#FEF3C7', '#D1FAE5', '#DBEAFE', '#FCE7F3'][idx % 4] }}>
                        <div style={styles.liveTime}>{sch.start_time}</div>
                        <div style={styles.liveInfo}>
                          <div style={styles.liveName}>{getStudentName(sch.student_id)}</div>
                          <div style={styles.liveType}>{getClassName(sch.class_type_id)} • {getTeacherName(sch.teacher_id)}</div>
                        </div>
                        <div style={styles.liveBadge}>EN CURS</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.empty}>Cap classe en aquest moment ⏸️</div>
                )}
              </div>

              {/* Classes Per Dia */}
              <div style={styles.cardMedium}>
                <h3 style={styles.cardTitle}>📅 Classes per Dia</h3>
                <div style={styles.barChartContainer}>
                  {getClassesPerDay().map(item => (
                    <div key={item.day} style={styles.barRow}>
                      <div style={styles.barLabel}>{item.day.slice(0, 3)}</div>
                      <div style={styles.barTrack}>
                        <div style={{
                          ...styles.barFill,
                          width: Math.min((item.count / 15) * 100, 100) + '%'
                        }}></div>
                      </div>
                      <div style={styles.barValue}>{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Classes Populars */}
              <div style={styles.cardMedium}>
                <h3 style={styles.cardTitle}>⭐ Top Classes</h3>
                <div style={styles.topList}>
                  {getTopClasses().map(([name, count], idx) => (
                    <div key={name} style={styles.topItem}>
                      <div style={styles.topRank}>#{idx + 1}</div>
                      <div style={styles.topName}>{name}</div>
                      <div style={styles.topCount}>{count} 📌</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Horari d'Avui */}
            <div style={styles.cardFull}>
              <h3 style={styles.cardTitle}>📋 Horari Complet d'Avui ({DIAS[currentTime.getDay()]})</h3>
              <div style={styles.scheduleTable}>
                {schedules
                  .filter(s => s.day_of_week === DIAS[currentTime.getDay()])
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map(sch => (
                    <div key={sch.id} style={styles.scheduleRow}>
                      <div style={styles.scheduleTime}>{sch.start_time}-{sch.end_time}</div>
                      <div style={styles.scheduleStudent}>{getStudentName(sch.student_id)}</div>
                      <div style={styles.scheduleClass}>{getClassName(sch.class_type_id)}</div>
                      <div style={styles.scheduleTeacher}>{getTeacherName(sch.teacher_id)}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}

        {/* ALTRES TABS */}
        {activeTab === 'students' && <TabStudents students={students} editStudent={(s) => { setEditingId(s.id); setFormData(s); setModalType('student'); setShowModal(true); }} deleteStudent={deleteStudent} onAdd={() => { setEditingId(null); setModalType('student'); setFormData({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', bank_account: '', bank_holder: '', bank_iban: '', active: true }); setShowModal(true); }} />}
        {activeTab === 'teachers' && <TabTeachers teachers={teachers} editTeacher={(t) => { setEditingId(t.id); setTeacherForm(t); setModalType('teacher'); setShowModal(true); }} deleteTeacher={deleteTeacher} onAdd={() => { setEditingId(null); setModalType('teacher'); setTeacherForm({ name: '', email: '', phone: '', specialties: '', hourly_rate: '', bio: '', active: true }); setShowModal(true); }} />}
        {activeTab === 'classes' && <TabClasses classTypes={classTypes} editClass={(c) => { setEditingId(c.id); setClassTypeForm(c); setModalType('classtype'); setShowModal(true); }} deleteClass={deleteClassType} onAdd={() => { setEditingId(null); setModalType('classtype'); setClassTypeForm({ name: '', description: '', duration_minutes: 60 }); setShowModal(true); }} />}
        {activeTab === 'schedules' && <TabSchedules schedules={schedules} students={students} teachers={teachers} classTypes={classTypes} getStudentName={getStudentName} getTeacherName={getTeacherName} getClassName={getClassName} editSchedule={(s) => { setEditingId(s.id); setScheduleForm(s); setModalType('schedule'); setShowModal(true); }} deleteSchedule={deleteSchedule} onAdd={() => { setEditingId(null); setModalType('schedule'); setScheduleForm({ student_id: '', teacher_id: '', classroom_id: '', class_type_id: '', day_of_week: 'Dilluns', start_time: '10:00', duration_minutes: 60 }); setShowModal(true); }} />}
      </main>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>

            {modalType === 'student' && (
              <form onSubmit={handleSaveStudent}>
                <h3>{editingId ? '✏️ Editar Alumne' : '➕ Afegir Alumne'}</h3>
                <input type="text" placeholder="Nom" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} style={styles.input} required />
                <input type="text" placeholder="Cognoms" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} style={styles.input} required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} />
                <input type="tel" placeholder="Telèfon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Titular Compte" value={formData.bank_holder} onChange={(e) => setFormData({ ...formData, bank_holder: e.target.value })} style={styles.input} />
                <input type="text" placeholder="IBAN" value={formData.bank_iban} onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Compte" value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} style={styles.input} />
                <button type="submit" style={styles.btnSubmit}>💾 Guardar</button>
              </form>
            )}

            {modalType === 'teacher' && (
              <form onSubmit={handleSaveTeacher}>
                <h3>{editingId ? '✏️ Editar Professor' : '➕ Afegir Professor'}</h3>
                <input type="text" placeholder="Nom complet" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} style={styles.input} required />
                <input type="email" placeholder="Email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} style={styles.input} />
                <input type="tel" placeholder="Telèfon" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Especialitats" value={teacherForm.specialties} onChange={(e) => setTeacherForm({ ...teacherForm, specialties: e.target.value })} style={styles.input} />
                <input type="number" placeholder="€/hora" value={teacherForm.hourly_rate} onChange={(e) => setTeacherForm({ ...teacherForm, hourly_rate: e.target.value })} style={styles.input} />
                <textarea placeholder="Biografia" value={teacherForm.bio} onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })} style={styles.input} />
                <button type="submit" style={styles.btnSubmit}>💾 Guardar</button>
              </form>
            )}

            {modalType === 'classtype' && (
              <form onSubmit={handleSaveClassType}>
                <h3>{editingId ? '✏️ Editar' : '➕ Afegir Classe'}</h3>
                <input type="text" placeholder="Nom (Piano, Guitarra...)" value={classTypeForm.name} onChange={(e) => setClassTypeForm({ ...classTypeForm, name: e.target.value })} style={styles.input} required />
                <textarea placeholder="Descripció" value={classTypeForm.description} onChange={(e) => setClassTypeForm({ ...classTypeForm, description: e.target.value })} style={styles.input} />
                <input type="number" placeholder="Durada (minuts)" value={classTypeForm.duration_minutes} onChange={(e) => setClassTypeForm({ ...classTypeForm, duration_minutes: parseInt(e.target.value) })} style={styles.input} />
                <button type="submit" style={styles.btnSubmit}>💾 Guardar</button>
              </form>
            )}

            {modalType === 'schedule' && (
              <form onSubmit={handleSaveSchedule}>
                <h3>{editingId ? '✏️ Editar' : '➕ Afegir Horari'}</h3>
                <select value={scheduleForm.student_id} onChange={(e) => setScheduleForm({ ...scheduleForm, student_id: e.target.value })} style={styles.input} required>
                  <option value="">Alumne</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
                <select value={scheduleForm.teacher_id} onChange={(e) => setScheduleForm({ ...scheduleForm, teacher_id: e.target.value })} style={styles.input} required>
                  <option value="">Professor</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={scheduleForm.class_type_id} onChange={(e) => setScheduleForm({ ...scheduleForm, class_type_id: e.target.value })} style={styles.input} required>
                  <option value="">Classe</option>
                  {classTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                </select>
                <select value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })} style={styles.input}>
                  {DIAS.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                </select>
                <input type="time" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} style={styles.input} required />
                <input type="number" placeholder="Durada (min)" value={scheduleForm.duration_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) })} style={styles.input} />
                <button type="submit" style={styles.btnSubmit}>💾 Guardar</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes Tab
const TabStudents = ({ students, editStudent, deleteStudent, onAdd }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <h2>👨‍🎓 Alumnes ({students.length})</h2>
      <button style={styles.btnAdd} onClick={onAdd}>➕ Afegir</button>
    </div>
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead><tr><th>Nom</th><th>Email</th><th>Telèfon</th><th>Titular</th><th>IBAN</th><th>Accions</th></tr></thead>
        <tbody>{students.map(s => (
          <tr key={s.id}>
            <td><strong>{s.first_name} {s.last_name}</strong></td>
            <td>{s.email || '-'}</td>
            <td>{s.phone || '-'}</td>
            <td>{s.bank_holder || '-'}</td>
            <td>{s.bank_iban || '-'}</td>
            <td><button style={styles.btnIcon} onClick={() => editStudent(s)}>✏️</button> <button style={{...styles.btnIcon, color: '#ef4444'}} onClick={() => deleteStudent(s.id)}>🗑️</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>
);

const TabTeachers = ({ teachers, editTeacher, deleteTeacher, onAdd }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <h2>👨‍🏫 Professors ({teachers.length})</h2>
      <button style={styles.btnAdd} onClick={onAdd}>➕ Afegir</button>
    </div>
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead><tr><th>Nom</th><th>Email</th><th>Telèfon</th><th>Especialitats</th><th>€/h</th><th>Accions</th></tr></thead>
        <tbody>{teachers.map(t => (
          <tr key={t.id}>
            <td><strong>{t.name}</strong></td>
            <td>{t.email || '-'}</td>
            <td>{t.phone || '-'}</td>
            <td>{t.specialties || '-'}</td>
            <td>{t.hourly_rate || '-'}</td>
            <td><button style={styles.btnIcon} onClick={() => editTeacher(t)}>✏️</button> <button style={{...styles.btnIcon, color: '#ef4444'}} onClick={() => deleteTeacher(t.id)}>🗑️</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>
);

const TabClasses = ({ classTypes, editClass, deleteClass, onAdd }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <h2>🎹 Classes ({classTypes.length})</h2>
      <button style={styles.btnAdd} onClick={onAdd}>➕ Afegir</button>
    </div>
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead><tr><th>Nom</th><th>Descripció</th><th>Durada</th><th>Accions</th></tr></thead>
        <tbody>{classTypes.map(ct => (
          <tr key={ct.id}>
            <td><strong>{ct.name}</strong></td>
            <td>{ct.description || '-'}</td>
            <td>{ct.duration_minutes} min</td>
            <td><button style={styles.btnIcon} onClick={() => editClass(ct)}>✏️</button> <button style={{...styles.btnIcon, color: '#ef4444'}} onClick={() => deleteClass(ct.id)}>🗑️</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>
);

const TabSchedules = ({ schedules, students, teachers, classTypes, getStudentName, getTeacherName, getClassName, editSchedule, deleteSchedule, onAdd }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <h2>📅 Horaris ({schedules.length})</h2>
      <button style={styles.btnAdd} onClick={onAdd}>➕ Afegir</button>
    </div>
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead><tr><th>Alumne</th><th>Professor</th><th>Classe</th><th>Dia</th><th>Hora</th><th>Durada</th><th>Accions</th></tr></thead>
        <tbody>{schedules.map(sch => (
          <tr key={sch.id}>
            <td>{getStudentName(sch.student_id)}</td>
            <td>{getTeacherName(sch.teacher_id)}</td>
            <td>{getClassName(sch.class_type_id)}</td>
            <td>{sch.day_of_week}</td>
            <td>{sch.start_time}</td>
            <td>{sch.duration_minutes}m</td>
            <td><button style={styles.btnIcon} onClick={() => editSchedule(sch)}>✏️</button> <button style={{...styles.btnIcon, color: '#ef4444'}} onClick={() => deleteSchedule(sch.id)}>🗑️</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>
);

const styles = {
  container: { width: '100%', minHeight: '100vh', background: '#f8f9fa', color: '#1a1a1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)', borderBottom: '2px solid #e5e7eb', padding: '32px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  headerContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '32px', fontWeight: '800', color: '#1f2937', margin: '0' },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' },
  headerRight: { display: 'flex', alignItems: 'center' },
  timeBox: { background: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' },
  timeValue: { fontSize: '24px', fontWeight: '700' },
  timeLabel: { fontSize: '12px', opacity: 0.9 },
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', display: 'flex', gap: '8px', maxWidth: '100%', overflowX: 'auto' },
  navBtn: { background: 'none', border: 'none', color: '#6b7280', padding: '16px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s', whiteSpace: 'nowrap' },
  navBtnActive: { color: '#2563eb', borderBottom: '3px solid #2563eb' },
  main: { maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' },
  gridStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
  kpiCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.3s' },
  kpiIcon: { fontSize: '40px' },
  kpiContent: { flex: 1 },
  kpiValue: { fontSize: '32px', fontWeight: '700', color: '#2563eb', lineHeight: '1' },
  kpiLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' },
  cardLarge: { gridColumn: 'span 2', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardMedium: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardFull: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px', margin: '0 0 20px 0' },
  classesLive: { display: 'flex', flexDirection: 'column', gap: '12px' },
  liveClass: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' },
  liveTime: { fontSize: '14px', fontWeight: '700', color: '#1f2937', minWidth: '60px' },
  liveInfo: { flex: 1 },
  liveName: { fontSize: '14px', fontWeight: '600', color: '#1f2937' },
  liveType: { fontSize: '12px', color: '#6b7280' },
  liveBadge: { background: '#dc2626', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  empty: { textAlign: 'center', padding: '40px 20px', color: '#6b7280', fontSize: '14px' },
  barChartContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  barRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  barLabel: { fontSize: '12px', fontWeight: '600', color: '#1f2937', minWidth: '35px' },
  barTrack: { flex: 1, height: '24px', background: '#f3f4f6', borderRadius: '12px', overflow: 'hidden' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #1d4ed8)', borderRadius: '12px', transition: 'width 0.3s' },
  barValue: { fontSize: '12px', fontWeight: '700', color: '#1f2937', minWidth: '30px', textAlign: 'right' },
  topList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  topItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' },
  topRank: { fontSize: '18px', fontWeight: '700', color: '#2563eb', minWidth: '30px' },
  topName: { flex: 1, fontWeight: '600', color: '#1f2937' },
  topCount: { fontSize: '12px', color: '#6b7280' },
  scheduleTable: { display: 'flex', flexDirection: 'column', gap: '8px' },
  scheduleRow: { display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr', gap: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', borderLeft: '3px solid #2563eb' },
  scheduleTime: { fontWeight: '600', color: '#2563eb', fontSize: '13px' },
  scheduleStudent: { fontWeight: '600', color: '#1f2937' },
  scheduleClass: { color: '#6b7280', fontSize: '13px' },
  scheduleTeacher: { color: '#6b7280', fontSize: '13px' },
  section: { marginTop: '40px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  tableWrapper: { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  btnAdd: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', marginRight: '4px' },
  input: { width: '100%', padding: '12px', margin: '12px 0', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a1a', fontSize: '14px', fontFamily: 'inherit' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', position: 'relative' },
  closeBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer' },
  btnSubmit: { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '20px' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fa' },
  loadingSpinner: { width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { marginTop: '20px', fontSize: '16px', color: '#6b7280' },
  alertError: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '20px' },
  alertSuccess: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '20px' },
};
