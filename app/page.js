'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhfkkznbigrluumhvipw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZmtrem5iaWdybHV1bWh2aXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQ0MTUsImV4cCI6MjA5NjE1MDQxNX0.saHO8140W4Vp3cWiZjL2NiNIpupJvf0eWy_sz4speE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DIAS = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];

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

  // ALUMNES
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supabase.from('students').update(formData).eq('id', editingId);
        setStudents(students.map(s => s.id === editingId ? { ...s, ...formData } : s));
        showSuccessMsg('Alumne actualitzat!');
      } else {
        const { data } = await supabase.from('students').insert([formData]).select();
        setStudents([...students, data[0]]);
        showSuccessMsg('Alumne afegit!');
      }
      setShowModal(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', bank_account: '', bank_holder: '', bank_iban: '', active: true });
      setEditingId(null);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const deleteStudent = async (id) => {
    if (!confirm('Segur?')) return;
    try {
      await supabase.from('students').delete().eq('id', id);
      setStudents(students.filter(s => s.id !== id));
      showSuccessMsg('Alumne eliminat!');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const editStudent = (student) => {
    setEditingId(student.id);
    setFormData(student);
    setModalType('student');
    setShowModal(true);
  };

  // PROFESSORS
  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      const data = { name: teacherForm.name, email: teacherForm.email, phone: teacherForm.phone, specialties: teacherForm.specialties, hourly_rate: teacherForm.hourly_rate, bio: teacherForm.bio, active: teacherForm.active };
      if (editingId) {
        await supabase.from('teachers').update(data).eq('id', editingId);
        setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...data } : t));
        showSuccessMsg('Professor actualitzat!');
      } else {
        const { data: newTeacher } = await supabase.from('teachers').insert([data]).select();
        setTeachers([...teachers, newTeacher[0]]);
        showSuccessMsg('Professor afegit!');
      }
      setShowModal(false);
      setTeacherForm({ name: '', email: '', phone: '', specialties: '', hourly_rate: '', bio: '', active: true });
      setEditingId(null);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const deleteTeacher = async (id) => {
    if (!confirm('Segur?')) return;
    try {
      await supabase.from('teachers').delete().eq('id', id);
      setTeachers(teachers.filter(t => t.id !== id));
      showSuccessMsg('Professor eliminat!');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const editTeacher = (teacher) => {
    setEditingId(teacher.id);
    setTeacherForm(teacher);
    setModalType('teacher');
    setShowModal(true);
  };

  // TIPUS DE CLASSES
  const handleSaveClassType = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supabase.from('class_types').update(classTypeForm).eq('id', editingId);
        setClassTypes(classTypes.map(ct => ct.id === editingId ? { ...ct, ...classTypeForm } : ct));
        showSuccessMsg('Classe actualitzada!');
      } else {
        const { data } = await supabase.from('class_types').insert([classTypeForm]).select();
        setClassTypes([...classTypes, data[0]]);
        showSuccessMsg('Classe afegida!');
      }
      setShowModal(false);
      setClassTypeForm({ name: '', description: '', duration_minutes: 60 });
      setEditingId(null);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const deleteClassType = async (id) => {
    if (!confirm('Segur?')) return;
    try {
      await supabase.from('class_types').delete().eq('id', id);
      setClassTypes(classTypes.filter(ct => ct.id !== id));
      showSuccessMsg('Classe eliminada!');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const editClassType = (classType) => {
    setEditingId(classType.id);
    setClassTypeForm(classType);
    setModalType('classtype');
    setShowModal(true);
  };

  // HORARIS
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const end_time = addMinutesToTime(scheduleForm.start_time, scheduleForm.duration_minutes);
      const data = { ...scheduleForm, end_time, active: true };
      if (editingId) {
        await supabase.from('schedules').update(data).eq('id', editingId);
        setSchedules(schedules.map(s => s.id === editingId ? { ...s, ...data } : s));
        showSuccessMsg('Horari actualitzat!');
      } else {
        const { data: newSchedule } = await supabase.from('schedules').insert([data]).select();
        setSchedules([...schedules, newSchedule[0]]);
        showSuccessMsg('Horari afegit!');
      }
      setShowModal(false);
      setScheduleForm({ student_id: '', teacher_id: '', classroom_id: '', class_type_id: '', day_of_week: 'Dilluns', start_time: '10:00', duration_minutes: 60 });
      setEditingId(null);
    } catch (err) {
      setError('Error: ' + err.message);
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
    if (!confirm('Segur?')) return;
    try {
      await supabase.from('schedules').delete().eq('id', id);
      setSchedules(schedules.filter(s => s.id !== id));
      showSuccessMsg('Horari eliminat!');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const editSchedule = (schedule) => {
    setEditingId(schedule.id);
    setScheduleForm(schedule);
    setModalType('schedule');
    setShowModal(true);
  };

  const getStudentSchedules = (studentId) => {
    return schedules.filter(s => s.student_id === studentId);
  };

  const getStudentName = (id) => {
    const s = students.find(st => st.id === id);
    return s ? `${s.first_name} ${s.last_name}` : 'N/A';
  };

  const getTeacherName = (id) => {
    const t = teachers.find(tc => tc.id === id);
    return t ? t.name : 'N/A';
  };

  const getClassName = (id) => {
    const ct = classTypes.find(c => c.id === id);
    return ct ? ct.name : 'N/A';
  };

  if (loading) return <div style={styles.loading}>Carregant...</div>;

  return (
    <div style={styles.container}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e27; color: #e0e0e0; }
      `}</style>

      <header style={styles.header}>
        <h1 style={styles.logo}>🎵 Escola de Música - Sant Just</h1>
      </header>

      {error && <div style={styles.alertError}>{error}</div>}
      {success && <div style={styles.alertSuccess}>{success}</div>}

      <nav style={styles.nav}>
        {['dashboard', 'students', 'teachers', 'classes', 'schedules'].map(tab => (
          <button key={tab} style={{ ...styles.navBtn, ...(activeTab === tab ? styles.navBtnActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab === 'dashboard' && '📊'} {tab === 'students' && '👨‍🎓'} {tab === 'teachers' && '👨‍🏫'} {tab === 'classes' && '🎹'} {tab === 'schedules' && '📅'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {activeTab === 'dashboard' && (
          <div style={styles.section}>
            <h2>Dashboard</h2>
            <div style={styles.stats}>
              <div style={styles.statCard}><div style={styles.statNum}>{students.length}</div><div>Alumnes</div></div>
              <div style={styles.statCard}><div style={styles.statNum}>{teachers.length}</div><div>Professors</div></div>
              <div style={styles.statCard}><div style={styles.statNum}>{classTypes.length}</div><div>Tipus Classes</div></div>
              <div style={styles.statCard}><div style={styles.statNum}>{schedules.length}</div><div>Horaris</div></div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Gestió d'Alumnes</h2>
              <button style={styles.btnPrimary} onClick={() => { setModalType('student'); setEditingId(null); setFormData({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', bank_account: '', bank_holder: '', bank_iban: '', active: true }); setShowModal(true); }}>+ Afegir Alumne</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Telèfon</th>
                    <th>Data Neixement</th>
                    <th>Titular Compte</th>
                    <th>IBAN</th>
                    <th>Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.first_name} {student.last_name}</strong></td>
                      <td>{student.email || '-'}</td>
                      <td>{student.phone || '-'}</td>
                      <td>{student.date_of_birth || '-'}</td>
                      <td>{student.bank_holder || '-'}</td>
                      <td>{student.bank_iban || '-'}</td>
                      <td>
                        <button style={styles.btnSmall} onClick={() => editStudent(student)}>Editar</button>
                        <button style={{ ...styles.btnSmall, background: '#ff6b6b' }} onClick={() => deleteStudent(student.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Gestió de Professors</h2>
              <button style={styles.btnPrimary} onClick={() => { setModalType('teacher'); setEditingId(null); setTeacherForm({ name: '', email: '', phone: '', specialties: '', hourly_rate: '', bio: '', active: true }); setShowModal(true); }}>+ Afegir Professor</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Telèfon</th>
                    <th>Especialitats</th>
                    <th>€/hora</th>
                    <th>Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td><strong>{teacher.name}</strong></td>
                      <td>{teacher.email || '-'}</td>
                      <td>{teacher.phone || '-'}</td>
                      <td>{teacher.specialties || '-'}</td>
                      <td>{teacher.hourly_rate || '-'}</td>
                      <td>
                        <button style={styles.btnSmall} onClick={() => editTeacher(teacher)}>Editar</button>
                        <button style={{ ...styles.btnSmall, background: '#ff6b6b' }} onClick={() => deleteTeacher(teacher.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Tipus de Classes</h2>
              <button style={styles.btnPrimary} onClick={() => { setModalType('classtype'); setEditingId(null); setClassTypeForm({ name: '', description: '', duration_minutes: 60 }); setShowModal(true); }}>+ Afegir Classe</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Descripció</th>
                    <th>Durada (min)</th>
                    <th>Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {classTypes.map(ct => (
                    <tr key={ct.id}>
                      <td><strong>{ct.name}</strong></td>
                      <td>{ct.description || '-'}</td>
                      <td>{ct.duration_minutes}</td>
                      <td>
                        <button style={styles.btnSmall} onClick={() => editClassType(ct)}>Editar</button>
                        <button style={{ ...styles.btnSmall, background: '#ff6b6b' }} onClick={() => deleteClassType(ct.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Horaris</h2>
              <button style={styles.btnPrimary} onClick={() => { setModalType('schedule'); setEditingId(null); setScheduleForm({ student_id: '', teacher_id: '', classroom_id: '', class_type_id: '', day_of_week: 'Dilluns', start_time: '10:00', duration_minutes: 60 }); setShowModal(true); }}>+ Afegir Horari</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Alumne</th>
                    <th>Professor</th>
                    <th>Classe</th>
                    <th>Dia</th>
                    <th>Hora</th>
                    <th>Durada</th>
                    <th>Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(sch => (
                    <tr key={sch.id}>
                      <td>{getStudentName(sch.student_id)}</td>
                      <td>{getTeacherName(sch.teacher_id)}</td>
                      <td>{getClassName(sch.class_type_id)}</td>
                      <td>{sch.day_of_week}</td>
                      <td>{sch.start_time}</td>
                      <td>{sch.duration_minutes} min</td>
                      <td>
                        <button style={styles.btnSmall} onClick={() => editSchedule(sch)}>Editar</button>
                        <button style={{ ...styles.btnSmall, background: '#ff6b6b' }} onClick={() => deleteSchedule(sch.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>

            {modalType === 'student' && (
              <form onSubmit={handleSaveStudent}>
                <h3>{editingId ? 'Editar Alumne' : 'Afegir Alumne'}</h3>
                <input type="text" placeholder="Nom" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} style={styles.input} required />
                <input type="text" placeholder="Cognoms" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} style={styles.input} required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} />
                <input type="tel" placeholder="Telèfon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                <input type="date" placeholder="Data Neixement" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Titular Compte" value={formData.bank_holder} onChange={(e) => setFormData({ ...formData, bank_holder: e.target.value })} style={styles.input} />
                <input type="text" placeholder="IBAN" value={formData.bank_iban} onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Compte Bancari" value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} style={styles.input} />
                <button type="submit" style={styles.btnPrimary}>Guardar</button>
              </form>
            )}

            {modalType === 'teacher' && (
              <form onSubmit={handleSaveTeacher}>
                <h3>{editingId ? 'Editar Professor' : 'Afegir Professor'}</h3>
                <input type="text" placeholder="Nom" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} style={styles.input} required />
                <input type="email" placeholder="Email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} style={styles.input} />
                <input type="tel" placeholder="Telèfon" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Especialitats (piano, guitarra...)" value={teacherForm.specialties} onChange={(e) => setTeacherForm({ ...teacherForm, specialties: e.target.value })} style={styles.input} />
                <input type="number" placeholder="Tarifa €/hora" value={teacherForm.hourly_rate} onChange={(e) => setTeacherForm({ ...teacherForm, hourly_rate: e.target.value })} style={styles.input} />
                <textarea placeholder="Biografia" value={teacherForm.bio} onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })} style={styles.input} />
                <button type="submit" style={styles.btnPrimary}>Guardar</button>
              </form>
            )}

            {modalType === 'classtype' && (
              <form onSubmit={handleSaveClassType}>
                <h3>{editingId ? 'Editar Classe' : 'Afegir Classe'}</h3>
                <input type="text" placeholder="Nom (Piano, Guitarra, Bateria...)" value={classTypeForm.name} onChange={(e) => setClassTypeForm({ ...classTypeForm, name: e.target.value })} style={styles.input} required />
                <textarea placeholder="Descripció" value={classTypeForm.description} onChange={(e) => setClassTypeForm({ ...classTypeForm, description: e.target.value })} style={styles.input} />
                <input type="number" placeholder="Durada (minuts)" value={classTypeForm.duration_minutes} onChange={(e) => setClassTypeForm({ ...classTypeForm, duration_minutes: parseInt(e.target.value) })} style={styles.input} />
                <button type="submit" style={styles.btnPrimary}>Guardar</button>
              </form>
            )}

            {modalType === 'schedule' && (
              <form onSubmit={handleSaveSchedule}>
                <h3>{editingId ? 'Editar Horari' : 'Afegir Horari'}</h3>
                <select value={scheduleForm.student_id} onChange={(e) => setScheduleForm({ ...scheduleForm, student_id: e.target.value })} style={styles.input} required>
                  <option value="">Selecciona Alumne</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
                <select value={scheduleForm.teacher_id} onChange={(e) => setScheduleForm({ ...scheduleForm, teacher_id: e.target.value })} style={styles.input} required>
                  <option value="">Selecciona Professor</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={scheduleForm.class_type_id} onChange={(e) => setScheduleForm({ ...scheduleForm, class_type_id: e.target.value })} style={styles.input} required>
                  <option value="">Selecciona Classe</option>
                  {classTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                </select>
                <select value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })} style={styles.input}>
                  {DIAS.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                </select>
                <input type="time" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} style={styles.input} required />
                <input type="number" placeholder="Durada (minuts)" value={scheduleForm.duration_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) })} style={styles.input} />
                <button type="submit" style={styles.btnPrimary}>Guardar</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #16213e 100%)', color: '#e0e0e0' },
  header: { background: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)', padding: '32px', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
  logo: { fontSize: '32px', fontWeight: '600', background: 'linear-gradient(135deg, #ffa500 0%, #ffb84d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  nav: { background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '0 32px', display: 'flex', gap: '8px', maxWidth: '1400px', margin: '0 auto' },
  navBtn: { background: 'transparent', border: 'none', color: '#a0a0a0', padding: '16px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease', borderBottom: '2px solid transparent' },
  navBtnActive: { color: '#ffa500', borderBottomColor: '#ffa500' },
  main: { maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' },
  section: { animation: 'fadeIn 0.5s ease' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '24px' },
  statCard: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 165, 0, 0.3)', borderRadius: '12px', padding: '24px', textAlign: 'center' },
  statNum: { fontSize: '32px', fontWeight: '600', color: '#ffa500', marginBottom: '8px' },
  tableWrapper: { overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(255, 255, 255, 0.02)' },
  btnPrimary: { background: 'linear-gradient(135deg, #ffa500 0%, #ffb84d 100%)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSmall: { background: '#4dabf7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' },
  input: { width: '100%', padding: '12px', margin: '12px 0', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#e0e0e0', fontSize: '14px', fontFamily: 'inherit' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#1a1f3a', padding: '32px', borderRadius: '12px', maxWidth: '500px', width: '90%', position: 'relative', border: '1px solid rgba(255, 165, 0, 0.3)' },
  closeBtn: { position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#e0e0e0', fontSize: '24px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '60px', fontSize: '18px', color: '#a0a0a0' },
  alertError: { background: 'rgba(255, 76, 76, 0.1)', border: '1px solid rgba(255, 76, 76, 0.3)', color: '#ff4c4c', padding: '16px', borderRadius: '8px', margin: '20px 32px 0', maxWidth: '1400px' },
  alertSuccess: { background: 'rgba(81, 207, 102, 0.1)', border: '1px solid rgba(81, 207, 102, 0.3)', color: '#51cf66', padding: '16px', borderRadius: '8px', margin: '20px 32px 0', maxWidth: '1400px' },
};
