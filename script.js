const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));
let allResults = [];

// Initialize app
window.addEventListener('DOMContentLoaded', function() {
    if (authToken && currentUser) {
        showApp();
        loadResults();
    } else {
        showAuth();
    }
});

// Auth Functions
function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    if (tab === 'login') {
        document.getElementById('loginTab').classList.add('active');
    } else {
        document.getElementById('signupTab').classList.add('active');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        document.getElementById('loginError').textContent = 'Please fill all fields';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            document.getElementById('loginError').textContent = data.message;
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        currentUser = data.user;
        
        showApp();
        loadResults();
    } catch (error) {
        document.getElementById('loginError').textContent = 'Connection error';
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    
    if (!name || !email || !password) {
        document.getElementById('signupError').textContent = 'Please fill all fields';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            document.getElementById('signupError').textContent = data.message;
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        currentUser = data.user;
        
        showApp();
        loadResults();
    } catch (error) {
        document.getElementById('signupError').textContent = 'Connection error';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    showAuth();
}

function showAuth() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = `(${currentUser.role})`;
    
    if (currentUser.role === 'teacher') {
        document.getElementById('teacherSection').style.display = 'block';
        document.getElementById('actionHeader').style.display = 'table-cell';
    } else {
        document.getElementById('teacherSection').style.display = 'none';
        document.getElementById('actionHeader').style.display = 'none';
    }
}

// Results Functions
async function loadResults() {
    try {
        const response = await fetch(`${API_URL}/results`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        allResults = data;
        displayResults(allResults);
        loadStats();
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

function displayResults(results) {
    const table = document.getElementById('resultTable');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (results.length === 0) {
        table.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    table.innerHTML = results.map(result => `
        <tr>
            <td>${result.studentName}</td>
            <td>${result.score}</td>
            <td><strong>${result.grade}</strong></td>
            <td>${result.status}</td>
            <td>${result.subject}</td>
            <td>${new Date(result.createdAt).toLocaleDateString()}</td>
            ${currentUser.role === 'teacher' ? `
                <td>
                    <button class="edit-btn" onclick="editResult('${result._id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteResult('${result._id}')">Delete</button>
                </td>
            ` : ''}
        </tr>
    `).join('');
}

async function addResult() {
    // Deprecated: use saveResult() which handles create & update
}

async function saveResult() {
    const studentName = document.getElementById('studentName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const scoreVal = document.getElementById('studentScore').value;
    const subject = document.getElementById('subject').value.trim();
    const editingId = document.getElementById('editingId').value;

    if (!studentName || scoreVal === '') {
        alert('Please fill student name and score');
        return;
    }

    const score = parseInt(scoreVal);
    if (isNaN(score) || score < 0 || score > 100) {
        alert('Please enter a valid score (0-100)');
        return;
    }

    try {
        let url = `${API_URL}/results`;
        let method = 'POST';
        if (editingId) {
            url = `${API_URL}/results/${editingId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                studentName,
                studentId: studentId || null,
                score,
                subject: subject || 'General'
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to save result');

        // Reset form
        document.getElementById('studentName').value = '';
        document.getElementById('studentId').value = '';
        document.getElementById('studentScore').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('editingId').value = '';
        document.getElementById('saveBtn').textContent = 'Add Result';
        document.getElementById('cancelEditBtn').style.display = 'none';

        loadResults();
    } catch (error) {
        alert('Error saving result: ' + error.message);
    }
}

function editResult(id) {
    // Find result in local cache
    const result = allResults.find(r => r._id === id);
    if (!result) {
        alert('Result not found');
        return;
    }

    document.getElementById('studentName').value = result.studentName || '';
    document.getElementById('studentId').value = result.studentId || '';
    document.getElementById('studentScore').value = result.score || '';
    document.getElementById('subject').value = result.subject || '';
    document.getElementById('editingId').value = id;
    document.getElementById('saveBtn').textContent = 'Update Result';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = '';
    document.getElementById('studentScore').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('editingId').value = '';
    document.getElementById('saveBtn').textContent = 'Add Result';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

async function deleteResult(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
        const response = await fetch(`${API_URL}/results/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to delete result');
        
        loadResults();
    } catch (error) {
        alert('Error deleting result: ' + error.message);
    }
}

async function filterResults() {
    const studentName = document.getElementById('searchName').value;
    const subject = document.getElementById('filterSubject').value;
    const status = document.getElementById('filterStatus').value;
    const grade = document.getElementById('filterGrade').value;
    
    let filtered = allResults;
    
    if (studentName) {
        filtered = filtered.filter(r => r.studentName.toLowerCase().includes(studentName.toLowerCase()));
    }
    if (subject) {
        filtered = filtered.filter(r => r.subject === subject);
    }
    if (status) {
        filtered = filtered.filter(r => r.status === status);
    }
    if (grade) {
        filtered = filtered.filter(r => r.grade === grade);
    }
    
    displayResults(filtered);
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/results/stats/summary`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const stats = await response.json();
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('averageScore').textContent = stats.averageScore;
        document.getElementById('highestScore').textContent = stats.highestScore;
        document.getElementById('lowestScore').textContent = stats.lowestScore;
        document.getElementById('passCount').textContent = stats.passCount;
        document.getElementById('failCount').textContent = stats.failCount;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function exportCSV() {
    try {
        const link = document.createElement('a');
        link.href = `${API_URL}/results/export/csv`;
        link.href = `http://localhost:5000/api/results/export/csv`;
        
        // Create inline fetch with authorization
        const response = await fetch(`http://localhost:5000/api/results/export/csv`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'results.csv';
        link.click();
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Export failed. Make sure the server is running.');
    }
}

async function exportPDF() {
    try {
        const response = await fetch(`http://localhost:5000/api/results/export/pdf`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'results.pdf';
        link.click();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Export failed. Make sure the server is running.');
    }
}

function editResult(id) {
    alert('Edit functionality coming soon');
}
