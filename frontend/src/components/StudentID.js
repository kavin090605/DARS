import React from 'react';

const StudentID = ({ student, onClose }) => {
    if (!student) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
            <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()} style={{
                maxWidth: '400px',
                padding: '0',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* ID Card Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: '#fff',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
                    >
                        &times;
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '2px' }}>DARS</h2>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.8rem' }}>DIGITAL STUDENT IDENTITY</p>
                </div>

                {/* ID Card Body */}
                <div style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
                    {/* Profile Photo Placeholder */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        margin: '-60px auto 1rem auto',
                        border: '5px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <span style={{ fontSize: '3rem', color: '#9ca3af' }}>👤</span>
                    </div>

                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.4rem' }}>{student.name}</h3>
                    <p style={{ margin: 0, color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>{student.roll_no}</p>

                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Department</label>
                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '500' }}>{student.department}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Year of Join</label>
                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '500' }}>{student.year ? 2025 - (student.year - 1) : '2021'}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Date of Birth</label>
                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '500' }}>{new Date(student.dob).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Blood Group</label>
                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '500' }}>O+ve</span>
                        </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div style={{ marginTop: '2.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'inline-block' }}>
                        <div style={{ width: '80px', height: '80px', background: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '60px', height: '60px', background: '#fff' }}></div>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.6rem', color: '#9ca3af' }}>SCAN FOR VERIFICATION</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ background: '#f9fafb', padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>
                    VALID TILL JUNE 2025 • ACADEMIC SESSION
                </div>
            </div>
        </div>
    );
};

export default StudentID;
