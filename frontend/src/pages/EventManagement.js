import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', event_type: 'Sports', event_date: '', location: '' });

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/events`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEvents(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/events`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowForm(false);
            setForm({ title: '', description: '', event_type: 'Sports', event_date: '', location: '' });
            fetchEvents();
        } catch (err) { alert('Error creating event'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await axios.delete(`${API_URL}/admin/events/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchEvents();
        } catch (err) { alert('Error deleting event'); }
    };

    const typeColors = {
        Sports: '#3b82f6', Cultural: '#8b5cf6', Academic: '#10b981',
        Hackathon: '#f59e0b', Workshop: '#ef4444'
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Sports & Events Management</h1>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Event'}
                    </button>
                </header>

                {showForm && (
                    <div className="table-container" style={{ marginBottom: '2rem' }}>
                        <h3>Create New Event</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <input required placeholder="Event Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <option>Sports</option><option>Cultural</option><option>Academic</option><option>Hackathon</option><option>Workshop</option>
                            </select>
                            <input required type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <input required placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #e5e7eb', gridColumn: 'span 2' }} rows="3"></textarea>
                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Create Event</button>
                        </form>
                    </div>
                )}

                <div className="table-container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {events.length === 0 ? (
                            <p style={{ color: '#9ca3af', gridColumn: 'span 3', textAlign: 'center', padding: '3rem' }}>No events created yet.</p>
                        ) : events.map(ev => (
                            <div key={ev.id} style={{
                                background: '#fff', borderRadius: '12px', padding: '1.5rem',
                                border: '1px solid #e5e7eb', borderTop: `4px solid ${typeColors[ev.event_type] || '#6b7280'}`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.6rem',
                                        borderRadius: '12px', color: '#fff',
                                        background: typeColors[ev.event_type] || '#6b7280'
                                    }}>{ev.event_type}</span>
                                    <button onClick={() => handleDelete(ev.id)} style={{
                                        background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem'
                                    }}>×</button>
                                </div>
                                <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{ev.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.5rem 0' }}>{ev.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: '#374151' }}>
                                    <span>📍 {ev.location}</span>
                                    <span>📅 {new Date(ev.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventManagement;
