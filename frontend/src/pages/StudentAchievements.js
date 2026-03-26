import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const StudentAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', category: 'Academic', description: '', date_achieved: '' });

    const fetchAchievements = async () => {
        try {
            const res = await axios.get(`${API_URL}/student/achievements`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAchievements(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchAchievements(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/student/achievements`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowForm(false);
            setForm({ title: '', category: 'Academic', description: '', date_achieved: '' });
            fetchAchievements();
        } catch (err) { alert('Error adding achievement'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this achievement?')) return;
        try {
            await axios.delete(`${API_URL}/student/achievements/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAchievements();
        } catch (err) { alert('Error deleting'); }
    };

    const categoryConfig = {
        Sports: { color: '#3b82f6', icon: '🏆' },
        Academic: { color: '#10b981', icon: '📚' },
        Cultural: { color: '#8b5cf6', icon: '🎭' },
        Hackathon: { color: '#f59e0b', icon: '💻' },
        Certification: { color: '#ef4444', icon: '📜' },
        Other: { color: '#6b7280', icon: '⭐' }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Student" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>My Achievements</h1>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Achievement'}
                    </button>
                </header>

                {showForm && (
                    <div className="table-container" style={{ marginBottom: '2rem' }}>
                        <h3>Log New Achievement</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <input required placeholder="Achievement Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <option>Academic</option><option>Sports</option><option>Cultural</option><option>Hackathon</option><option>Certification</option><option>Other</option>
                            </select>
                            <input required type="date" value={form.date_achieved} onChange={e => setForm({...form, date_achieved: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <div></div>
                            <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb', gridColumn: 'span 2' }} rows="3"></textarea>
                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Add Achievement</button>
                        </form>
                    </div>
                )}

                <div className="table-container">
                    {achievements.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No achievements logged yet. Start adding your accomplishments!</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {achievements.map(a => {
                                const config = categoryConfig[a.category] || categoryConfig['Other'];
                                return (
                                    <div key={a.id} style={{
                                        background: '#fff', borderRadius: '12px', padding: '1.5rem',
                                        border: '1px solid #e5e7eb', borderTop: `4px solid ${config.color}`,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: '2rem' }}>{config.icon}</span>
                                            <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                        </div>
                                        <h3 style={{ margin: '0.5rem 0 0.3rem 0', fontSize: '1.05rem' }}>{a.title}</h3>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem',
                                            borderRadius: '10px', color: '#fff', background: config.color
                                        }}>{a.category}</span>
                                        {a.description && <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.8rem 0 0.5rem 0' }}>{a.description}</p>}
                                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0.5rem 0 0 0' }}>
                                            📅 {new Date(a.date_achieved).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAchievements;
