import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${API_URL}/student/assignments`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAssignments(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const isOverdue = (date) => new Date(date) < new Date();

    return (
        <div className="dashboard-layout">
            <Sidebar role="Student" />
            <div className="main-content">
                <header className="header">
                    <h1>My Assignments</h1>
                </header>

                <div className="table-container" style={{ marginTop: '1rem' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading assignments...</p>
                    ) : assignments.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No assignments for your department and year yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {assignments.map(a => (
                                <div key={a.id} style={{
                                    padding: '1.5rem', background: '#f8f9fa', borderRadius: '10px',
                                    borderLeft: `4px solid ${isOverdue(a.due_date) ? '#ef4444' : '#3b82f6'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: '#dbeafe', color: '#1d4ed8', fontWeight: '600' }}>{a.subject_name}</span>
                                                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}>By {a.faculty_name}</span>
                                                {isOverdue(a.due_date) && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: '600' }}>Overdue</span>}
                                            </div>
                                            <h3 style={{ margin: '0.3rem 0' }}>{a.title}</h3>
                                            {a.description && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.3rem 0' }}>{a.description}</p>}
                                            <p style={{ fontSize: '0.85rem', color: '#374151', marginTop: '0.5rem' }}>
                                                📅 Due: {new Date(a.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAssignments;
