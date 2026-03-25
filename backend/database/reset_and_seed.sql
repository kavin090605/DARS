-- DARS Database Reset and Seed Script
-- THIS WILL DELETE ALL EXISTING DATA

DROP DATABASE IF EXISTS dars_db;
CREATE DATABASE dars_db;
USE dars_db;

-- 1. Create Tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Faculty', 'Student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    dept VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    dob DATE,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dept VARCHAR(100) NOT NULL,
    age INT,
    dob DATE,
    subject VARCHAR(255),
    doj DATE,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dept VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3
);

CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id VARCHAR(50),
    internal INT DEFAULT 0,
    exam INT DEFAULT 0,
    total INT AS (internal + exam) STORED,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id VARCHAR(50),
    attended_classes INT DEFAULT 0,
    total_classes INT DEFAULT 0,
    percentage DECIMAL(5,2) AS (CASE WHEN total_classes > 0 THEN (attended_classes / total_classes) * 100 ELSE 0 END) STORED,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 2. Seed Data
-- All passwords are 'password123' (hashed using bcrypt)
-- Hashed: $2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK

-- Admin
INSERT INTO users (id, name, email, password, role) VALUES 
(1, 'System Admin', 'admin@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Admin');

-- Faculty
INSERT INTO users (id, name, email, password, role) VALUES 
(2, 'Dr. Sarah Smith', 'sarah.smith@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(3, 'Prof. Robert Jones', 'robert.jones@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(4, 'Dr. Emily Watson', 'emily.watson@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(5, 'Prof. Michael Chen', 'michael.chen@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(6, 'Dr. Lisa Anderson', 'lisa.anderson@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(7, 'Prof. James Wilson', 'james.wilson@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(8, 'Dr. Patricia Brown', 'patricia.brown@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(9, 'Prof. David Martinez', 'david.martinez@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty');

-- Students
INSERT INTO users (id, name, email, password, role) VALUES 
(10, 'Alice Cooper', 'alice@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(11, 'Bob Marley', 'bob@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(12, 'Charlie Brown', 'charlie@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(13, 'Diana Prince', 'diana@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(14, 'Ethan Hunt', 'ethan@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(15, 'Fiona Green', 'fiona@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(16, 'George Harris', 'george@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(17, 'Hannah Lopez', 'hannah@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(18, 'Isaac Taylor', 'isaac@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(19, 'Jessica Adams', 'jessica@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(20, 'Kevin Clark', 'kevin@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(21, 'Laura White', 'laura@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(22, 'Mark Johnson', 'mark@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(23, 'Nina Rodriguez', 'nina@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(24, 'Oscar Walker', 'oscar@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(25, 'Pamela Scott', 'pamela@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student');

INSERT INTO faculty (dept, age, dob, subject, doj, user_id) VALUES 
('Computer Science', 45, '1979-05-15', 'Data Structures', '2010-08-01', 2),
('Information Technology', 42, '1982-11-20', 'Web Development', '2012-09-15', 3),
('Computer Science', 38, '1986-03-10', 'Algorithms', '2015-01-10', 4),
('Electronics and Communication', 40, '1984-07-25', 'Digital Logic', '2011-06-20', 5),
('Electrical Engineering', 50, '1974-01-05', 'Circuit Theory', '2005-12-01', 6),
('Mechanical Engineering', 48, '1976-09-30', 'Thermodynamics', '2008-07-22', 7),
('Civil Engineering', 44, '1980-12-12', 'Structural Analysis', '2013-02-18', 8),
('Information Technology', 36, '1988-06-18', 'Cloud Computing', '2018-10-05', 9);

INSERT INTO students (roll_no, dept, year, dob, user_id) VALUES 
('CS2024001', 'Computer Science', 1, '2006-05-15', 10),
('IT2024001', 'Information Technology', 1, '2006-08-20', 11),
('EC2023001', 'Electronics and Communication', 2, '2005-03-10', 12),
('ME2022001', 'Mechanical Engineering', 3, '2004-11-25', 13),
('CE2021001', 'Civil Engineering', 4, '2003-07-05', 14),
('CS2024002', 'Computer Science', 1, '2006-01-30', 15),
('IT2024002', 'Information Technology', 1, '2006-12-12', 16),
('CS2023001', 'Computer Science', 2, '2005-06-18', 17),
('ME2023001', 'Mechanical Engineering', 2, '2005-09-05', 18),
('EE2022001', 'Electrical Engineering', 3, '2004-02-14', 19),
('CS2024003', 'Computer Science', 1, '2006-04-22', 20),
('IT2024003', 'Information Technology', 1, '2006-10-08', 21),
('EC2024001', 'Electronics and Communication', 1, '2006-09-15', 22),
('CE2023001', 'Civil Engineering', 2, '2005-12-30', 23),
('CS2024004', 'Computer Science', 1, '2006-02-14', 24),
('IT2024004', 'Information Technology', 1, '2006-03-25', 25);

INSERT INTO subjects (id, name, dept, year, semester, credits) VALUES 
(1, 'Data Structures', 'Computer Science', 1, 1, 4),
(2, 'Algorithms', 'Computer Science', 1, 1, 4),
(3, 'Object Oriented Programming', 'Computer Science', 1, 1, 3),
(4, 'Database Management Systems', 'Computer Science', 2, 3, 4),
(5, 'Web Development', 'Information Technology', 1, 1, 3),
(6, 'Cloud Computing', 'Information Technology', 2, 3, 3),
(7, 'Digital Logic Design', 'Electronics and Communication', 1, 1, 3),
(8, 'Microprocessors', 'Electronics and Communication', 2, 3, 4),
(9, 'Circuit Theory', 'Electrical Engineering', 1, 1, 4),
(10, 'Power Systems', 'Electrical Engineering', 2, 3, 4),
(11, 'Mechanics of Materials', 'Mechanical Engineering', 1, 1, 3),
(12, 'Thermodynamics', 'Mechanical Engineering', 2, 3, 3),
(13, 'Structural Analysis', 'Civil Engineering', 1, 1, 4),
(14, 'Environmental Engineering', 'Civil Engineering', 2, 3, 3);

INSERT INTO marks (student_id, subject_id, internal, exam) VALUES 
(1, 1, 25, 65), -- Alice, DS
(1, 2, 22, 58), -- Alice, Algorithms
(1, 3, 28, 72), -- Alice, OOP
(2, 1, 20, 70), -- Bob, DS
(2, 2, 24, 68), -- Bob, Algorithms
(2, 3, 26, 75), -- Bob, OOP
(3, 1, 23, 62), -- Charlie, DS
(3, 2, 21, 64), -- Charlie, Algorithms
(3, 3, 25, 69), -- Charlie, OOP
(4, 4, 28, 80), -- Diana, DBMS
(4, 1, 26, 74), -- Diana, DS
(5, 4, 24, 76), -- Ethan, DBMS
(5, 2, 22, 70), -- Ethan, Algorithms
(6, 5, 27, 78), -- Fiona, Web Dev
(6, 1, 25, 72), -- Fiona, DS
(7, 5, 23, 68), -- George, Web Dev
(7, 3, 24, 71), -- George, OOP
(8, 6, 29, 82), -- Hannah, Cloud Computing
(8, 5, 26, 75), -- Hannah, Web Dev
(9, 7, 22, 65), -- Isaac, Digital Logic
(9, 3, 24, 70), -- Isaac, OOP
(10, 7, 25, 73), -- Jessica, Digital Logic
(10, 1, 23, 68), -- Jessica, DS
(11, 9, 26, 74), -- Kevin, Circuit Theory
(11, 5, 24, 71), -- Kevin, Web Dev
(12, 10, 28, 79), -- Laura, Power Systems
(12, 6, 25, 76), -- Laura, Cloud Computing
(13, 11, 23, 69), -- Mark, Mechanics
(13, 3, 22, 67), -- Mark, OOP
(14, 12, 25, 75), -- Nina, Thermodynamics
(14, 5, 26, 77), -- Nina, Web Dev
(15, 13, 24, 71), -- Oscar, Structural
(15, 1, 23, 68), -- Oscar, DS
(16, 14, 26, 78); -- Pamela, Environmental

INSERT INTO attendance (student_id, subject_id, attended_classes, total_classes) VALUES 
(1, 1, 35, 40),
(1, 2, 38, 40),
(1, 3, 36, 40),
(2, 1, 33, 40),
(2, 2, 34, 40),
(2, 3, 37, 40),
(3, 1, 32, 40),
(3, 2, 35, 40),
(3, 3, 33, 40),
(4, 4, 40, 45),
(4, 1, 38, 40),
(5, 4, 42, 45),
(5, 2, 39, 40),
(6, 5, 38, 40),
(6, 1, 36, 40),
(7, 5, 35, 40),
(7, 3, 34, 40),
(8, 6, 44, 45),
(8, 5, 40, 40),
(9, 7, 32, 40),
(9, 3, 35, 40),
(10, 7, 36, 40),
(10, 1, 34, 40),
(11, 9, 38, 42),
(11, 5, 36, 40),
(12, 10, 42, 45),
(12, 6, 39, 45),
(13, 11, 33, 40),
(13, 3, 32, 40),
(14, 12, 40, 45),
(14, 5, 38, 40),
(15, 13, 37, 42),
(15, 1, 35, 40),
(16, 14, 41, 45);
