import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const FacultyFeedback = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const fetchFeedback = async () => {
        try {
            const res = await axios.get(`${API_URL}/faculty/feedback`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFeedbackList(res.data);
        } catch (err) {
            console.error('Error fetching feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleReply = async (feedbackId) => {
        if (!replyText.trim()) {
            alert('Please enter a reply.');
            return;
        }
        try {
            await axios.post(`${API_URL}/faculty/feedback/reply`, {
                feedback_id: feedbackId,
                reply_text: replyText
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setReplyingTo(null);
            setReplyText('');
            fetchFeedback();
        } catch (err) {
            alert('Error submitting reply');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <header className="header" style={{ marginBottom: '2rem' }}>
                    <h1>Course Feedback</h1>
                </header>

                <div className="table-container" style={{ borderRadius: '12px' }}>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                        Feedback submitted by students for your primary subject.
                    </p>

                    {loading ? (
                        <p>Loading feedback...</p>
                    ) : feedbackList.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                            No feedback has been submitted for your subject yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {feedbackList.map((fb) => (
                                <div key={fb.id} style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                                            {fb.student_name}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                            {formatDate(fb.created_at)}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, color: '#444', lineHeight: '1.5' }}>
                                        "{fb.feedback_text}"
                                    </p>

                                    {fb.faculty_reply ? (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#eef2ff', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4f46e5', marginBottom: '0.3rem' }}>
                                                Your Reply
                                            </div>
                                            <p style={{ margin: 0, color: '#444' }}>{fb.faculty_reply}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>
                                                {formatDate(fb.replied_at)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '1rem' }}>
                                            {replyingTo === fb.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <textarea
                                                        rows="3"
                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb', resize: 'vertical' }}
                                                        placeholder="Write your reply..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    ></textarea>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                            style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                                        >Cancel</button>
                                                        <button
                                                            className="btn-primary"
                                                            onClick={() => handleReply(fb.id)}
                                                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                                        >Send Reply</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setReplyingTo(fb.id); setReplyText(''); }}
                                                    style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #6366f1', background: '#fff', color: '#6366f1', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                                                >Reply</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyFeedback;
