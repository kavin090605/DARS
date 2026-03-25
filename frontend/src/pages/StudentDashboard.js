import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import StudentID from '../components/StudentID';

const StudentDashboard = () => {
    const [data, setData] = useState({ student: {}, marks: [], attendance: [], overallAttendance: 0, semesterData: {}, cgpa: 0, currentGpa: 0 });
    const [activeSemester, setActiveSemester] = useState(null);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showIDCard, setShowIDCard] = useState(false);
    const [showGPAGoal, setShowGPAGoal] = useState(false);
    const [targetCGPA, setTargetCGPA] = useState(8.5);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:5000/api/student/reports', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setData(res.data);
                const semesters = Object.keys(res.data.semesterData).sort((a, b) => b - a);
                if (semesters.length > 0) setActiveSemester(semesters[0]);
            } catch (err) {
                console.error('Error fetching report:', err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/student/notifications', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setNotifications(res.data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Auto-poll every 15s
        return () => clearInterval(interval);
    }, []);

    const toRoman = (num) => {
        const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
        return roman[num - 1] || num;
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/student/notifications/read/${id}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking as read');
        }
    };

    const calculateGoal = () => {
        const currentCGPA = data.cgpa || 0;
        const semsCompleted = Object.keys(data.semesterData).filter(s => !data.semesterData[s].isContinuing).length;
        const totalSems = 8;
        const remainingSems = totalSems - semsCompleted;

        if (remainingSems <= 0) return "N/A - Degree Completed";

        // Target * total = currentGP + requiredGP
        const targetTotalGP = targetCGPA * totalSems;
        const currentGP = currentCGPA * semsCompleted;
        const requiredGP = targetTotalGP - currentGP;
        const requiredSGPA = requiredGP / remainingSems;

        if (requiredSGPA > 10) return "Not possible (requires > 10.0)";
        if (requiredSGPA < 0) return "Already achieved!";
        return requiredSGPA.toFixed(2);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Student" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Student Dashboard</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
                            <span style={{ fontSize: '1.5rem' }}>🔔</span>
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: '#ef4444', color: '#fff',
                                    fontSize: '0.6rem', padding: '2px 5px',
                                    borderRadius: '10px', fontWeight: 'bold'
                                }}>
                                    {notifications.filter(n => !n.is_read).length}
                                </span>
                            )}
                        </div>
                        <button className="btn-primary" onClick={() => setShowIDCard(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Digital ID</button>
                    </div>
                </header>

                {showNotifications && (
                    <div style={{
                        position: 'absolute', top: '70px', right: '20px',
                        width: '300px', background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000, padding: '1rem'
                    }}>
                        <h4 style={{ color: '#111827', margin: '0 0 1rem 0' }}>Notifications</h4>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>No notifications</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => markAsRead(n.id)} style={{
                                        padding: '0.8rem', borderBottom: '1px solid #f3f4f6',
                                        background: n.is_read ? '#fff' : '#f9fafb',
                                        cursor: 'pointer', fontSize: '0.8rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{n.type.replace('_', ' ')}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#4b5563' }}>{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading report...</div>}
                {error && <div style={{ color: 'red', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>Error: {error}</div>}

                {(data.student.id || !loading) && (
                    <>

                        <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h2 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>
                                    {data.student.name || user.name}
                                </h2>
                                <div style={{ fontSize: '2rem', color: '#d1d5db', fontWeight: '500' }}>
                                    {data.student.roll_no}
                                </div>
                                <div style={{ fontSize: '1.2rem', color: '#9ca3af', fontWeight: '400', marginTop: '0.5rem' }}>
                                    SEMESTER - {toRoman(data.student.year * 2 - 1)}
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <div style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 'bold',
                                        color: data.semesterData[Object.keys(data.semesterData).sort((a, b) => b - a)[0]]?.isContinuing ? '#f59e0b' : '#a78bfa',
                                        letterSpacing: '1.5px',
                                        textShadow: '0 0 10px rgba(167, 139, 250, 0.3)'
                                    }}>
                                        {data.semesterData[Object.keys(data.semesterData).sort((a, b) => b - a)[0]]?.isContinuing ? 'IN PROGRESS' : 'RESULTS DECLARED'}
                                    </div>
                                    <div style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 'bold',
                                        color: '#60a5fa',
                                        borderLeft: '2px solid #374151',
                                        paddingLeft: '2rem'
                                    }}>
                                        CGPA: {data.cgpa || '0.00'}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    color: '#9ca3af',
                                    marginTop: '2rem',
                                    fontWeight: '500',
                                    lineHeight: '1.4',
                                    textTransform: 'uppercase'
                                }}>
                                    B.E. - {data.student.department || 'ENGINEERING'}
                                </div>
                            </div>
                        </div>

                        <h2 style={{ marginBottom: '1.5rem' }}>Student Performance</h2>

                        <div className="stats-grid">
                            <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: '#fff', margin: 0, fontWeight: '600' }}>GPA Performance</h3>
                                    <button
                                        onClick={() => setShowGPAGoal(!showGPAGoal)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                    >
                                        Goal Tracker
                                    </button>
                                </div>

                                {showGPAGoal && (
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>Target CGPA</label>
                                                <input
                                                    type="number" step="0.1" value={targetCGPA}
                                                    onChange={(e) => setTargetCGPA(e.target.value)}
                                                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', width: '60px', borderBottom: '1px solid #3b82f6' }}
                                                />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <label style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>Required Avg SGPA</label>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>{calculateGoal()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ width: '100%', height: showGPAGoal ? 220 : 320 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={Object.keys(data.semesterData)
                                                .filter(sem => data.semesterData[sem].gpa !== null)
                                                .sort((a, b) => a - b)
                                                .map(sem => ({
                                                    semester: toRoman(parseInt(sem)),
                                                    sgpa: data.semesterData[sem].gpa
                                                }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis
                                                dataKey="semester"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 14, fontWeight: '500' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                tickFormatter={(val) => val.toFixed(2)}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#1f2937' }}
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                                            />
                                            <Bar
                                                dataKey="sgpa"
                                                fill="#3b82f6"
                                                radius={[6, 6, 0, 0]}
                                                barSize={55}
                                            >
                                                <LabelList dataKey="sgpa" position="top" fill="#fff" fontSize={14} fontWeight="bold" formatter={(val) => val > 0 ? val.toFixed(2) : ''} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="stat-card" style={{ transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' } }}>
                                <h3>Attendance Health</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: showGPAGoal ? 200 : 300 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 'bold', color: (data.overallAttendance || 0) >= 75 ? '#10b981' : '#ef4444' }}>
                                            {data.overallAttendance || 0}%
                                        </span>
                                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{(data.overallAttendance || 0) >= 75 ? 'Safe Status' : 'Below 75% Requirement!'}</p>
                                        <button className="btn-primary" onClick={() => setShowAttendanceModal(true)} style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.7rem', background: (data.overallAttendance || 0) >= 75 ? '#10b981' : '#ef4444' }}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Academic Records & Internal Marks</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '0.4rem 0.8rem', opacity: activeSemester <= Math.min(...Object.keys(data.semesterData)) ? 0.5 : 1 }}
                                        onClick={() => setActiveSemester(prev => Math.max(Math.min(...Object.keys(data.semesterData)), parseInt(prev) - 1).toString())}
                                        disabled={activeSemester <= Math.min(...Object.keys(data.semesterData))}
                                    >
                                        ← Previous Sem
                                    </button>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '0.4rem 0.8rem', opacity: activeSemester >= Math.max(...Object.keys(data.semesterData)) ? 0.5 : 1 }}
                                        onClick={() => setActiveSemester(prev => Math.min(Math.max(...Object.keys(data.semesterData)), parseInt(prev) + 1).toString())}
                                        disabled={activeSemester >= Math.max(...Object.keys(data.semesterData))}
                                    >
                                        Next Sem →
                                    </button>
                                </div>
                            </div>

                            {activeSemester && data.semesterData[activeSemester] && (
                                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '4px', borderLeft: '4px solid #007bff' }}>
                                        <h4 style={{ margin: 0 }}>Semester {activeSemester}</h4>
                                        <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                                            SGPA: {data.semesterData[activeSemester].isContinuing ? 'In Progress' : data.semesterData[activeSemester].gpa.toFixed(2)}
                                        </span>
                                    </div>
                                    <table style={{ marginBottom: '1rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Internal</th>
                                                {!data.semesterData[activeSemester].isContinuing && (
                                                    <>
                                                        <th>Exam</th>
                                                        <th>Total</th>
                                                        <th>Points</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.semesterData[activeSemester].marks.map((m) => (
                                                <tr key={m.id}>
                                                    <td>{m.subject_name}</td>
                                                    <td style={{ fontWeight: 'bold', color: '#6610f2' }}>{m.internal}</td>
                                                    {!data.semesterData[activeSemester].isContinuing && (
                                                        <>
                                                            <td>{m.exam}</td>
                                                            <td>{m.total}</td>
                                                            <td>{m.gradePoints}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {showIDCard && <StudentID student={data.student} onClose={() => setShowIDCard(false)} />}

                        {showAttendanceModal && (
                            <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
                                <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
                                    <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>&times;</button>
                                    <h2 style={{ marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>
                                        Detailed Attendance Breakdown
                                    </h2>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', color: '#fff' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', color: '#9ca3af', borderBottom: '2px solid #374151' }}>
                                                    <th style={{ padding: '1rem' }}>Subject Name</th>
                                                    <th style={{ padding: '1rem' }}>Attended</th>
                                                    <th style={{ padding: '1rem' }}>Missed</th>
                                                    <th style={{ padding: '1rem' }}>Total</th>
                                                    <th style={{ padding: '1rem' }}>Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.attendance.map((a, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #1f2937' }}>
                                                        <td style={{ padding: '1rem' }}>{a.subject_name}</td>
                                                        <td style={{ padding: '1rem', color: '#10b981', fontWeight: 'bold' }}>{a.attended_classes}</td>
                                                        <td style={{ padding: '1rem', color: '#ef4444', fontWeight: 'bold' }}>{a.total_classes - a.attended_classes}</td>
                                                        <td style={{ padding: '1rem' }}>{a.total_classes}</td>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: a.percentage >= 75 ? '#10b981' : '#ef4444' }}>
                                                            {a.percentage}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                        <button
                                            className="btn-primary"
                                            style={{ width: 'auto', padding: '0.75rem 2rem' }}
                                            onClick={() => setShowAttendanceModal(false)}
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
