import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dept: '',
        age: '',
        dob: '',
        subject: '',
        doj: ''
    });

    const fetchFaculty = async () => {
        const res = await axios.get('http://localhost:5000/api/admin/faculty', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFaculty(res.data);
    };

    useEffect(() => { fetchFaculty(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/faculty', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFormData({
                name: '',
                email: '',
                password: '',
                dept: '',
                age: '',
                dob: '',
                subject: '',
                doj: ''
            });
            fetchFaculty();
            alert('Faculty added successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding faculty');
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (window.confirm('Are you sure you want to delete this faculty? This will also delete their account.')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/faculty/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchFaculty();
                alert('Faculty deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting faculty');
            }
        }
    };

    const handleDeleteDept = async (e, deptName) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the entire '${deptName}' department? This will delete all faculty, students, and subjects associated with it.`)) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/departments/${deptName}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchFaculty();
                alert('Department deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting department');
            }
        }
    };

    const [selectedDept, setSelectedDept] = useState(null);
    const departments = [...new Set(faculty.map(f => f.dept))];
    const filteredFaculty = faculty.filter(f => f.dept === selectedDept);

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <h1>Faculty Management</h1>

                <div className="table-container" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                    <h3>Add New Faculty</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input className="nav-link" style={{ gridColumn: 'span 2', width: '100%', color: 'black', border: '1px solid #ddd' }} placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input className="nav-link" style={{ gridColumn: 'span 2', width: '100%', color: 'black', border: '1px solid #ddd' }} placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <input className="nav-link" type="password" style={{ gridColumn: 'span 2', width: '100%', color: 'black', border: '1px solid #ddd' }} placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                        <input className="nav-link" style={{ width: '100%', color: 'black', border: '1px solid #ddd' }} placeholder="Department" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} required />
                        <input className="nav-link" type="number" style={{ width: '100%', color: 'black', border: '1px solid #ddd' }} placeholder="Age" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} required />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>DOB</label>
                            <input className="nav-link" type="date" style={{ width: '100%', color: 'black', border: '1px solid #ddd' }} value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
                        </div>
                        <input className="nav-link" style={{ width: '100%', color: 'black', border: '1px solid #ddd' }} placeholder="Primary Subject" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Date of Joining</label>
                            <input className="nav-link" type="date" style={{ width: '100%', color: 'black', border: '1px solid #ddd' }} value={formData.doj} onChange={e => setFormData({ ...formData, doj: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>Add Faculty</button>
                    </form>
                </div>

                <div className="table-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Faculty List</h3>
                        {selectedDept && (
                            <button
                                className="btn-primary"
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                                onClick={() => setSelectedDept(null)}
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
                                    style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #eee', transition: 'all 0.3s', position: 'relative' }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#007bff'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                                >
                                    <h4 style={{ margin: 0 }}>{dept}</h4>
                                    <button
                                        onClick={(e) => handleDeleteDept(e, dept)}
                                        style={{ position: 'absolute', top: '5px', right: '5px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h4 style={{ marginBottom: '1rem' }}>{selectedDept} Department</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFaculty.map((f, index) => {
                                        const deptCode = f.dept ? f.dept.substring(0, 2).toUpperCase() : 'FA';
                                        const customId = `${deptCode}${String(index + 1).padStart(3, '0')}`;
                                        return (
                                            <tr key={f.id}>
                                                <td>{customId}</td>
                                                <td>{f.name}</td>
                                                <td>{f.email}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteFaculty(f.id)}
                                                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyManagement;
