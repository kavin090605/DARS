import API_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const MarksEntry = () => {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [metadata, setMetadata] = useState({ departments: [], years: [] });

    const fetchStudents = async () => {
        if (!selectedDept || !selectedYear) return;
        const res = await axios.get(`${API_URL}/faculty/students/${selectedDept}/${selectedYear}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(res.data);
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await axios.get(`${API_URL}/faculty/metadata`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setMetadata(res.data);
            } catch (err) {
                console.error('Error fetching metadata:', err);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedDept || !selectedYear) {
                setSubjects([]);
                setSelectedSubject('');
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/faculty/subjects?dept=${selectedDept}&year=${selectedYear}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSubjects(res.data);
                setSelectedSubject(''); // Reset subject when dept/year changes
            } catch (err) {
                console.error('Error fetching subjects:', err);
            }
        };
        fetchSubjects();
    }, [selectedDept, selectedYear]);

    const handleMarksSubmit = async (studentId, internal, exam) => {
        // Validation
        const intMark = parseInt(internal) || 0;
        const examMark = parseInt(exam) || 0;

        if (intMark > 40) {
            alert('Internal marks cannot exceed 40');
            return;
        }
        if (examMark > 60) {
            alert('Exam marks cannot exceed 60');
            return;
        }

        try {
            await axios.post(`${API_URL}/faculty/marks`, {
                student_id: studentId,
                subject_id: selectedSubject,
                internal: intMark,
                exam: examMark
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Marks saved');
        } catch (err) {
            console.error('Error saving marks:', err);
            alert(`Error saving marks: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar role="Faculty" />
            <div className="main-content">
                <h1>Marks Entry</h1>

                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                            <option value="">Select Dept</option>
                            {metadata.departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="">Select Year</option>
                            {metadata.years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select className="form-group input" style={{ padding: '0.5rem', border: '1px solid #ddd' }} onChange={e => setSelectedSubject(e.target.value)}>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button className="btn-primary" onClick={fetchStudents}>Filter Students</button>
                    </div>
                </div>

                <div className="table-container">
                    <h3>Student List</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Roll No</th>
                                <th>Internal Marks</th>
                                <th>Exam Marks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>{s.roll_no}</td>
                                    <td><input type="number" id={`internal-${s.id}`} style={{ width: '60px' }} max="40" min="0" /></td>
                                    <td><input type="number" id={`exam-${s.id}`} style={{ width: '60px' }} max="60" min="0" /></td>
                                    <td>
                                        <button className="btn-primary" onClick={() => {
                                            const internal = document.getElementById(`internal-${s.id}`).value;
                                            const exam = document.getElementById(`exam-${s.id}`).value;
                                            handleMarksSubmit(s.id, internal, exam);
                                        }}>Save</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MarksEntry;
