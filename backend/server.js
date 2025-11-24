// finlit-academy-backend/server.js
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, `${Date.now()}-${file.originalname}`); },
});
const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) { return res.status(401).json({ message: 'Authorization token required' }); }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// --- API ROUTES START HERE ---

// 1. AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        let studentCode = role === 'student' ? uuidv4().split('-')[0].toUpperCase() : null;
        const newUser = await pool.query('INSERT INTO users (name, email, password_hash, role, student_code) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, student_code', [name, email, passwordHash, role, studentCode]);
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ message: 'Email or student code already exists.' });
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, student_code: user.student_code, profile_image: user.profile_image } });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/user/me', authMiddleware, async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id, name, email, role, student_code, profile_image FROM users WHERE id = $1', [req.user.userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(userResult.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/user/me', authMiddleware, upload.single('profile_image'), async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.userId;

    try {
        let query = 'UPDATE users SET name = $1, email = $2';
        let params = [name, email];
        let paramIndex = 3;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            query += `, password_hash = $${paramIndex}`;
            params.push(passwordHash);
            paramIndex++;
        }

        if (req.file) {
            query += `, profile_image = $${paramIndex}`;
            params.push(req.file.path);
            paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role, student_code, profile_image`;
        params.push(userId);

        const updatedUser = await pool.query(query, params);
        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. CLASS & MODULE ROUTES
app.post('/api/classes', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { name, description } = req.body;
    const classCode = uuidv4().slice(0, 8).toUpperCase();
    try {
        const newClass = await pool.query('INSERT INTO classes (name, description, class_code, teacher_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, classCode, req.user.userId]);
        res.status(201).json(newClass.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/teacher/classes', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    try { res.json((await pool.query('SELECT * FROM classes WHERE teacher_id = $1 ORDER BY created_at DESC', [req.user.userId])).rows); }
    catch (error) { res.status(500).json({ message: 'Server error' }); }
});
app.get('/api/classes/:id', authMiddleware, async (req, res) => {
    try {
        const classResult = await pool.query('SELECT c.*, u.name as teacher_name FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = $1', [req.params.id]);
        if (classResult.rows.length === 0) return res.status(404).json({ message: 'Class not found' });
        const modulesResult = await pool.query('SELECT * FROM modules WHERE class_id = $1 ORDER BY created_at ASC', [req.params.id]);
        const classData = classResult.rows[0];
        classData.modules = modulesResult.rows;
        res.json(classData);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});
// THIS IS THE RESTORED ROUTE
app.get('/api/classes/:classId/students', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { classId } = req.params;
    try {
        const studentsQuery = `
            SELECT u.id, u.name, u.email
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            WHERE e.class_id = $1;
        `;
        const studentsResult = await pool.query(studentsQuery, [classId]);
        res.json(studentsResult.rows);
    } catch (error) {
        console.error('Get Enrolled Students Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.post('/api/classes/:classId/modules', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { title, description } = req.body;
    try {
        const newModule = await pool.query('INSERT INTO modules (title, description, class_id) VALUES ($1, $2, $3) RETURNING *', [title, description, req.params.classId]);
        res.status(201).json(newModule.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});
app.get('/api/modules/:moduleId', authMiddleware, async (req, res) => {
    try {
        const moduleResult = await pool.query('SELECT * FROM modules WHERE id = $1', [req.params.moduleId]);
        if (moduleResult.rows.length === 0) return res.status(404).json({ message: 'Module not found' });
        const materialsResult = await pool.query('SELECT * FROM materials WHERE module_id = $1', [req.params.moduleId]);
        const quizzesResult = await pool.query('SELECT * FROM quizzes WHERE module_id = $1', [req.params.moduleId]);
        const assignmentsResult = await pool.query('SELECT * FROM assignments WHERE module_id = $1', [req.params.moduleId]);
        const moduleData = moduleResult.rows[0];
        moduleData.materials = materialsResult.rows;
        moduleData.quizzes = quizzesResult.rows;
        moduleData.assignments = assignmentsResult.rows;
        res.json(moduleData);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});
app.post('/api/modules/:moduleId/materials', authMiddleware, upload.single('pdf'), async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const newMaterial = await pool.query('INSERT INTO materials (title, file_path, module_id) VALUES ($1, $2, $3) RETURNING *', [req.body.title, req.file.path, req.params.moduleId]);
    res.status(201).json(newMaterial.rows[0]);
});
app.delete('/api/materials/:materialId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const materialResult = await pool.query('SELECT file_path FROM materials WHERE id = $1', [req.params.materialId]);
    if (materialResult.rows.length > 0 && materialResult.rows[0].file_path) await fs.unlink(path.join(__dirname, materialResult.rows[0].file_path));
    await pool.query('DELETE FROM materials WHERE id = $1', [req.params.materialId]);
    res.status(200).json({ message: 'Material deleted successfully.' });
});

// 3. QUIZ ROUTES
app.post('/api/modules/:moduleId/quizzes', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { title, questions } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const quizResult = await client.query('INSERT INTO quizzes (title, module_id) VALUES ($1, $2) RETURNING id', [title, req.params.moduleId]);
        const quizId = quizResult.rows[0].id;
        for (const q of questions) {
            const questionResult = await client.query('INSERT INTO questions (text, quiz_id) VALUES ($1, $2) RETURNING id', [q.text, quizId]);
            const questionId = questionResult.rows[0].id;
            for (const opt of q.options) {
                await client.query('INSERT INTO options (text, is_correct, question_id, remark) VALUES ($1, $2, $3, $4)', [opt.text, opt.is_correct, questionId, opt.remark]);
            }
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Quiz created successfully', quizId });
    } catch (error) { await client.query('ROLLBACK'); res.status(500).json({ message: 'Server error' }); }
    finally { client.release(); }
});
app.delete('/api/quizzes/:quizId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    await pool.query('DELETE FROM quizzes WHERE id = $1', [req.params.quizId]);
    res.status(200).json({ message: 'Quiz deleted successfully.' });
});
app.get('/api/quizzes/:quizId', authMiddleware, async (req, res) => {
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [req.params.quizId]);
    if (quizResult.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
    const questionsResult = await pool.query(`SELECT q.id, q.text, json_agg(json_build_object('id', o.id, 'text', o.text)) as options FROM questions q JOIN options o ON q.id = o.question_id WHERE q.quiz_id = $1 GROUP BY q.id`, [req.params.quizId]);
    const quiz = quizResult.rows[0];
    quiz.questions = questionsResult.rows;
    res.json(quiz);
});
app.post('/api/quizzes/:quizId/submit', authMiddleware, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    const { answers } = req.body;
    let score = 0;
    const questions = (await pool.query('SELECT id FROM questions WHERE quiz_id = $1', [req.params.quizId])).rows;
    for (const q of questions) {
        const correctOptions = new Set((await pool.query('SELECT id FROM options WHERE question_id = $1 AND is_correct = TRUE', [q.id])).rows.map(o => o.id));
        const submittedOptions = new Set(answers[q.id] || []);
        if (correctOptions.size === submittedOptions.size && [...correctOptions].every(id => submittedOptions.has(id))) score++;
    }
    await pool.query('INSERT INTO quiz_attempts (student_id, quiz_id, score, total_questions) VALUES ($1, $2, $3, $4)', [req.user.userId, req.params.quizId, score, questions.length]);
    const reviewData = await pool.query(`SELECT q.id as question_id, q.text as question_text, json_agg(json_build_object('text', o.text, 'is_correct', o.is_correct, 'remark', o.remark)) as options FROM questions q JOIN options o ON q.id = o.question_id WHERE q.quiz_id = $1 GROUP BY q.id`, [req.params.quizId]);
    res.json({ score, totalQuestions: questions.length, review: reviewData.rows });
});

// 4. ASSIGNMENT ROUTES
app.post('/api/modules/:moduleId/assignments', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { title, question_text, total_marks } = req.body;
    const newAssignment = await pool.query('INSERT INTO assignments (title, question_text, total_marks, module_id) VALUES ($1, $2, $3, $4) RETURNING *', [title, question_text, total_marks, req.params.moduleId]);
    res.status(201).json(newAssignment.rows[0]);
});
app.post('/api/assignments/:assignmentId/submit', authMiddleware, upload.array('files'), async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const submissionRes = await client.query('INSERT INTO assignment_submissions (assignment_id, student_id) VALUES ($1, $2) ON CONFLICT (assignment_id, student_id) DO UPDATE SET submitted_at = NOW() RETURNING id', [req.params.assignmentId, req.user.userId]);
        const submissionId = submissionRes.rows[0].id;
        for (const file of req.files) {
            await client.query('INSERT INTO submission_files (submission_id, file_path) VALUES ($1, $2)', [submissionId, file.path]);
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Assignment submitted successfully' });
    } catch (error) { await client.query('ROLLBACK'); res.status(500).json({ message: 'Server error' }); }
    finally { client.release(); }
});
app.get('/api/assignments/:assignmentId/submissions', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const submissions = await pool.query('SELECT s.*, u.name as student_name FROM assignment_submissions s JOIN users u ON s.student_id = u.id WHERE s.assignment_id = $1', [req.params.assignmentId]);
    res.json(submissions.rows);
});
app.get('/api/submissions/:submissionId', authMiddleware, async (req, res) => {
    const submission = await pool.query('SELECT s.*, u.name as student_name, a.title as assignment_title, a.question_text, a.total_marks FROM assignment_submissions s JOIN users u ON s.student_id = u.id JOIN assignments a ON s.assignment_id = a.id WHERE s.id = $1', [req.params.submissionId]);
    const files = await pool.query('SELECT * FROM submission_files WHERE submission_id = $1', [req.params.submissionId]);
    res.json({ submission: submission.rows[0], files: files.rows });
});
app.post('/api/submission-files/:fileId/evaluate', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { marks_awarded, remarks, submissionId } = req.body;
    await pool.query('UPDATE submission_files SET marks_awarded = $1, remarks = $2 WHERE id = $3', [marks_awarded, remarks, req.params.fileId]);
    const unevaluated = await pool.query('SELECT id FROM submission_files WHERE submission_id = $1 AND marks_awarded IS NULL', [submissionId]);
    if (unevaluated.rows.length === 0) {
        await pool.query('UPDATE assignment_submissions SET is_evaluated = TRUE WHERE id = $1', [submissionId]);
    }
    res.json({ message: 'Evaluation updated.' });
});

// 5. STUDENT & PARENT ROUTES
app.post('/api/enroll', authMiddleware, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    const classResult = await pool.query('SELECT id FROM classes WHERE class_code = $1', [req.body.classCode]);
    if (classResult.rows.length === 0) return res.status(404).json({ message: 'Invalid class code' });
    await pool.query('INSERT INTO enrollments (student_id, class_id) VALUES ($1, $2)', [req.user.userId, classResult.rows[0].id]);
    res.status(201).json({ message: 'Enrolled successfully' });
});

app.get('/api/student/classes', authMiddleware, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    const classes = await pool.query('SELECT c.*, u.name as teacher_name FROM classes c JOIN enrollments e ON c.id = e.class_id JOIN users u ON c.teacher_id = u.id WHERE e.student_id = $1', [req.user.userId]);
    res.json(classes.rows);
});

app.post('/api/parent/connect', authMiddleware, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Access denied' });
    const student = await pool.query('SELECT id FROM users WHERE student_code = $1 AND role = \'student\'', [req.body.studentCode]);
    if (student.rows.length === 0) return res.status(404).json({ message: 'Invalid student ID' });
    await pool.query('INSERT INTO parent_child (parent_id, child_id) VALUES ($1, $2)', [req.user.userId, student.rows[0].id]);
    res.status(201).json({ message: 'Successfully connected to child.' });
});

app.get('/api/parent/children', authMiddleware, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Access denied' });
    const children = await pool.query('SELECT u.id, u.name, u.email, u.student_code FROM users u JOIN parent_child pc ON u.id = pc.child_id WHERE pc.parent_id = $1', [req.user.userId]);
    res.json(children.rows);
});

app.get('/api/parent/child/:childId/classes', authMiddleware, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Access denied' });
    const classesQuery = `
        SELECT c.id, c.name, c.teacher_id, u.name as teacher_name
        FROM classes c
        JOIN enrollments e ON c.id = e.class_id
        JOIN users u ON c.teacher_id = u.id
        WHERE e.student_id = $1;
    `;
    const classesResult = await pool.query(classesQuery, [req.params.childId]);
    res.json(classesResult.rows);
});

// 6. REPORTING & PERFORMANCE ROUTES
app.get('/api/progress-report-data/:studentId', authMiddleware, async (req, res) => {
    const studentRes = await pool.query('SELECT id, name, profile_image FROM users WHERE id = $1', [req.params.studentId]);
    if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student not found.' });
    const parentRes = await pool.query('SELECT u.name FROM users u JOIN parent_child pc ON u.id = pc.parent_id WHERE pc.child_id = $1', [req.params.studentId]);
    const classesRes = await pool.query('SELECT c.id, c.name, t.name as teacher_name FROM classes c JOIN enrollments e ON c.id = e.class_id JOIN users t ON c.teacher_id = t.id WHERE e.student_id = $1', [req.params.studentId]);
    const quiz_attempts = await pool.query('SELECT qa.*, q.title as quiz_title, c.id as class_id, c.name as class_name FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id JOIN modules m ON q.module_id = m.id JOIN classes c ON m.class_id = c.id WHERE qa.student_id = $1', [req.params.studentId]);
    const assignment_scores = await pool.query('SELECT SUM(sf.marks_awarded) as score, a.total_marks, a.title as assignment_title, c.id as class_id, c.name as class_name FROM submission_files sf JOIN assignment_submissions s ON sf.submission_id = s.id JOIN assignments a ON s.assignment_id = a.id JOIN modules m ON a.module_id = m.id JOIN classes c ON m.class_id = c.id WHERE s.student_id = $1 AND sf.marks_awarded IS NOT NULL GROUP BY a.id, c.id', [req.params.studentId]);
    res.json({
        student: studentRes.rows[0],
        parents: parentRes.rows,
        classes: classesRes.rows,
        quiz_attempts: quiz_attempts.rows,
        assignment_scores: assignment_scores.rows
    });
});

app.get('/api/classes/:classId/performance', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const studentsRes = await pool.query('SELECT u.id, u.name FROM users u JOIN enrollments e ON u.id = e.student_id WHERE e.class_id = $1', [req.params.classId]);
    const quizData = await pool.query('SELECT qa.student_id, qa.score, qa.total_questions FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id JOIN modules m ON q.module_id = m.id WHERE m.class_id = $1', [req.params.classId]);
    const assignmentData = await pool.query('SELECT s.student_id, sf.marks_awarded, a.total_marks FROM submission_files sf JOIN assignment_submissions s ON sf.submission_id = s.id JOIN assignments a ON s.assignment_id = a.id JOIN modules m ON a.module_id = m.id WHERE m.class_id = $1 AND sf.marks_awarded IS NOT NULL', [req.params.classId]);
    res.json({ students: studentsRes.rows, quizData: quizData.rows, assignmentData: assignmentData.rows });
});

// 7. MEETING ROUTES
app.post('/api/meetings/schedule-by-teacher', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { studentId, classId, startTime, endTime } = req.body;
    try {
        const parentResult = await pool.query('SELECT parent_id FROM parent_child WHERE child_id = $1', [studentId]);
        if (parentResult.rows.length === 0) return res.status(404).json({ message: 'Parent not connected to this student.' });
        const parentId = parentResult.rows[0].parent_id;
        const newMeeting = await pool.query('INSERT INTO meetings (teacher_id, parent_id, student_id, class_id, start_time, end_time, scheduled_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [req.user.userId, parentId, studentId, classId, startTime, endTime, req.user.userId]);
        res.status(201).json(newMeeting.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/meetings/schedule-by-parent', authMiddleware, async (req, res) => {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Access denied' });
    const { teacherId, studentId, classId, startTime } = req.body;
    const endTime = new Date(startTime); endTime.setHours(endTime.getHours() + 1);
    try {
        const newMeeting = await pool.query('INSERT INTO meetings (teacher_id, parent_id, student_id, class_id, start_time, end_time, scheduled_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [teacherId, req.user.userId, studentId, classId, startTime, endTime.toISOString(), req.user.userId]);
        res.status(201).json(newMeeting.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/meetings/:meetingId/status', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    try {
        const updatedMeeting = await pool.query('UPDATE meetings SET status = $1 WHERE id = $2 AND teacher_id = $3 RETURNING *', [status, req.params.meetingId, req.user.userId]);
        if (updatedMeeting.rows.length === 0) return res.status(404).json({ message: 'Meeting not found or unauthorized' });
        res.json(updatedMeeting.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/meetings', authMiddleware, async (req, res) => {
    const { userId, role } = req.user;
    try {
        let query;
        if (role === 'teacher') { query = `SELECT m.*, p.name as parent_name, s.name as student_name, c.name as class_name FROM meetings m JOIN users p ON m.parent_id = p.id JOIN users s ON m.student_id = s.id JOIN classes c ON m.class_id = c.id WHERE m.teacher_id = $1 ORDER BY m.start_time ASC;`; }
        else if (role === 'parent') { query = `SELECT m.*, t.name as teacher_name, s.name as student_name, c.name as class_name FROM meetings m JOIN users t ON m.teacher_id = t.id JOIN users s ON m.student_id = s.id JOIN classes c ON m.class_id = c.id WHERE m.parent_id = $1 ORDER BY m.start_time ASC;`; }
        else { return res.status(403).json({ message: 'Access denied' }); }
        const meetingsResult = await pool.query(query, [userId]);
        res.json(meetingsResult.rows);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/teacher/:teacherId/availability', authMiddleware, async (req, res) => {
    const { teacherId } = req.params; const { date } = req.query;
    try {
        const startOfDay = new Date(`${date}T00:00:00.000Z`); const endOfDay = new Date(`${date}T23:59:59.999Z`);
        const meetingsResult = await pool.query('SELECT start_time FROM meetings WHERE teacher_id = $1 AND start_time >= $2 AND start_time <= $3', [teacherId, startOfDay, endOfDay]);
        const bookedHours = meetingsResult.rows.map(m => new Date(m.start_time).getUTCHours());
        const allSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];
        const availableSlots = allSlots.filter(hour => !bookedHours.includes(hour));
        res.json(availableSlots);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));