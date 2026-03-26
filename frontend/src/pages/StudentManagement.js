import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', roll_no: '', dept: '', year: '', dob: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewAll, setViewAll] = useState(false);

    const fetchStudents = async () => {
        const res = await axios.get('http://localhost:5000/api/admin/students', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(res.data);
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/students', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFormData({ name: '', email: '', password: '', roll_no: '', dept: '', year: '', dob: '' });
            fetchStudents();
            alert('Student added successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding student');
        }
    };

    const handleDeleteStudent = async (id) => {
        if (window.confirm('Are you sure you want to delete this student? This will also delete their account, marks, and attendance.')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchStudents();
                alert('Student deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting student');
            }
        }
    };

    const handleDeleteDept = async (e, deptName) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the entire '${deptName}' department? This will delete all students, faculty, and subjects associated with it.`)) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/departments/${deptName}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchStudents();
                alert('Department deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting department');
            }
        }
    };


    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const departments = [...new Set(students.map(s => s.dept))];
    const years = [1, 2, 3, 4];

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.roll_no.toLowerCase().includes(searchTerm.toLowerCase());

        if (searchTerm) return matchesSearch;
        if (viewAll) return true;

        return s.dept === selectedDept && parseInt(s.year) === parseInt(selectedYear);
    });

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <h1>Student Management</h1>

                <div className="table-container" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                    <h3>Add New Student</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input className="form-group input" style={{ gridColumn: 'span 2', padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input className="form-group input" style={{ gridColumn: 'span 2', padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <input className="form-group input" type="password" style={{ gridColumn: 'span 2', padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                        <input className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Roll No" value={formData.roll_no} onChange={e => setFormData({ ...formData, roll_no: e.target.value })} required />
                        <input className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Department" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} required />
                        <input className="form-group input" type="number" style={{ padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Year" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                        <input className="form-group input" type="date" style={{ padding: '0.5rem', border: '1px solid #ddd' }} value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
                        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Add Student</button>
                    </form>
                </div>

                <div className="table-container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Student List</h3>
                            <button
                                className="btn-primary"
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', backgroundColor: viewAll ? '#4f46e5' : '#888' }}
                                onClick={() => {
                                    setViewAll(!viewAll);
                                    setSelectedDept(null);
                                    setSelectedYear(null);
                                    setSearchTerm('');
                                }}
                            >
                                {viewAll ? 'View by Dept/Year' : 'View All'}
                            </button>
                        </div>
                        <input
                            className="form-group input"
                            style={{ maxWidth: '250px', padding: '0.5rem', border: '1px solid #ddd', margin: 0 }}
                            placeholder="Search by name or roll no..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (e.target.value) {
                                    setViewAll(false);
                                    setSelectedDept(null);
                                    setSelectedYear(null);
                                }
                            }}
                        />
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

                    {(!selectedDept && !searchTerm && !viewAll) ? (
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
                            {departments.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>No departments found. Add a student to get started.</p>}
                        </div>
                    ) : (!selectedYear && !searchTerm && !viewAll) ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <h4 style={{ marginBottom: '1rem' }}>{selectedDept} - Select Year</h4>
                            </div>
                            {years.map(year => (
                                <div
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className="table-container"
                                    style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #eee', transition: 'all 0.3s', position: 'relative' }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#007bff'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                                >
                                    <h4 style={{ margin: 0 }}>Year {year}</h4>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h4 style={{ marginBottom: '1rem' }}>
                                {searchTerm ? `Search Results for "${searchTerm}"` : viewAll ? 'All Students' : `${selectedDept} - Year ${selectedYear}`}
                            </h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Roll No</th>
                                        <th>Dept</th>
                                        <th>Year</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((s) => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td>{s.roll_no}</td>
                                                <td>{s.dept}</td>
                                                <td>{s.year}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteStudent(s.id)}
                                                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center' }}>No students found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
