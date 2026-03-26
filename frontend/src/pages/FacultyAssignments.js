import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const FacultyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject_name: '', title: '', description: '', due_date: '', dept: '', year: '' });
    const [profile, setProfile] = useState(null);
    const [metadata, setMetadata] = useState({ departments: [], years: [] });

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${API_URL}/faculty/assignments`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAssignments(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await axios.get(`${API_URL}/faculty/metadata`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setMetadata(res.data);
            } catch (err) { console.error(err); }
        };
        fetchMetadata();
        fetchAssignments();
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/faculty/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setProfile(res.data);
                setForm(prev => ({ ...prev, subject_name: res.data.subject || '' }));
            } catch (err) { console.error(err); }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/faculty/assignments`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowForm(false);
            setForm({ subject_name: profile?.subject || '', title: '', description: '', due_date: '', dept: '', year: '' });
            fetchAssignments();
        } catch (err) { alert('Error creating assignment'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await axios.delete(`${API_URL}/faculty/assignments/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAssignments();
        } catch (err) { alert('Error deleting assignment'); }
    };

    const isOverdue = (date) => new Date(date) < new Date();

    return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Assignments</h1>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Create Assignment'}
                    </button>
                </header>

                {showForm && (
                    <div className="table-container" style={{ marginBottom: '2rem' }}>
                        <h3>New Assignment</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <input required placeholder="Subject" value={form.subject_name} onChange={e => setForm({...form, subject_name: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <input required placeholder="Assignment Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            
                            <select required value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <option value="">Select Department</option>
                                {metadata.departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            <select required value={form.year} onChange={e => setForm({...form, year: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <option value="">Select Year</option>
                                {metadata.years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <input required type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <div></div>
                            <textarea placeholder="Description / Instructions" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb', gridColumn: 'span 2' }} rows="4"></textarea>
                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Create Assignment</button>
                        </form>
                    </div>
                )}

                <div className="table-container">
                    {assignments.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No assignments created yet.</p>
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
                                                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}>{a.dept} (Year {a.year})</span>
                                                {isOverdue(a.due_date) && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: '600' }}>Overdue</span>}
                                            </div>
                                            <h3 style={{ margin: '0.3rem 0' }}>{a.title}</h3>
                                            {a.description && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.3rem 0' }}>{a.description}</p>}
                                            <p style={{ fontSize: '0.85rem', color: '#374151', marginTop: '0.5rem' }}>
                                                📅 Due: {new Date(a.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
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

export default FacultyAssignments;
