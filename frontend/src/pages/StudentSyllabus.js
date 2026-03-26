import API_URL from '../apiConfig';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const StudentSyllabus = () => {
    const [subjectsBySemester, setSubjectsBySemester] = useState({});
    const [syllabusData, setSyllabusData] = useState([]);
    const [syllabusSubject, setSyllabusSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/student/reports`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                const grouped = {};
                Object.keys(res.data.semesterData).forEach(semKey => {
                    const subjectIds = new Set();
                    grouped[semKey] = [];
                    res.data.semesterData[semKey].marks.forEach(m => {
                        if (!subjectIds.has(m.subject_id)) {
                            subjectIds.add(m.subject_id);
                            grouped[semKey].push({ id: m.subject_id, name: m.subject_name });
                        }
                    });
                });
                
                setSubjectsBySemester(grouped);
            } catch (err) {
                console.error('Error fetching subjects:', err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const fetchSyllabus = async (subjectId) => {
        try {
            const res = await axios.get(`${API_URL}/student/syllabus/${subjectId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSyllabusData(res.data);
            
            // Find the subject name across all semesters
            let subjectName = '';
            for (const sem in subjectsBySemester) {
                const found = subjectsBySemester[sem].find(s => s.id === subjectId);
                if (found) {
                    subjectName = found.name;
                    break;
                }
            }
            setSyllabusSubject({ id: subjectId, name: subjectName });
        } catch (err) {
            alert('Error fetching syllabus');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Student" />
            <div className="main-content">
                <header className="header" style={{ marginBottom: '2rem' }}>
                    <h1>Course Syllabus</h1>
                </header>
                
                {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading subjects...</div>}
                {error && <div style={{ color: 'red', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>Error: {error}</div>}

                {!loading && !error && (
                    <div className="table-container">
                        {Object.keys(subjectsBySemester).sort((a,b)=>a-b).map(sem => (
                            <div key={sem} style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid #3b82f6', paddingBottom: '0.5rem', display: 'inline-block' }}>
                                    Semester {sem}
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e5e7eb' }}>Subject Name</th>
                                            <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e5e7eb' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjectsBySemester[sem].map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '1rem' }}>{s.name}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button 
                                                        onClick={() => fetchSyllabus(s.id)} 
                                                        className="btn-primary"
                                                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: '#3b82f6' }}
                                                    >
                                                        View Syllabus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {subjectsBySemester[sem].length === 0 && (
                                            <tr>
                                                <td colSpan="2" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No subjects found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        {Object.keys(subjectsBySemester).length === 0 && (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No syllabus data available.</p>
                        )}
                    </div>
                )}

                {syllabusSubject && (
                    <div className="modal-overlay" onClick={() => setSyllabusSubject(null)}>
                        <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
                            <button className="close-btn" onClick={() => setSyllabusSubject(null)}>&times;</button>
                            <h2 style={{ marginBottom: '1rem' }}>{syllabusSubject.name} - Syllabus</h2>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {syllabusData.length === 0 ? (
                                    <p>No syllabus data available yet.</p>
                                ) : (
                                    syllabusData.map(topic => (
                                        <div key={topic.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontWeight: 'bold', minWidth: '60px' }}>Unit {topic.unit_number}</span>
                                            <span>{topic.topic_name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentSyllabus;
