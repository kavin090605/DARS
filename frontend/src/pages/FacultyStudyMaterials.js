import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const FacultyStudyMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject_name: '', title: '', content: '' });
    const [profile, setProfile] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const fetchMaterials = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/faculty/study-materials', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMaterials(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchMaterials();
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/faculty/profile', {
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
            await axios.post('http://localhost:5000/api/faculty/study-materials', form, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowForm(false);
            setForm({ subject_name: profile?.subject || '', title: '', content: '' });
            fetchMaterials();
        } catch (err) { alert('Error adding material'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this study material?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/faculty/study-materials/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchMaterials();
        } catch (err) { alert('Error deleting'); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Study Materials</h1>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Material'}
                    </button>
                </header>

                {showForm && (
                    <div className="table-container" style={{ marginBottom: '2rem' }}>
                        <h3>Post Study Material</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input required placeholder="Subject" value={form.subject_name} onChange={e => setForm({...form, subject_name: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <input required placeholder="Material Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <textarea required placeholder="Write the study notes / content here..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} rows="8"></textarea>
                            <button type="submit" className="btn-primary">Post Material</button>
                        </form>
                    </div>
                )}

                <div className="table-container">
                    {materials.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No study materials posted yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {materials.map(m => (
                                <div key={m.id} style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', fontWeight: '600' }}>{m.subject_name}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                    {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 style={{ margin: '0.3rem 0', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                                                📚 {m.title} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{expandedId === m.id ? '▲' : '▼'}</span>
                                            </h3>
                                            {expandedId === m.id && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#374151', fontSize: '0.95rem' }}>
                                                    {m.content}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '1rem' }}>×</button>
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

export default FacultyStudyMaterials;
