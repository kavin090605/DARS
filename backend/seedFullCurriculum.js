const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

const CURRICULUM = {
    'Computer Science': {
        1: ['Mathematics I', 'Engineering Physics', 'C Programming', 'Digital Logic', 'Professional English'],
        2: ['Data Structures', 'Discrete Mathematics', 'DBMS', 'Object Oriented Programming', 'Operating Systems'],
        3: ['Design and Analysis of Algorithms', 'Computer Networks', 'Software Engineering', 'Theory of Computation', 'Artificial Intelligence'],
        4: ['Web Technologies', 'Cloud Computing', 'Machine Learning', 'Cyber Security', 'Mobile Application Development'],
        5: ['Computer Graphics', 'Distributed Systems', 'Compiler Design', 'Parallel Computing', 'Data Mining'],
        6: ['Information Retrieval', 'Cryptography', 'Big Data Analytics', 'Internet of Things', 'Soft Computing'],
        7: ['Deep Learning', 'Quantum Computing', 'Block Chain', 'Virtual Reality', 'Social Network Analysis'],
        8: ['Project Work', 'Technical Seminar']
    },
    'Information Technology': {
        1: ['Mathematics I', 'Engineering Chemistry', 'Python Programming', 'IT Essentials', 'Professional English'],
        2: ['Data Structures and Algorithms', 'Computer Organization', 'Web Design', 'Java Programming', 'Database Systems'],
        3: ['Operating Systems', 'Software Engineering', 'Computer Networks', 'Human Computer Interaction', 'Cloud Infrastructure'],
        4: ['Cybersecurity', 'Data Science', 'Internet of Things', 'Blockchain Technology', 'Enterprise Resource Planning'],
        5: ['Machine Learning', 'Big Data', 'Network Security', 'Mobile Computing', 'Cloud Computing'],
        6: ['Artificial Intelligence', 'Software Testing', 'E-Commerce', 'Professional Ethics', 'Storage Systems'],
        7: ['IT Project Management', 'Digital Marketing', 'Data Warehousing', 'Multimedia Systems', 'Semantic Web'],
        8: ['Project Work', 'Internship']
    },
    'Electronics and Communication': {
        1: ['Mathematics I', 'Engineering Physics', 'Basic Electronics', 'Circuit Theory', 'Engineering Graphics'],
        2: ['Signals and Systems', 'Electronic Circuits', 'Digital Electronics', 'Electromagnetic Fields', 'Measurements and Instrumentation'],
        3: ['Digital Communication', 'Control Systems', 'Microprocessors and Microcontrollers', 'VLSI Design', 'Antennas and Wave Propagation'],
        4: ['Wireless Communication', 'Optical Communication', 'DSP', 'RF System Design', 'Embedded Systems'],
        5: ['Digital Logic Design', 'Analog Circuits', 'Communication Networks', 'Microcontrollers', 'Information Theory'],
        6: ['VLSI Systems', 'Antenna Theory', 'Microwave Engineering', 'Satellite Communication', 'Radar Systems'],
        7: ['Mobile Communication', 'Consumer Electronics', 'Fiber Optics', 'Bio-Medical Electronics', 'Nano Electronics'],
        8: ['Project Work', 'Industrial Training']
    },
    'Mechanical Engineering': {
        1: ['Mathematics I', 'Engineering Chemistry', 'Engineering Mechanics', 'Graphics and Design', 'Materials Science'],
        2: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Manufacturing Technology', 'Kinematics of Machinery'],
        3: ['Design of Machine Elements', 'Heat and Mass Transfer', 'Dynamics of Machinery', 'Industrial Engineering', 'Automobile Engineering'],
        4: ['Mechatronics', 'CAD/CAM', 'Power Plant Engineering', 'Robotics and Automation', 'Operations Research'],
        5: ['Internal Combustion Engines', 'Mechanical Vibrations', 'Refrigeration', 'Gas Dynamics', 'Metal Cutting'],
        6: ['Design of Transmission Systems', 'Finite Element Analysis', 'Optimization Techniques', 'Turbomachinery', 'Production Planning'],
        7: ['Total Quality Management', 'Surface Engineering', 'Power Plant Systems', 'Cryogenics', 'Unconventional Machining'],
        8: ['Project Work', 'Technical Visit']
    },
    'Civil Engineering': {
        1: ['Mathematics I', 'Engineering Geology', 'Surveying I', 'Mechanics of Solids', 'Environmental Science'],
        2: ['Structural Analysis I', 'Concrete Technology', 'Fluid Mechanics', 'Building Materials', 'Construction Techniques'],
        3: ['Surveying II', 'Soil Mechanics', 'Design of Steel Structures', 'Hydrology', 'Transportation Engineering'],
        4: ['Structural Analysis II', 'Foundation Engineering', 'Prestressed Concrete', 'Waste Management', 'Remote Sensing and GIS'],
        5: ['Irrigation Engineering', 'Design of RC Elements', 'Structural Dynamics', 'Quantity Surveying', 'Bridge Engineering'],
        6: ['Earthquake Engineering', 'Steel Structures Design', 'Pavement Engineering', 'Hydraulic Structures', 'Smart Buildings'],
        7: ['Urban Planning', 'Contract Management', 'Geotechnical Engineering', 'Advanced Construction', 'Project Management'],
        8: ['Project Work', 'Field Survey']
    },
    'Electrical Engineering': {
        1: ['Mathematics I', 'Engineering Physics', 'Basic Electrical Engineering', 'Electric Circuits', 'Engineering Graphics'],
        2: ['Electrical Machines I', 'Measurements and Instrumentation', 'Network Analysis', 'Analog Electronics', 'Digital System Design'],
        3: ['Electrical Machines II', 'Control Systems', 'Power Systems I', 'Power Electronics', 'Microprocessors'],
        4: ['Power Systems II', 'High Voltage Engineering', 'Smart Grid Technology', 'Renewable Energy Systems', 'Drives and Control'],
        5: ['Linear Integrated Circuits', 'Microprocessors', 'Transmission and Distribution', 'Power Electronics', 'Electrical Machine Design'],
        6: ['Power System Analysis', 'Digital Signal Processing', 'Electrical Energy Conservation', 'Protection and Switchgear', 'Industrial Instrumentation'],
        7: ['Power System Operation', 'Utilization of Electrical Energy', 'Power Quality', 'VLSI Design', 'Control System Lab'],
        8: ['Project Work', 'Comprehensive Viva']
    }
};

