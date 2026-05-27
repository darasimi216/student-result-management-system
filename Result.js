const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B', 'C', 'D', 'F']
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail']
    },
    subject: {
        type: String,
        default: 'General'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate grade and status before saving
resultSchema.pre('save', function(next) {
    const score = this.score;
    
    if (score >= 90) this.grade = 'A+';
    else if (score >= 80) this.grade = 'A';
    else if (score >= 70) this.grade = 'B';
    else if (score >= 60) this.grade = 'C';
    else if (score >= 50) this.grade = 'D';
    else this.grade = 'F';
    
    this.status = score >= 50 ? 'Pass' : 'Fail';
    this.updatedAt = Date.now();
    
    next();
});

module.exports = mongoose.model('Result', resultSchema);
