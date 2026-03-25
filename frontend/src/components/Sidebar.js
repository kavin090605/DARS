import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt,
    faUserGraduate,
    faChalkboardTeacher,
    faBook,
    faSignOutAlt,
    faClipboardList,
    faChartLine,
    faBookOpen,
    faCommentDots
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: faTachometerAlt },
        { name: 'Faculty', path: '/admin/faculty', icon: faChalkboardTeacher },
        { name: 'Students', path: '/admin/students', icon: faUserGraduate },
        { name: 'Subjects', path: '/admin/subjects', icon: faBook },
    ];

    const facultyLinks = [
        { name: 'Dashboard', path: '/faculty', icon: faTachometerAlt },
        { name: 'Marks Entry', path: '/faculty/marks', icon: faClipboardList },
        { name: 'Attendance', path: '/faculty/attendance', icon: faChartLine },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student', icon: faTachometerAlt },
        { name: 'Report Card', path: '/student/report', icon: faBook },
        { name: 'Syllabus', path: '/student/syllabus', icon: faBookOpen },
        { name: 'Feedback', path: '/student/feedback', icon: faCommentDots },
    ];

    const links = role === 'Admin' ? adminLinks : role === 'Faculty' ? facultyLinks : studentLinks;

    return (
        <div className="sidebar">
            <div className="sidebar-brand">DARS</div>
            <nav style={{ flex: 1 }}>
                {links.map((link) => (
                    <NavLink key={link.name} to={link.path} className="nav-link" end>
                        <FontAwesomeIcon icon={link.icon} width="20" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <FontAwesomeIcon icon={faSignOutAlt} width="20" />
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
