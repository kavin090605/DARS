import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const AcademicCalendar = () => {
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', event_date: '', event_type: 'Holiday', description: '' });

    const fetchCalendar = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/calendar', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEvents(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchCalendar(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/calendar', form, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowForm(false);
            setForm({ title: '', event_date: '', event_type: 'Holiday', description: '' });
            fetchCalendar();
        } catch (err) { alert('Error adding calendar event'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/calendar/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchCalendar();
        } catch (err) { alert('Error deleting'); }
    };

    const typeConfig = {
        'Holiday': { color: '#10b981', icon: '🌴' },
        'Exam': { color: '#ef4444', icon: '📝' },
        'Semester Start': { color: '#3b82f6', icon: '🎓' },
        'Semester End': { color: '#8b5cf6', icon: '🏁' },
        'Event': { color: '#f59e0b', icon: '🎪' },
        'Other': { color: '#6b7280', icon: '📌' }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Academic Calendar</h1>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Entry'}
                    </button>
                </header>

                {showForm && (
                    <div className="table-container" style={{ marginBottom: '2rem' }}>
                        <h3>Add Calendar Entry</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <input required placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <option>Holiday</option><option>Exam</option><option>Semester Start</option><option>Semester End</option><option>Event</option><option>Other</option>
                            </select>
                            <input required type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Add to Calendar</button>
                        </form>
                    </div>
                )}

                <div className="table-container">
                    {events.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No calendar entries yet.</p>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                            <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '3px', background: '#e5e7eb', borderRadius: '2px' }}></div>
                            {events.map(ev => {
                                const config = typeConfig[ev.event_type] || typeConfig['Other'];
                                return (
                                    <div key={ev.id} style={{
                                        position: 'relative', marginBottom: '1.5rem', padding: '1.2rem 1.5rem',
                                        background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb',
                                        borderLeft: `4px solid ${config.color}`,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div style={{
                                            position: 'absolute', left: '-2.3rem', top: '50%', transform: 'translateY(-50%)',
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            background: config.color, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '0.7rem'
                                        }}>{config.icon}</div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem',
                                                    borderRadius: '10px', color: '#fff', background: config.color
                                                }}>{ev.event_type}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                    {new Date(ev.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0.3rem 0 0 0' }}>{ev.title}</h4>
                                            {ev.description && <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>{ev.description}</p>}
                                        </div>
                                        <button onClick={() => handleDelete(ev.id)} style={{
                                            background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem'
                                        }}>×</button>
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

export default AcademicCalendar;
