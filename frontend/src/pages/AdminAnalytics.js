import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/analytics`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content"><p>Loading analytics...</p></div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" />
            <div className="main-content">
                <header className="header"><h1>Analytics Dashboard</h1></header>

                <div className="stats-grid" style={{ marginTop: '1rem' }}>
                    {/* Department-wise Students */}
                    <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Students by Department</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={data?.deptStudents?.map(d => ({ dept: d.dept.split(' ')[0], count: d.count }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                                        <LabelList dataKey="count" position="top" fill="#fff" fontSize={13} fontWeight="bold" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Year-wise Distribution */}
                    <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Students by Year</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={data?.yearStudents?.map(y => ({ name: `Year ${y.year}`, value: y.count }))}
                                        cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {data?.yearStudents?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="stats-grid" style={{ marginTop: '1rem' }}>
                    {/* Dept Average Marks */}
                    <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Average Marks by Department</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={data?.deptAvgMarks?.map(d => ({ dept: d.dept.split(' ')[0], avg: d.avg_marks }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                    <Bar dataKey="avg" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40}>
                                        <LabelList dataKey="avg" position="top" fill="#fff" fontSize={13} fontWeight="bold" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pass vs Fail by Department */}
                    <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Pass vs Fail by Department</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={data?.deptPassFail?.map(d => ({ dept: d.dept.split(' ')[0], passed: Number(d.passed), failed: Number(d.failed) }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="passed" name="Passed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20}>
                                        <LabelList dataKey="passed" position="top" fill="#fff" fontSize={11} />
                                    </Bar>
                                    <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20}>
                                        <LabelList dataKey="failed" position="top" fill="#fff" fontSize={11} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                {/* Failed Students List */}
                <div className="stat-card" style={{ backgroundColor: '#111827', color: '#fff', border: 'none', marginTop: '1.5rem' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Failed Students Details (At-Risk)</h3>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                                    <th style={{ padding: '0.75rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem' }}>Roll No</th>
                                    <th style={{ padding: '0.75rem' }}>Department</th>
                                    <th style={{ padding: '0.75rem' }}>Failed Subjects</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.failedStudents?.length > 0 ? (
                                    data.failedStudents.map((st, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                                            <td style={{ padding: '0.75rem' }}>{st.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{st.roll_no}</td>
                                            <td style={{ padding: '0.75rem' }}>{st.dept}</td>
                                            <td style={{ padding: '0.75rem' }}><span style={{ color: '#ef4444' }}>{st.failed_subjects}</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No students have failed any subjects.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
