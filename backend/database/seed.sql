USE dars_db;

-- Disable safe update mode to allow mass deletes
SET SQL_SAFE_UPDATES = 0;

-- Clear existing data (in reverse order of dependencies)
DELETE FROM attendance;
DELETE FROM marks;
DELETE FROM subjects;
DELETE FROM faculty;
DELETE FROM students;
DELETE FROM users;

-- 1. Insert Users
-- All passwords are 'password123' (hashed using bcrypt)
-- Hashed: $2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK

-- Admin
INSERT INTO users (id, name, email, password, role) VALUES 
(1, 'System Admin', 'admin@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Admin');

-- Faculty
INSERT INTO users (id, name, email, password, role) VALUES 
(2, 'Dr. Sarah Smith', 'sarah.smith@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty'),
(3, 'Prof. Robert Jones', 'robert.jones@dars.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Faculty');

-- Students
INSERT INTO users (id, name, email, password, role) VALUES 
(4, 'Alice Cooper', 'alice@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(5, 'Bob Marley', 'bob@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(6, 'Charlie Brown', 'charlie@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(7, 'Diana Prince', 'diana@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student'),
(8, 'Ethan Hunt', 'ethan@student.com', '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK', 'Student');

-- 2. Insert Faculty Details
INSERT INTO faculty (dept, user_id) VALUES 
('Computer Science', 2),
('Information Technology', 3);

-- 3. Insert Student Details
INSERT INTO students (roll_no, dept, year, user_id) VALUES 
('CS101', 'Computer Science', 1, 4),
('CS102', 'Computer Science', 1, 5),
('IT101', 'Information Technology', 2, 6),
('IT102', 'Information Technology', 2, 7),
('CS201', 'Computer Science', 3, 8);

-- 4. Insert Subjects
INSERT INTO subjects (id, name, dept, year) VALUES 
(1, 'Data Structures', 'Computer Science', 1),
(2, 'Algorithms', 'Computer Science', 1),
(3, 'Web Development', 'Information Technology', 2),
(4, 'Database Systems', 'Computer Science', 3);

-- 5. Insert Sample Marks
INSERT INTO marks (student_id, subject_id, internal, exam) VALUES 
(1, 1, 25, 65), -- Alice, DS
(1, 2, 22, 58), -- Alice, Algorithms
(2, 1, 20, 70), -- Bob, DS
(3, 3, 28, 62), -- Charlie, Web Dev
(4, 3, 15, 45), -- Diana, Web Dev
(5, 4, 24, 68); -- Ethan, Databases

-- 6. Insert Sample Attendance
INSERT INTO attendance (student_id, subject_id, attended_classes, total_classes) VALUES 
(1, 1, 35, 40),
(1, 2, 38, 40),
(2, 1, 30, 40),
(3, 3, 42, 45),
(4, 3, 20, 45),
(5, 4, 32, 35);

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
