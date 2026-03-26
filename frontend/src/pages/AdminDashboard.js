import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faChalkboardTeacher, faBook } from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalSubjects: 0 });
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching stats', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <header className="header">
                    <h1>Admin Dashboard</h1>
                    <div className="user-profile">Welcome, {user.name}</div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <FontAwesomeIcon icon={faUserGraduate} size="2x" color="#4f46e5" />
                        <h3>Total Students</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalStudents}</p>
                    </div>
                    <div className="stat-card">
                        <FontAwesomeIcon icon={faChalkboardTeacher} size="2x" color="#10b981" />
                        <h3>Total Faculty</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalFaculty}</p>
                    </div>
                    <div className="stat-card">
                        <FontAwesomeIcon icon={faBook} size="2x" color="#ef4444" />
                        <h3>Total Subjects</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalSubjects}</p>
                    </div>
                </div>

                <div className="table-container">
                    <h3>Recent Activity / Overview</h3>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Welcome to the Digital Academic Reporting System. Use the sidebar to manage university records.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
