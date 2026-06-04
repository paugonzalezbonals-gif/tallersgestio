'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhfkkznbigrluumhvipw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZmtrem5iaWdybHV1bWh2aXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQ0MTUsImV4cCI6MjA5NjE1MDQxNX0.saHO8140W4Vp3cWiZjL2NiNIpupJvf0eWy_sz4speE4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function MusicSchoolAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, teachersRes, classroomsRes, schedulesRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('classrooms').select('*'),
        supabase.from('schedules').select('*')
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (teachersRes.error) throw teachersRes.error;
      if (classroomsRes.error) throw classroomsRes.error;
      if (schedulesRes.error) throw schedulesRes.error;

      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setClassrooms(classroomsRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStudent = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      date_of_birth: formData.get('dob'),
      active: true
    };

    try {
      const { data, error } = await supabase.from('students').insert([newStudent]).select();
      if (error) throw error;
      setStudents([...students, data[0]]);
      setShowForm(false);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const getOccupiedClassrooms = (now) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    return schedules.filter(s => 
      s.day_of_week === dayName && 
      s.start_time <= currentTime && 
      s.end_time > currentTime &&
      s.active
    );
  };

  const occupied = getOccupiedClassrooms(new Date());

  return (
    <div style={styles.container}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e27; color: #e0e0e0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>🎵 Escola de Música</h1>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statValue}>{students.length}</span>
              <span style={styles.statLabel}>Alumnes</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{teachers.length}</span>
              <span style={styles.statLabel}>Professors</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{classrooms.length}</span>
              <span style={styles.statLabel}>Aules</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        {['dashboard', 'students', 'teachers', 'classrooms', 'schedules'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.navBtn,
              ...(activeTab === tab ? styles.navBtnActive : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>Carregant dades...</div>
        ) : error ? (
          <div style={styles.error}>Error: {error}</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Dashboard</h2>
                
                <div style={styles.gridSection}>
                  <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Aules Ocupades Avui</h3>
                    <div style={styles.classroomsList}>
                      {occupied.length > 0 ? (
                        occupied.map(schedule => (
                          <div key={schedule.id} style={styles.occupiedItem}>
                            <span style={styles.time}>{schedule.start_time}</span>
                            <span style={styles.classroom}>Aula {schedule.classroom_id?.slice(0, 4)}</span>
                            <span style={styles.teacher}>Prof. {schedule.teacher_id?.slice(0, 4)}</span>
                          </div>
                        ))
                      ) : (
                        <p style={styles.empty}>No hi ha classes en aquest moment</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Estado de Aules</h3>
                    <div style={styles.classroomStatus}>
                      {classrooms.slice(0, 4).map(room => (
                        <div key={room.id} style={styles.statusItem}>
                          <div style={{
                            ...styles.statusDot,
                            backgroundColor: occupied.some(s => s.classroom_id === room.id) ? '#ff6b6b' : '#51cf66'
                          }} />
                          <span>{room.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'students' && (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Gestió d'Alumnes</h2>
                  <button 
                    style={styles.addBtn}
                    onClick={() => {
                      setFormType('student');
                      setShowForm(!showForm);
                    }}
                  >
                    + Afegir Alumne
                  </button>
                </div>

                {showForm && formType === 'student' && (
                  <form style={styles.form} onSubmit={addStudent}>
                    <div style={styles.formGroup}>
                      <input type="text" name="firstName" placeholder="Nom" required style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <input type="text" name="lastName" placeholder="Cognoms" required style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <input type="email" name="email" placeholder="Email" style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <input type="tel" name="phone" placeholder="Telèfon" style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <input type="date" name="dob" style={styles.input} />
                    </div>
                    <div style={styles.formActions}>
                      <button type="submit" style={styles.submitBtn}>Guardar</button>
                      <button 
                        type="button" 
                        style={styles.cancelBtn}
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Telèfon</th>
                      <th>Data Matrícula</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.first_name} {student.last_name}</td>
                        <td>{student.email || '-'}</td>
                        <td>{student.phone || '-'}</td>
                        <td>{student.enrollment_date || '-'}</td>
                        <td>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: student.active ? '#51cf66' : '#868e96'
                          }}>
                            {student.active ? 'Actiu' : 'Inactiu'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'teachers' && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Gestió de Professors</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Especialitats</th>
                      <th>Tarifa/hora</th>
                      <th>Estat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <tr key={teacher.id}>
                        <td>{teacher.id.slice(0, 8)}</td>
                        <td>{teacher.specialties?.join(', ') || '-'}</td>
                        <td>{teacher.hourly_rate ? `€${teacher.hourly_rate}` : '-'}</td>
                        <td>
                          <span style={{...styles.badge, backgroundColor: '#4dabf7'}}>
                            Actiu
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'classrooms' && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Gestió d'Aules</h2>
                <div style={styles.classroomsGrid}>
                  {classrooms.map(room => (
                    <div key={room.id} style={styles.classroomCard}>
                      <h3 style={styles.roomName}>{room.name}</h3>
                      <p style={styles.roomCapacity}>Capacitat: {room.capacity} persones</p>
                      {room.equipment && (
                        <p style={styles.roomEquipment}>
                          Equipament: {room.equipment.join(', ')}
                        </p>
                      )}
                      <div style={{
                        ...styles.statusDot,
                        backgroundColor: '#4dabf7',
                        marginTop: '12px',
                        width: '8px',
                        height: '8px'
                      }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'schedules' && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Horaris</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Dia</th>
                      <th>Hora</th>
                      <th>Aula</th>
                      <th>Professor</th>
                      <th>Alumne</th>
                      <th>Duració</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(schedule => (
                      <tr key={schedule.id}>
                        <td>{schedule.day_of_week}</td>
                        <td>{schedule.start_time} - {schedule.end_time}</td>
                        <td>Aula {schedule.classroom_id?.slice(0, 4)}</td>
                        <td>Prof. {schedule.teacher_id?.slice(0, 4)}</td>
                        <td>Est. {schedule.student_id?.slice(0, 4)}</td>
                        <td>{schedule.duration_minutes} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e27 0%, #16213e 100%)',
    color: '#e0e0e0'
  },
  header: {
    background: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '32px 0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '28px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #ffa500 0%, #ffb84d 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  stats: {
    display: 'flex',
    gap: '32px'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffa500'
  },
  statLabel: {
    fontSize: '12px',
    color: '#a0a0a0',
    marginTop: '4px'
  },
  nav: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0 32px',
    display: 'flex',
    gap: '8px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    padding: '16px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    borderBottom: '2px solid transparent'
  },
  navBtnActive: {
    color: '#ffa500',
    borderBottomColor: '#ffa500'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 32px'
  },
  section: {
    animation: 'fadeIn 0.5s ease'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#ffffff'
  },
  addBtn: {
    background: 'linear-gradient(135deg, #ffa500 0%, #ffb84d 100%)',
    color: '#000000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'transform 0.2s ease'
  },
  form: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#e0e0e0',
    fontSize: '14px'
  },
  formActions: {
    gridColumn: '1 / -1',
    display: 'flex',
    gap: '12px'
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #51cf66 0%, #69db7c 100%)',
    color: '#000000',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  cancelBtn: {
    background: 'transparent',
    color: '#a0a0a0',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  gridSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '24px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    animation: 'slideIn 0.5s ease'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#ffffff'
  },
  classroomsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  occupiedItem: {
    background: 'rgba(255, 105, 180, 0.1)',
    border: '1px solid rgba(255, 105, 180, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px'
  },
  time: {
    color: '#ffa500',
    fontWeight: '600'
  },
  classroom: {
    color: '#e0e0e0'
  },
  teacher: {
    color: '#a0a0a0'
  },
  empty: {
    color: '#a0a0a0',
    textAlign: 'center',
    padding: '20px'
  },
  classroomStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  classroomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  },
  classroomCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.3s ease'
  },
  roomName: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#ffffff'
  },
  roomCapacity: {
    fontSize: '13px',
    color: '#a0a0a0',
    marginBottom: '8px'
  },
  roomEquipment: {
    fontSize: '13px',
    color: '#a0a0a0'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#000000'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#a0a0a0'
  },
  error: {
    background: 'rgba(255, 76, 76, 0.1)',
    border: '1px solid rgba(255, 76, 76, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    color: '#ff4c4c',
    marginBottom: '24px'
  }
};
