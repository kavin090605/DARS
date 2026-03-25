import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({ id: '', name: '', dept: '', year: '', semester: '', credits: 3 });

    const fetchSubjects = async () => {
        const res = await axios.get('https://dars-3-ixzc.onrender.com/api/admin/subjects', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSubjects(res.data);
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://dars-3-ixzc.onrender.com/api/admin/subjects', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFormData({ id: '', name: '', dept: '', year: '', semester: '', credits: 3 });
            fetchSubjects();
            alert('Subject added successfully');
        } catch (err) {
            alert('Error adding subject');
        }
    };

    const handleDeleteSubject = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject? This will also delete all associated marks and attendance records.')) {
            try {
                await axios.delete(`https://dars-3-ixzc.onrender.com/api/admin/subjects/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchSubjects();
                alert('Subject deleted successfully');
            } catch (err) {
                alert('Error deleting subject');
            }
        }
    };

    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const departments = [...new Set(subjects.map(s => s.dept))];
    const years = [1, 2, 3, 4];
    const filteredSubjects = subjects.filter(s => s.dept === selectedDept && parseInt(s.year) === parseInt(selectedYear));

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <h1>Subject Management</h1>

                <div className="table-container" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                    <h3>Add New Subject</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Subject ID (e.g., CS3001)" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required />
                        <input className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Subject Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Department" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} required />
                        <input className="form-group input" type="number" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Year" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                        <input className="form-group input" type="number" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required />
                        <input className="form-group input" type="number" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Credits" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} required />
                        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Add Subject</button>
                    </form>
                </div>

                <div className="table-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Subject List</h3>
                        {(selectedDept || selectedYear) && (
                            <button
                                className="btn-primary"
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                                onClick={() => {
                                    if (selectedYear) setSelectedYear(null);
                                    else if (selectedDept) setSelectedDept(null);
                                }}
                            >
                                Back
                            </button>
                        )}
                    </div>

                    {!selectedDept ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {departments.map(dept => (
                                <div
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className="table-container"
                                    style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #eee', transition: 'all 0.3s' }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#007bff'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                                >
                                    <h4 style={{ margin: 0 }}>{dept}</h4>
                                </div>
                            ))}
                        </div>
                    ) : !selectedYear ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <h4 style={{ marginBottom: '1rem' }}>{selectedDept} - Select Year</h4>
                            </div>
                            {years.map(year => (
                                <div
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className="table-container"
                                    style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #eee', transition: 'all 0.3s' }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#007bff'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                                >
                                    <h4 style={{ margin: 0 }}>Year {year}</h4>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h4 style={{ marginBottom: '1.5rem', color: '#007bff' }}>{selectedDept} - Year {selectedYear}</h4>

                            {[...new Set(filteredSubjects.map(s => s.semester))].sort((a, b) => a - b).map(sem => (
                                <div key={sem} style={{ marginBottom: '2.5rem' }}>
                                    <h5 style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #007bff',
                                        marginBottom: '1rem',
                                        fontSize: '1.1rem'
                                    }}>
                                        Semester {sem}
                                    </h5>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Credits</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubjects.filter(s => s.semester === sem).map(s => (
                                                <tr key={s.id}>
                                                    <td>{s.id}</td>
                                                    <td>{s.name}</td>
                                                    <td>{s.credits}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDeleteSubject(s.id)}
                                                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}

                            {filteredSubjects.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No subjects found for this year.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectManagement;
