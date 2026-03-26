import API_URL from '../apiConfig';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const StudentFeedback = () => {
    const [subjects, setSubjects] = useState([]);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [feedbackSubject, setFeedbackSubject] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [myFeedback, setMyFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const fetchMyFeedback = async () => {
        try {
            const res = await axios.get(`${API_URL}/student/my-feedback`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMyFeedback(res.data);
        } catch (err) {
            console.error('Error fetching my feedback:', err);
        }
    };

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/student/reports`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                const semesters = Object.keys(res.data.semesterData).sort((a,b) => b - a);
                let currentSem = null;
                for (let sem of semesters) {
                    if (res.data.semesterData[sem].isContinuing) {
                        currentSem = sem;
                        break;
                    }
                }
                if (!currentSem && semesters.length > 0) currentSem = semesters[0];
                
                setCurrentSemester(currentSem);

                if (currentSem) {
                    const semSubjects = [];
                    const subjectIds = new Set();
                    res.data.semesterData[currentSem].marks.forEach(m => {
                        if (!subjectIds.has(m.subject_id)) {
                            subjectIds.add(m.subject_id);
                            semSubjects.push({ id: m.subject_id, name: m.subject_name });
                        }
                    });
                    setSubjects(semSubjects);
                } else {
                    setSubjects([]);
                }
            } catch (err) {
                console.error('Error fetching subjects:', err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
        fetchMyFeedback();
    }, []);

    const submitFeedback = async () => {
        if (!feedbackText.trim()) {
            alert('Please enter some feedback before submitting.');
            return;
        }
        
        try {
            await axios.post(`${API_URL}/student/feedback`, {
                subject_id: feedbackSubject.id,
                feedback_text: feedbackText,
                is_anonymous: true
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Feedback submitted successfully!');
            setFeedbackSubject(null);
            setFeedbackText('');
            fetchMyFeedback();
        } catch (err) {
            alert('Error submitting feedback');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Student" />
            <div className="main-content">
                <header className="header" style={{ marginBottom: '2rem' }}>
                    <h1>Course Feedback</h1>
                </header>
                
                {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading subjects...</div>}
                {error && <div style={{ color: 'red', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>Error: {error}</div>}

                {!loading && !error && (
                    <div className="table-container">
                        <h3 style={{ marginBottom: '0.5rem' }}>Provide Feedback for Semester {currentSemester}</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Your feedback helps improve course quality and is completely anonymous.
                        </p>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e5e7eb' }}>Subject Name</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e5e7eb' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>{s.name}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => setFeedbackSubject(s)} 
                                                className="btn-primary"
                                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: '#10b981' }}
                                            >
                                                Give Feedback
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {subjects.length === 0 && (
                                    <tr>
                                        <td colSpan="2" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No subjects found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {myFeedback.length > 0 && (
                    <div className="table-container" style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Your Submitted Feedback</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myFeedback.map((fb) => (
                                <div key={fb.id} style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>{fb.subject_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{formatDate(fb.created_at)}</div>
                                    </div>
                                    <p style={{ margin: 0, color: '#444', lineHeight: '1.5' }}>"{fb.feedback_text}"</p>

                                    {fb.faculty_reply ? (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#eef2ff', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.3rem' }}>
                                                Faculty Reply
                                            </div>
                                            <p style={{ margin: 0, color: '#444' }}>{fb.faculty_reply}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>
                                                {formatDate(fb.replied_at)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                            Awaiting faculty reply...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {feedbackSubject && (
                    <div className="modal-overlay" onClick={() => setFeedbackSubject(null)}>
                        <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
                            <button className="close-btn" onClick={() => setFeedbackSubject(null)}>&times;</button>
                            <h2 style={{ marginBottom: '1rem' }}>Feedback for {feedbackSubject.name}</h2>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                                Your feedback is shared anonymously with the faculty and department head.
                            </p>
                            <textarea
                                rows="5"
                                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '1rem' }}
                                placeholder="How is this subject being taught? Any suggestions?"
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                            ></textarea>
                            <div style={{ textAlign: 'right' }}>
                                <button className="btn-primary" onClick={submitFeedback}>Submit Feedback</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFeedback;
