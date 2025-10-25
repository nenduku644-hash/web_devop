// Student Dashboard JavaScript

// Sample data for demonstration
const sampleMyAttendanceData = [
    { course: 'CS101', date: '2024-01-15', time: '09:00', faculty: 'Dr. Sarah Johnson', status: 'Present' },
    { course: 'CS201', date: '2024-01-16', time: '10:00', faculty: 'Prof. Mike Wilson', status: 'Present' },
    { course: 'CS301', date: '2024-01-17', time: '14:00', faculty: 'Dr. Emily Brown', status: 'Present' },
    { course: 'CS401', date: '2024-01-18', time: '15:00', faculty: 'Prof. David Lee', status: 'Present' },
    { course: 'CS101', date: '2024-01-19', time: '09:00', faculty: 'Dr. Sarah Johnson', status: 'Present' },
    { course: 'CS201', date: '2024-01-20', time: '10:00', faculty: 'Prof. Mike Wilson', status: 'Absent' },
    { course: 'CS301', date: '2024-01-21', time: '14:00', faculty: 'Dr. Emily Brown', status: 'Present' },
    { course: 'CS401', date: '2024-01-22', time: '15:00', faculty: 'Prof. David Lee', status: 'Present' }
];

let html5QrcodeScanner = null;
let recentScans = [];

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
        loadMyAttendanceData();
    } else if (sectionId === 'analytics') {
        initializeAnalytics();
    } else if (sectionId === 'qr-scanner') {
        // Initialize scanner when section is shown
        setTimeout(() => {
            if (!html5QrcodeScanner) {
                initializeScanner();
            }
        }, 100);
    }
}

// Initialize QR Scanner
function initializeScanner() {
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

// QR Code scan success handler
function onScanSuccess(decodedText, decodedResult) {
    try {
        const qrData = JSON.parse(decodedText);
        
        // Validate QR data
        if (!qrData.course || !qrData.date || !qrData.time) {
            showError('Invalid QR code format');
            return;
        }
        
        // Check if QR code is for today
        const today = new Date().toISOString().split('T')[0];
        if (qrData.date !== today) {
            showError('QR code is not valid for today');
            return;
        }
        
        // Check if class time is within reasonable range (within 2 hours)
        const now = new Date();
        const classTime = new Date(`${qrData.date}T${qrData.time}`);
        const timeDiff = Math.abs(now - classTime) / (1000 * 60 * 60); // hours
        
        if (timeDiff > 2) {
            showError('QR code is not valid for current time');
            return;
        }
        
        // Mark attendance
        markAttendance(qrData);
        
        // Add to recent scans
        addToRecentScans(qrData);
        
        // Show success message
        showSuccess(`Attendance marked successfully for ${qrData.course}`);
        
        // Stop scanner after successful scan
        setTimeout(() => {
            stopScanner();
        }, 2000);
        
    } catch (error) {
        console.error('Error parsing QR code:', error);
        showError('Invalid QR code');
    }
}

// QR Code scan failure handler
function onScanFailure(error) {
    // Handle scan failure silently
    console.warn(`QR Code scan error = ${error}`);
}

// Start scanner
function startScanner() {
    if (!html5QrcodeScanner) {
        initializeScanner();
    }
    
    // Hide messages
    hideMessages();
}

// Stop scanner
function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
    
    // Clear scanner area
    const scannerArea = document.getElementById('qr-reader');
    scannerArea.innerHTML = '<p style="color: var(--gray);">Scanner stopped. Click "Start Scanner" to begin.</p>';
}

// Mark attendance
function markAttendance(qrData) {
    // In a real application, this would send data to the server
    console.log('Marking attendance:', qrData);
    
    // Add to local attendance data
    const attendanceRecord = {
        course: qrData.course,
        date: qrData.date,
        time: qrData.time,
        faculty: qrData.faculty,
        status: 'Present'
    };
    
    sampleMyAttendanceData.unshift(attendanceRecord);
    
    // Update attendance table if it's visible
    if (document.getElementById('attendance').style.display !== 'none') {
        loadMyAttendanceData();
    }
}

// Add to recent scans
function addToRecentScans(qrData) {
    const scanRecord = {
        course: qrData.course,
        date: qrData.date,
        time: qrData.time,
        timestamp: new Date().toLocaleTimeString()
    };
    
    recentScans.unshift(scanRecord);
    
    // Keep only last 5 scans
    if (recentScans.length > 5) {
        recentScans = recentScans.slice(0, 5);
    }
    
    updateRecentScansDisplay();
}

// Update recent scans display
function updateRecentScansDisplay() {
    const recentScansDiv = document.getElementById('recentScans');
    
    if (recentScans.length === 0) {
        recentScansDiv.innerHTML = '<p style="color: var(--gray); font-size: 0.9rem;">No recent scans</p>';
        return;
    }
    
    let html = '';
    recentScans.forEach(scan => {
        html += `
            <div style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                <div style="font-weight: 500;">${scan.course}</div>
                <div style="font-size: 0.8rem; color: var(--gray);">
                    ${scan.date} at ${scan.time} (${scan.timestamp})
                </div>
            </div>
        `;
    });
    
    recentScansDiv.innerHTML = html;
}

// Load my attendance data
function loadMyAttendanceData() {
    const tableBody = document.getElementById('myAttendanceTableBody');
    tableBody.innerHTML = '';
    
    sampleMyAttendanceData.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.course}</td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${record.faculty}</td>
            <td><span class="status-badge ${record.status === 'Present' ? 'status-present' : 'status-absent'}">${record.status}</span></td>
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
                data: [90, 88, 95, 92, 89, 92],
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
                data: [95, 88, 92, 89],
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

// Initialize analytics charts
function initializeAnalytics() {
    // Monthly Attendance Overview
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'My Attendance',
                data: [92, 89, 95, 91, 88, 94],
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
    
    // Performance Metrics Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Attendance', 'Participation', 'Assignments', 'Quizzes', 'Projects'],
            datasets: [{
                label: 'My Performance',
                data: [92, 85, 88, 90, 87],
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

// Export my attendance data
function exportMyAttendance() {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Course,Date,Time,Faculty,Status\n";
    
    sampleMyAttendanceData.forEach(record => {
        csvContent += `${record.course},${record.date},${record.time},${record.faculty},${record.status}\n`;
    });
    
    // Download CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Attendance records exported successfully!', 'success');
}

// Show success message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.innerHTML = `<i class="fas fa-check-circle"></i> <strong>Success!</strong> ${message}`;
    successMessage.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> <strong>Error!</strong> ${message}`;
    errorMessage.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Hide all messages
function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
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

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard on page load
    initializeDashboard();
    
    // Load initial data
    loadMyAttendanceData();
    
    // Update recent scans display
    updateRecentScansDisplay();
});

// Handle page visibility change to stop scanner when page is hidden
document.addEventListener('visibilitychange', function() {
    if (document.hidden && html5QrcodeScanner) {
        stopScanner();
    }
});

// Handle beforeunload to clean up scanner
window.addEventListener('beforeunload', function() {
    if (html5QrcodeScanner) {
        stopScanner();
    }
});
