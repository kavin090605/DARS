import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const AttendanceEntry = () => {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sessionTotal, setSessionTotal] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [metadata, setMetadata] = useState({ departments: [], years: [] });

    const fetchStudents = async () => {
        if (!selectedDept || !selectedYear || !selectedSubject) {
            alert('Please select Department, Year, and Subject');
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/faculty/students/${selectedDept}/${selectedYear}?subject_id=${selectedSubject}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Initialize each student with 'attended' = sessionTotal (defaulting to present for today)
            const studentsWithAttendance = res.data.map(s => ({
                ...s,
                attended: sessionTotal,
                progress: `${s.current_attended}/${s.current_total}`
            }));
            setStudents(studentsWithAttendance);
        } catch (err) {
            console.error('Error fetching students:', err);
            alert('Failed to fetch students');
        }
    };

    // Update students' attendance if sessionTotal changes
    useEffect(() => {
        setStudents(prev => prev.map(s => ({ ...s, attended: sessionTotal })));
    }, [sessionTotal]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await axios.get(`${API_URL}/faculty/metadata`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setMetadata(res.data);
            } catch (err) {
                console.error('Error fetching metadata:', err);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedDept || !selectedYear) {
                setSubjects([]);
                setSelectedSubject('');
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/faculty/subjects?dept=${selectedDept}&year=${selectedYear}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSubjects(res.data);
                setSelectedSubject('');
            } catch (err) {
                console.error('Error fetching subjects:', err);
            }
        };
        fetchSubjects();
    }, [selectedDept, selectedYear]);

    const updateStudentAttended = (id, value) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, attended: Math.min(value, sessionTotal) } : s));
    };

    const handleBulkSubmit = async () => {
        if (!selectedSubject) {
            alert('Please select a subject first');
            return;
        }
        if (students.length === 0) {
            alert('No students to submit attendance for');
            return;
        }

        setSubmitting(true);
        try {
            await Promise.all(students.map(s =>
                axios.post(`${API_URL}/faculty/attendance`, {
                    student_id: s.id,
                    subject_id: selectedSubject,
                    attended_classes: s.attended,
                    total_classes: sessionTotal
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ));
            alert('Daily attendance added successfully!');
            fetchStudents(); // Refresh to show new totals
        } catch (err) {
            console.error('Error saving attendance:', err);
            alert(`Error saving attendance: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <header className="header" style={{ marginBottom: '2rem' }}>
                    <h1>Daily Attendance Entry</h1>
                </header>

                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="form-group input"
                            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb', flex: '1', minWidth: '150px' }}
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
                        >
                            <option value="">Select Dept</option>
                            {metadata.departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            className="form-group input"
                            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb', flex: '1', minWidth: '150px' }}
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                        >
                            <option value="">Select Year</option>
                            {metadata.years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                            className="form-group input"
                            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb', flex: '1', minWidth: '150px' }}
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#92400e' }}>Sessions Today:</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={sessionTotal}
                                onChange={e => setSessionTotal(parseInt(e.target.value) || 1)}
                                style={{ width: '50px', padding: '0.3rem', borderRadius: '4px', border: '1px solid #f59e0b', textAlign: 'center' }}
                            />
                        </div>

                        <button className="btn-primary" onClick={fetchStudents} style={{ padding: '0.6rem 1.5rem' }}>Fetch Students</button>
                    </div>
                </div>

                <div className="table-container shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                        <h3 style={{ margin: 0 }}>Student List</h3>
                        {students.length > 0 && (
                            <button
                                className="btn-primary"
                                onClick={handleBulkSubmit}
                                disabled={submitting}
                                style={{ padding: '0.5rem 1.5rem', backgroundColor: '#10b981' }}
                            >
                                {submitting ? 'Saving...' : 'Submit All Attendance'}
                            </button>
                        )}
                    </div>
                    <table style={{ margin: 0 }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th>Student Name</th>
                                <th>Roll Number</th>
                                <th style={{ textAlign: 'center' }}>Current Progress</th>
                                <th style={{ textAlign: 'center' }}>Attended Today</th>
                                <th style={{ textAlign: 'center' }}>Quick Mark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: '500' }}>{s.name}</td>
                                        <td>{s.roll_no}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                {s.progress}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                value={s.attended}
                                                onChange={(e) => updateStudentAttended(s.id, parseInt(e.target.value) || 0)}
                                                style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}
                                                min="0"
                                                max={sessionTotal}
                                            />
                                            <span style={{ marginLeft: '0.4rem', color: '#6b7280' }}>/ {sessionTotal}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => updateStudentAttended(s.id, sessionTotal)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '4px', border: 'none', backgroundColor: s.attended === sessionTotal ? '#10b981' : '#e5e7eb', color: s.attended === sessionTotal ? '#fff' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                                    title="Present"
                                                >
                                                    P
                                                </button>
                                                <button
                                                    onClick={() => updateStudentAttended(s.id, 0)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '4px', border: 'none', backgroundColor: s.attended === 0 ? '#ef4444' : '#e5e7eb', color: s.attended === 0 ? '#fff' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                                    title="Absent"
                                                >
                                                    A
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                        Select Subject and click "Fetch Students" to begin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceEntry;
