// Faculty Dashboard JavaScript

// Sample data for demonstration
const sampleAttendanceData = [
    { studentId: 'ST001', name: 'John Doe', course: 'CS101', date: '2024-01-15', time: '09:00', status: 'Present' },
    { studentId: 'ST002', name: 'Jane Smith', course: 'CS101', date: '2024-01-15', time: '09:02', status: 'Present' },
    { studentId: 'ST003', name: 'Mike Johnson', course: 'CS101', date: '2024-01-15', time: '09:05', status: 'Present' },
    { studentId: 'ST004', name: 'Sarah Wilson', course: 'CS101', date: '2024-01-15', time: '09:08', status: 'Present' },
    { studentId: 'ST005', name: 'David Brown', course: 'CS101', date: '2024-01-15', time: '09:10', status: 'Absent' },
    { studentId: 'ST001', name: 'John Doe', course: 'CS201', date: '2024-01-16', time: '10:00', status: 'Present' },
    { studentId: 'ST002', name: 'Jane Smith', course: 'CS201', date: '2024-01-16', time: '10:01', status: 'Present' },
    { studentId: 'ST003', name: 'Mike Johnson', course: 'CS201', date: '2024-01-16', time: '10:03', status: 'Present' },
    { studentId: 'ST004', name: 'Sarah Wilson', course: 'CS201', date: '2024-01-16', time: '10:05', status: 'Present' },
    { studentId: 'ST005', name: 'David Brown', course: 'CS201', date: '2024-01-16', time: '10:07', status: 'Present' }
];

const sampleStudentsData = [
    { studentId: 'ST001', name: 'John Doe', email: 'john.doe@email.com', course: 'CS101', attendance: 95 },
    { studentId: 'ST002', name: 'Jane Smith', email: 'jane.smith@email.com', course: 'CS101', attendance: 88 },
    { studentId: 'ST003', name: 'Mike Johnson', email: 'mike.johnson@email.com', course: 'CS101', attendance: 92 },
    { studentId: 'ST004', name: 'Sarah Wilson', email: 'sarah.wilson@email.com', course: 'CS101', attendance: 85 },
    { studentId: 'ST005', name: 'David Brown', email: 'david.brown@email.com', course: 'CS101', attendance: 78 }
];

// Navigation functionality
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    event.target.classList.add('active');
    
    // Initialize section-specific functionality
    if (sectionId === 'dashboard') {
        initializeDashboard();
    } else if (sectionId === 'attendance') {
        loadAttendanceData();
    } else if (sectionId === 'students') {
        loadStudentsData();
    } else if (sectionId === 'reports') {
        initializeReports();
    }
}

// QR Code Generation
function generateQR() {
    const course = document.getElementById('courseSelect').value;
    const date = document.getElementById('classDate').value;
    const time = document.getElementById('classTime').value;
    const duration = document.getElementById('duration').value;
    const location = document.getElementById('location').value;
    
    if (!course || !date || !time || !duration || !location) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create QR code data
    const qrData = {
        course: course,
        date: date,
        time: time,
        duration: duration,
        location: location,
        faculty: 'Dr. Sarah Johnson',
        timestamp: new Date().toISOString()
    };
    
    const qrString = JSON.stringify(qrData);
    
    // Generate QR code
    QRCode.toCanvas(document.createElement('canvas'), qrString, {
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function (error, canvas) {
        if (error) {
            console.error('QR Code generation error:', error);
            alert('Error generating QR code');
            return;
        }
        
        // Display QR code
        const qrDisplay = document.getElementById('qrDisplay');
        qrDisplay.innerHTML = '';
        qrDisplay.appendChild(canvas);
        
        // Store QR data for download
        window.currentQRData = qrData;
        window.currentQRCanvas = canvas;
        
        // Show success message
        showNotification('QR Code generated successfully!', 'success');
    });
}

// Download QR Code
function downloadQR() {
    if (!window.currentQRCanvas) {
        alert('Please generate a QR code first');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `attendance-qr-${window.currentQRData.course}-${window.currentQRData.date}.png`;
    link.href = window.currentQRCanvas.toDataURL();
    link.click();
}

// Load attendance data
function loadAttendanceData() {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';
    
    sampleAttendanceData.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.studentId}</td>
            <td>${record.name}</td>
            <td>${record.course}</td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td><span class="status-badge ${record.status === 'Present' ? 'status-present' : 'status-absent'}">${record.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Load students data
function loadStudentsData() {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = '';
    
    sampleStudentsData.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.studentId}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.attendance}%</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;">View Details</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize dashboard charts
function initializeDashboard() {
    // Attendance Trend Chart
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(attendanceCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Attendance %',
                data: [85, 88, 92, 89, 91, 87],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Course-wise Attendance Chart
    const courseCtx = document.getElementById('courseChart').getContext('2d');
    new Chart(courseCtx, {
        type: 'doughnut',
        data: {
            labels: ['CS101', 'CS201', 'CS301', 'CS401'],
            datasets: [{
                data: [89, 92, 85, 88],
                backgroundColor: [
                    '#4361ee',
                    '#3f37c9',
                    '#4cc9f0',
                    '#4caf50'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize reports charts
function initializeReports() {
    // Monthly Attendance Overview
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Average Attendance',
                data: [87, 89, 91, 88, 90, 92],
                backgroundColor: '#4361ee'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Student Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Attendance', 'Participation', 'Assignments', 'Quizzes', 'Projects'],
            datasets: [{
                label: 'Class Average',
                data: [89, 85, 88, 92, 87],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.2)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Export attendance data
function exportAttendance() {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student ID,Name,Course,Date,Time,Status\n";
    
    sampleAttendanceData.forEach(record => {
        csvContent += `${record.studentId},${record.name},${record.course},${record.date},${record.time},${record.status}\n`;
    });
    
    // Download CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Attendance data exported successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else {
        notification.style.backgroundColor = '#2196f3';
    }
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Set default date and time
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('classDate').value = today;
    
    // Set current time as default
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('classTime').value = timeString;
    
    // Initialize dashboard on page load
    initializeDashboard();
    
    // Load initial data
    loadAttendanceData();
    loadStudentsData();
});

// Auto-refresh QR code every 30 seconds (for security)
setInterval(() => {
    if (window.currentQRData) {
        // Update timestamp
        window.currentQRData.timestamp = new Date().toISOString();
        const qrString = JSON.stringify(window.currentQRData);
        
        QRCode.toCanvas(document.createElement('canvas'), qrString, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (error, canvas) {
            if (!error && window.currentQRCanvas) {
                const qrDisplay = document.getElementById('qrDisplay');
                if (qrDisplay && qrDisplay.contains(window.currentQRCanvas)) {
                    qrDisplay.innerHTML = '';
                    qrDisplay.appendChild(canvas);
                    window.currentQRCanvas = canvas;
                }
            }
        });
    }
}, 30000);
