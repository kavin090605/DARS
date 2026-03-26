import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportCard = () => {
    const [data, setData] = useState({ student: {}, semesterData: {}, cgpa: 0 });
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const reportRef = useRef();

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/student/reports', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setData(res.data);
                const semesters = Object.keys(res.data.semesterData).sort((a, b) => b - a);
                if (semesters.length > 0) setSelectedSemester(semesters[0]);
            } catch (err) {
                console.error('Error fetching report:', err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    const downloadPDF = () => {
        const input = reportRef.current;
        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${data.student.roll_no}_Semester_${selectedSemester}_Report.pdf`);
        });
    };

    const toRoman = (num) => {
        const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
        return roman[num - 1] || num;
    };

    if (loading) return <div className="dashboard-layout"><Sidebar role="Student" /><div className="main-content">Loading...</div></div>;
    if (error) return <div className="dashboard-layout"><Sidebar role="Student" /><div className="main-content" style={{ color: 'red' }}>Error: {error}</div></div>;

    const semesters = Object.keys(data.semesterData).sort((a, b) => a - b);

    return (
        <div className="dashboard-layout">
            <Sidebar role="Student" />
            <div className="main-content">
                <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <h1>Academic Report Card</h1>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}
                        >
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn-primary" onClick={downloadPDF} style={{ backgroundColor: '#10b981' }}>
                        Download PDF (Sem {selectedSemester})
                    </button>
                </header>

                <div
                    ref={reportRef}
                    style={{
                        background: '#fff',
                        padding: '50px',
                        borderRadius: '0',
                        color: '#000',
                        maxWidth: '800px',
                        margin: '0 auto',
                        boxShadow: '0 0 20px rgba(0,0,0,0.05)',
                        fontFamily: "'Times New Roman', Times, serif",
                        border: '1px solid #eee'
                    }}
                >
                    {/* Institutional Header */}
                    <div style={{ textAlign: 'center', borderBottom: '3px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                        <h1 style={{ margin: '0', fontSize: '26px', textTransform: 'uppercase' }}>Departmental Academic Records System</h1>
                        <p style={{ margin: '5px 0', fontSize: '16px', letterSpacing: '2px' }}>OFFICIAL SEMESTER GRADE SHEET</p>
                    </div>

                    {/* Student Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>
                        <div>
                            <p><strong>NAME OF STUDENT:</strong> <span style={{ textTransform: 'uppercase' }}>{data.student.name}</span></p>
                            <p><strong>ROLL NUMBER:</strong> {data.student.roll_no}</p>
                            <p><strong>DEPARTMENT:</strong> {data.student.department}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p><strong>SEMESTER:</strong> {toRoman(parseInt(selectedSemester))}</p>
                            <p><strong>EXAMINATION:</strong> {data.student.year} YEAR B.E.</p>
                            <p><strong>SGPA:</strong> <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{data.semesterData[selectedSemester]?.isContinuing ? 'Continuing' : data.semesterData[selectedSemester]?.gpa.toFixed(2)}</span></p>
                        </div>
                    </div>

                    {/* Semester Table */}
                    {selectedSemester && data.semesterData[selectedSemester] && (
                        <div style={{ marginBottom: '40px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #000' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #000' }}>Subject Name</th>
                                        <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #000' }}>Credits</th>
                                        <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #000' }}>Internal</th>
                                        <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #000' }}>Exam</th>
                                        <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #000' }}>Total</th>
                                        <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #000' }}>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.semesterData[selectedSemester].marks.map(m => (
                                        <tr key={m.id}>
                                            <td style={{ padding: '10px', border: '1px solid #000' }}>{m.subject_name}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #000' }}>{m.credits}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #000' }}>{m.internal}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #000' }}>{m.exam || '-'}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #000', fontWeight: 'bold' }}>{m.total || '-'}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #000' }}>{m.gradePoints || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><strong>Semester GPA:</strong> {data.semesterData[selectedSemester]?.isContinuing ? 'Continuing' : data.semesterData[selectedSemester]?.gpa.toFixed(2)}</span>
                                <span><strong>Cumulative GPA:</strong> {data.cgpa.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center', width: '220px' }}>
                            <div style={{ borderBottom: '1px solid #000', marginBottom: '8px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: 'bold' }}>CONTROLLER OF EXAMINATIONS</p>
                        </div>
                        <div style={{ textAlign: 'center', width: '220px' }}>
                            <div style={{ borderBottom: '1px solid #000', marginBottom: '8px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: 'bold' }}>PRINCIPAL / REGISTRAR</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '60px', borderTop: '1px dashed #ccc', paddingTop: '20px', fontSize: '11px', color: '#666' }}>
                        <p>This document is an official transcript of academic records in DARS.</p>
                        <p>Generated on: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