async function seedCurriculum() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('Connected to database.');

        // Disable foreign key checks to truncate safely
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE marks');
        await connection.execute('TRUNCATE TABLE attendance');
        await connection.execute('TRUNCATE TABLE subjects');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Cleared existing subjects, marks, and attendance.');

        // 1. Insert All Subjects for All Semesters
        const DEPT_MAP = {
            'Computer Science': 'CS',
            'Information Technology': 'IT',
            'Electronics and Communication': 'EC',
            'Mechanical Engineering': 'ME',
            'Civil Engineering': 'CE',
            'Electrical Engineering': 'EE'
        };

        const subjectMap = {}; // Map of "Dept-Sem-Name" to Subject ID
        const DEPT_LIST = Object.keys(DEPT_MAP);

        for (const dept of DEPT_LIST) {
            const deptIndex = DEPT_LIST.indexOf(dept);
            const prefix = DEPT_MAP[dept];
            for (const semStr in CURRICULUM[dept]) {
                const sem = parseInt(semStr);
                const year = Math.ceil(sem / 2);
                const subjects = CURRICULUM[dept][sem];
                for (let i = 0; i < subjects.length; i++) {
                    const subName = subjects[i];
                    // Specialized ID with Prefix: e.g., Sem 1 CS Sub 1 -> CS1001
                    const specializedId = `${prefix}${(sem * 1000) + (deptIndex * 100) + (i + 1)}`;

                    await connection.execute(
                        'INSERT INTO subjects (id, name, dept, year, semester) VALUES (?, ?, ?, ?, ?)',
                        [specializedId, subName, dept, year, sem]
                    );
                    subjectMap[`${dept}-${sem}-${subName}`] = specializedId;
                }
            }
        }
        console.log('✅ All subjects inserted for all 8 semesters.');

        // 2. Link Students to Subjects (All past semesters)
        const [students] = await connection.execute('SELECT id, dept, year FROM students');
        console.log(`Mapping ${students.length} students to their historical subjects...`);

        for (const student of students) {
            // For a student in Year N, we seed marks for all semesters from 1 to ((N-1)*2 + 1)
            // Assuming we are at the start of an odd semester (Sem 1, 3, 5, 7)
            const currentSemester = (student.year - 1) * 2 + 1;

            for (let sem = 1; sem <= currentSemester; sem++) {
                const deptSubs = CURRICULUM[student.dept] && CURRICULUM[student.dept][sem];
                if (deptSubs) {
                    for (const subName of deptSubs) {
                        const subjectId = subjectMap[`${student.dept}-${sem}-${subName}`];

                        // Add Marks
                        const internal = 25 + Math.floor(Math.random() * 15); // 25-40
                        const exam = 35 + Math.floor(Math.random() * 25);     // 35-60
                        await connection.execute(
                            'INSERT INTO marks (student_id, subject_id, internal, exam) VALUES (?, ?, ?, ?)',
                            [student.id, subjectId, internal, exam]
                        );

                        // Add Attendance
                        const totalClasses = 40 + Math.floor(Math.random() * 10);
                        const attendedClasses = Math.floor(totalClasses * (0.75 + Math.random() * 0.23));
                        await connection.execute(
                            'INSERT INTO attendance (student_id, subject_id, attended_classes, total_classes) VALUES (?, ?, ?, ?)',
                            [student.id, subjectId, attendedClasses, totalClasses]
                        );
                    }
                }
            }
        }

        console.log('✅ All students mapped to their historical subjects across multiple semesters.');
        console.log('✅ Full curriculum seeding completed successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seedCurriculum();
