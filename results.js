const express = require('express');
const Result = require('../models/Result');
const { auth, teacherOnly } = require('../middleware/auth');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all results (students see only theirs, teachers see all)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        }
        
        const results = await Result.find(query).sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search and filter results
router.get('/search', auth, async (req, res) => {
    try {
        const { studentName, subject, status, grade } = req.query;
        
        let query = {};
        
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        }
        
        if (studentName) query.studentName = { $regex: studentName, $options: 'i' };
        if (subject) query.subject = subject;
        if (status) query.status = status;
        if (grade) query.grade = grade;
        
        const results = await Result.find(query).sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add result (teachers only)
router.post('/', auth, teacherOnly, async (req, res) => {
    try {
        const { studentName, studentId, score, subject } = req.body;
        
        if (!studentName || score === undefined) {
            return res.status(400).json({ message: 'Student name and score are required' });
        }
        
        const result = new Result({
            studentName,
            studentId,
            score,
            subject: subject || 'General',
            createdBy: req.user.id
        });
        
        await result.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update result (teachers only)
router.put('/:id', auth, teacherOnly, async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // Update allowed fields
        const { studentName, studentId, score, subject } = req.body;
        if (studentName !== undefined) result.studentName = studentName;
        if (studentId !== undefined) result.studentId = studentId;
        if (score !== undefined) result.score = score;
        if (subject !== undefined) result.subject = subject;

        result.updatedAt = Date.now();

        await result.save(); // triggers pre('save') to recalc grade/status

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete result (teachers only)
router.delete('/:id', auth, teacherOnly, async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        
        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export to CSV
router.get('/export/csv', auth, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        }
        
        const results = await Result.find(query);
        
        const csvFilePath = path.join(__dirname, '../exports/results.csv');
        
        const csvWriter = createObjectCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'studentName', title: 'Student Name' },
                { id: 'score', title: 'Score' },
                { id: 'grade', title: 'Grade' },
                { id: 'status', title: 'Status' },
                { id: 'subject', title: 'Subject' },
                { id: 'createdAt', title: 'Date' }
            ]
        });
        
        await csvWriter.writeRecords(results);
        res.download(csvFilePath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export to PDF
router.get('/export/pdf', auth, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        }
        
        const results = await Result.find(query);
        
        const doc = new PDFDocument();
        const pdfPath = path.join(__dirname, '../exports/results.pdf');
        
        doc.pipe(fs.createWriteStream(pdfPath));
        
        doc.fontSize(20).text('Student Results Report', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        
        const table = {
            headers: ['Student Name', 'Score', 'Grade', 'Status', 'Subject'],
            rows: results.map(r => [r.studentName, r.score, r.grade, r.status, r.subject])
        };
        
        let y = doc.y;
        
        // Headers
        doc.fontSize(11).font('Helvetica-Bold');
        table.headers.forEach((header, i) => {
            doc.text(header, 50 + (i * 90), y, { width: 80 });
        });
        
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        y += 25;
        
        // Rows
        doc.font('Helvetica');
        table.rows.forEach(row => {
            if (y > 750) {
                doc.addPage();
                y = 50;
            }
            
            row.forEach((cell, i) => {
                doc.fontSize(10).text(String(cell), 50 + (i * 90), y, { width: 80 });
            });
            y += 20;
        });
        
        doc.end();
        
        doc.on('finish', () => {
            res.download(pdfPath);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get statistics
router.get('/stats/summary', auth, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        }
        
        const results = await Result.find(query);
        
        if (results.length === 0) {
            return res.json({
                totalStudents: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                passCount: 0,
                failCount: 0
            });
        }
        
        const scores = results.map(r => r.score);
        const average = (scores.reduce((a, b) => a + b, 0) / results.length).toFixed(2);
        const passCount = results.filter(r => r.status === 'Pass').length;
        const failCount = results.filter(r => r.status === 'Fail').length;
        
        res.json({
            totalStudents: results.length,
            averageScore: average,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            passCount,
            failCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
