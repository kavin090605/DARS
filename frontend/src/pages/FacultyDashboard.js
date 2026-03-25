import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const FacultyDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('https://dars-3-ixzc.onrender.com/api/faculty/profile', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.message || 'Failed to load profile details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <p>Loading profile...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <h1>Faculty Dashboard</h1>

                <div className="table-container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ width: '80px', height: '80px', background: '#007bff', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                            {profile.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>{profile.name}</h2>
                            <p style={{ margin: '0.2rem 0', color: '#666' }}>{profile.dept} Department</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="profile-item">
                            <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{profile.email}</p>
                        </div>
                        <div className="profile-item">
                            <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '0.3rem' }}>Primary Subject</label>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{profile.subject || 'N/A'}</p>
                        </div>
                        <div className="profile-item">
                            <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '0.3rem' }}>Age</label>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{profile.age} Years</p>
                        </div>
                        <div className="profile-item">
                            <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '0.3rem' }}>Date of Birth</label>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{formatDate(profile.dob)}</p>
                        </div>
                        <div className="profile-item">
                            <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '0.3rem' }}>Department</label>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{profile.dept}</p>
                        </div>
                        <div className="profile-item">
                            <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '0.3rem' }}>Date of Joining</label>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{formatDate(profile.doj)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
