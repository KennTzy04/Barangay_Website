// Admin Dashboard Functionality

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadReports();
    updateStatistics();
    loadRecentActivity();
    loadAnnouncements();
    loadUsers();
    // Add event listener for user search
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function() {
            searchUsers(this.value);
        });
    }
});

// Load violation reports from localStorage
function loadReports() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const tableBody = document.getElementById('reportsTableBody');
    tableBody.innerHTML = '';
    
    storedReports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${report.id}</td>
            <td>${report.violationType}</td>
            <td>${formatDateTime(report.dateReported)}</td>
            <td>${report.violationLocation}</td>
            <td><span class="badge bg-${getStatusColor(report.status)}">${report.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewReport(${report.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editReport(${report.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update statistics cards
function updateStatistics() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const total = storedReports.length;
    const pending = storedReports.filter(r => r.status === 'Pending').length;
    const investigating = storedReports.filter(r => r.status === 'Under Investigation').length;
    const resolved = storedReports.filter(r => r.status === 'Resolved').length;
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('pendingReports').textContent = pending;
    document.getElementById('investigatingReports').textContent = investigating;
    document.getElementById('resolvedReports').textContent = resolved;
}

// Get status badge color
function getStatusColor(status) {
    switch(status) {
        case 'Pending': return 'warning';
        case 'Under Investigation': return 'info';
        case 'Resolved': return 'success';
        default: return 'secondary';
    }
}

// Format date and time
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// View report details
function viewReport(id) {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const report = storedReports.find(r => r.id === id);
    if (report) {
        const details = `
            Report ID: #${report.id}
            Type: ${report.violationType}
            Date & Time: ${formatDateTime(report.dateReported)}
            Location: ${report.violationLocation}
            Description: ${report.violationDescription}
            Status: ${report.status}
            Reporter: ${report.reporterName}
            Contact: ${report.reporterContact}
            Email: ${report.reporterEmail || 'N/A'}
            Address: ${report.reporterAddress}
        `;
        alert(details);
    }
}

// Edit report status
function editReport(id) {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const report = storedReports.find(r => r.id === id);
    if (report) {
        const newStatus = prompt('Update status (Pending/Under Investigation/Resolved):', report.status);
        if (newStatus && ['Pending', 'Under Investigation', 'Resolved'].includes(newStatus)) {
            report.status = newStatus;
            localStorage.setItem('violationReports', JSON.stringify(storedReports));
            loadReports();
            updateStatistics();
            addActivity(`Updated report #${id} status to ${newStatus}`);
        }
    }
}

// Delete report
function deleteReport(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
        const updatedReports = storedReports.filter(r => r.id !== id);
        localStorage.setItem('violationReports', JSON.stringify(updatedReports));
        loadReports();
        updateStatistics();
        addActivity(`Deleted report #${id}`);
    }
}

// Export reports
function exportReports() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Type,Date & Time,Location,Status,Reporter,Contact\n"
        + storedReports.map(r => 
            `${r.id},${r.violationType},${formatDateTime(r.dateReported)},${r.violationLocation},${r.status},${r.reporterName},${r.reporterContact}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "violation_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addActivity('Exported violation reports to CSV');
}

// Print reports
function printReports() {
    window.print();
    addActivity('Printed violation reports');
}

// Add announcement
function addAnnouncement() {
    const title = prompt('Announcement title:');
    const content = prompt('Announcement content:');
    if (title && content) {
        const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        const newAnnouncement = {
            id: Date.now(),
            title: title,
            content: content,
            dateCreated: new Date().toISOString(),
            author: 'Admin'
        };
        announcements.push(newAnnouncement);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        addActivity(`Added announcement: ${title}`);
        alert('Announcement added successfully!');
    }
}

// Load announcements
function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    // This would populate an announcements section in the admin dashboard
    console.log('Announcements loaded:', announcements);
}

// Global variable to store all users
let allUsers = [];

// Load registered users from Firebase with real-time updates
function loadUsers() {
    try {
        // Set up real-time listener for users collection
        firebaseDB.collection('users').onSnapshot((snapshot) => {
            allUsers = [];
            
            snapshot.forEach(doc => {
                const userData = doc.data();
                allUsers.push({
                    id: doc.id,
                    ...userData
                });
            });
            
            displayUsers(allUsers);
            
            // Update user count in admin dashboard
            const userCountElement = document.getElementById('userCount');
            if (userCountElement) {
                userCountElement.textContent = allUsers.length;
            }
            
            console.log('Real-time users update:', allUsers.length, 'users');
        }, (error) => {
            console.error('Error listening to users:', error);
            displayUsers([]);
        });
    } catch (error) {
        console.error('Error setting up users listener:', error);
        displayUsers([]);
    }
}

// Display users with search functionality
function displayUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    const noUsersMessage = document.getElementById('noUsersMessage');
    const userCount = document.getElementById('userCount');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.style.display = 'none';
        noUsersMessage.style.display = 'block';
        userCount.textContent = '0';
    } else {
        tableBody.style.display = 'table-row-group';
        noUsersMessage.style.display = 'none';
        userCount.textContent = users.length;
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.address.substring(0, 50)}${user.address.length > 50 ? '...' : ''}</td>
                <td>${formatDateTime(user.registeredAt)}</td>
                <td><span class="badge bg-success">${user.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewUser('${user.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editUserStatus('${user.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// View user details
function viewUser(userId) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        const details = `
            User ID: #${user.id}
            Name: ${user.firstName} ${user.lastName}
            Email: ${user.email}
            Phone: ${user.phone}
            Address: ${user.address}
            Registered: ${formatDateTime(user.registeredAt)}
            Status: ${user.status}
        `;
        alert(details);
    }
}

// Edit user status
function editUserStatus(userId) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        const newStatus = prompt('Update status (active/inactive):', user.status);
        if (newStatus && ['active', 'inactive'].includes(newStatus.toLowerCase())) {
            user.status = newStatus.toLowerCase();
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            loadUsers();
            addActivity(`Updated user #${userId} status to ${newStatus}`);
        }
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const updatedUsers = registeredUsers.filter(u => u.id !== userId);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        loadUsers();
        addActivity(`Deleted user #${userId}`);
    }
}

// Export users
function exportUsers() {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || []);
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Email,Phone,Address,Registered,Status\n"
        + registeredUsers.map(u => 
            `${u.id},${u.firstName} ${u.lastName},${u.email},${u.phone},"${u.address}",${formatDateTime(u.registeredAt)},${u.status}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "registered_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addActivity('Exported user data to CSV');
}

// Search users
function searchUsers(query) {
    if (!query || query.trim() === '') {
        displayUsers(allUsers);
        return;
    }
    const searchTerm = query.toLowerCase().trim();
    const filteredUsers = allUsers.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const phone = user.phone.toLowerCase();
        const address = user.address.toLowerCase();
        return fullName.includes(searchTerm) || 
               email.includes(searchTerm) || 
               phone.includes(searchTerm) || 
               address.includes(searchTerm);
    });
    displayUsers(filteredUsers);
}

// Clear user search
function clearUserSearch() {
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    displayUsers(allUsers);
}

// Add user
function addUser() {
    const username = prompt('Username:');
    const email = prompt('Email:');
    const role = prompt('Role (Administrator/Secretary/Staff):');
    
    if (username && email && role) {
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            role: role,
            status: 'Active',
            lastLogin: null
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        addActivity(`Added user: ${username}`);
        alert('User added successfully!');
    }
}

// Export data
function exportData() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    const data = {
        reports: storedReports,
        announcements: announcements,
        users: users,
        exportDate: new Date().toISOString(),
        totalReports: storedReports.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "barangay_data.json";
    link.click();
    
    addActivity('Exported all data to JSON');
}

// View analytics
function viewAnalytics() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const stats = {
        total: storedReports.length,
        byStatus: storedReports.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {}),
        byType: storedReports.reduce((acc, r) => {
            acc[r.violationType] = (acc[r.violationType] || 0) + 1;
            return acc;
        }, {})
    };
    
    alert(`Analytics:\nTotal Reports: ${stats.total}\nBy Status: ${JSON.stringify(stats.byStatus)}\nBy Type: ${JSON.stringify(stats.byType)}`);
    addActivity('Viewed analytics');
}

// Add activity to recent activity
function addActivity(activity) {
    const activityDiv = document.getElementById('recentActivity');
    const timestamp = new Date().toLocaleTimeString();
    const activityItem = document.createElement('div');
    activityItem.className = 'mb-2';
    activityItem.innerHTML = `
        <small class="text-muted">${timestamp}</small><br>
        <span>${activity}</span>
    `;
    
    // Keep only last 5 activities
    const activities = activityDiv.querySelectorAll('div');
    if (activities.length >= 5) {
        activities[0].remove();
    }
    
    activityDiv.appendChild(activityItem);
}

// Load recent activity
function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    activityDiv.innerHTML = '<p class="text-muted">No recent activity</p>';
}

// Add new report (for testing)
function addTestReport() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const newReport = {
        id: Date.now(),
        reporterName: "Test User",
        reporterContact: "0917 000 0000",
        reporterEmail: "test@email.com",
        reporterAddress: "Test Address",
        violationType: "Test Violation",
        violationDate: new Date().toISOString().split('T')[0],
        violationTime: "12:00",
        violationLocation: "Test Location",
        violationDescription: "Test description",
        status: "Pending",
        dateReported: new Date().toISOString(),
        evidence: null
    };
    
    storedReports.push(newReport);
    localStorage.setItem('violationReports', JSON.stringify(storedReports));
    loadReports();
    updateStatistics();
    addActivity(`Added new test report #${newReport.id}`);
} 