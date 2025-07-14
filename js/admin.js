// Admin Dashboard Functionality

// Initialize admin dashboard
// --- VIOLATION REPORTS MANAGEMENT (Firebase) ---

let adminReports = [];

// Listen for real-time updates from Firestore
function listenForAdminReports() {
    firebaseDB.collection('violationReports').orderBy('dateReported', 'desc').onSnapshot(snapshot => {
        adminReports = [];
        snapshot.forEach(doc => {
            adminReports.push({ id: doc.id, ...doc.data() });
        });
        loadReports();
        updateStatistics();
    }, error => {
        console.error('Error fetching reports:', error);
        loadReports([]);
        updateStatistics();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    listenForAdminReports();
    loadAnnouncements();
    loadUsers();
    // Add event listener for user search
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function() {
            searchUsers(this.value);
        });
    }
    // Add event listener for report search
    const reportSearchInput = document.getElementById('reportSearchInput');
    if (reportSearchInput) {
        reportSearchInput.addEventListener('input', function() {
            searchReports(this.value);
        });
    }
});

// Load violation reports from Firestore
function loadReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const data = Array.isArray(reports) ? reports : adminReports;
    data.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${report.id}</td>
            <td>${report.violationType}</td>
            <td>${formatDateTime(report.dateReported)}</td>
            <td>${report.violationLocation}</td>
            <td>${report.reporterName || 'N/A'}</td>
            <td><span class="badge bg-${getStatusColor(report.status)}">${report.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewReport('${report.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editReport('${report.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReport('${report.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search violation reports
function searchReports(query) {
    if (!query || query.trim() === '') {
        loadReports(adminReports);
        return;
    }
    const searchTerm = query.toLowerCase().trim();
    const filteredReports = adminReports.filter(report => {
        const id = String(report.id).toLowerCase();
        const type = (report.violationType || '').toLowerCase();
        const location = (report.violationLocation || '').toLowerCase();
        const status = (report.status || '').toLowerCase();
        const reporter = (report.reporterName || '').toLowerCase();
        return id.includes(searchTerm) ||
               type.includes(searchTerm) ||
               location.includes(searchTerm) ||
               status.includes(searchTerm) ||
               reporter.includes(searchTerm);
    });
    loadReports(filteredReports);
}

// Clear report search
function clearReportSearch() {
    const searchInput = document.getElementById('reportSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    loadReports(adminReports);
}

// Update statistics cards from Firestore data
function updateStatistics() {
    const total = adminReports.length;
    const pending = adminReports.filter(r => r.status === 'Pending').length;
    const investigating = adminReports.filter(r => r.status === 'Under Investigation').length;
    const resolved = adminReports.filter(r => r.status === 'Resolved').length;
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

// View report details from Firestore data
function openReportModal(id, focusEdit = false) {
    const report = adminReports.find(r => r.id === id);
    if (report) {
        const content = document.getElementById('reportDetailsContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Reporter Information</h6>
                    <p><strong>Name:</strong> ${report.reporterName}</p>
                    <p><strong>Contact:</strong> ${report.reporterContact}</p>
                    <p><strong>Email:</strong> ${report.reporterEmail || 'N/A'}</p>
                    <p><strong>Address:</strong> ${report.reporterAddress}</p>
                </div>
                <div class="col-md-6">
                    <h6>Violation Details</h6>
                    <p><strong>Type:</strong> ${report.violationType}</p>
                    <p><strong>Date:</strong> ${report.violationDate}</p>
                    <p><strong>Time:</strong> ${report.violationTime}</p>
                    <p><strong>Location:</strong> ${report.violationLocation}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(report.status)}">${report.status}</span></p>
                </div>
                <div class="col-12">
                    <h6>Description</h6>
                    <p>${report.violationDescription}</p>
                </div>
                ${report.evidence ? `
                <div class="col-12">
                    <h6>Evidence</h6>
                    <img src="${report.evidence}" class="img-fluid" style="max-width: 300px;" alt="Evidence">
                </div>
                ` : ''}
            </div>
        `;
        // Add status dropdown to modal
        const statusUpdateContainer = document.getElementById('statusUpdateContainer');
        statusUpdateContainer.innerHTML = `
            <div class="mt-3">
                <label for="modalStatusSelect" class="form-label">Update Status</label>
                <select id="modalStatusSelect" class="form-select">
                    <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Under Investigation" ${report.status === 'Under Investigation' ? 'selected' : ''}>Under Investigation</option>
                    <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                </select>
            </div>
        `;
        // Store current report id for status update
        statusUpdateContainer.setAttribute('data-report-id', report.id);
        const modalEl = document.getElementById('reportDetailsModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        if (focusEdit) {
            setTimeout(() => {
                const statusSelect = document.getElementById('modalStatusSelect');
                if (statusSelect) statusSelect.focus();
            }, 400);
        }
    }
}

// For backward compatibility
function viewReport(id) {
    openReportModal(id, false);
}

function editReport(id) {
    openReportModal(id, true);
}

// Edit report status (update in Firestore)

// Save status from modal
document.addEventListener('DOMContentLoaded', function() {
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', function() {
            const statusUpdateContainer = document.getElementById('statusUpdateContainer');
            const reportId = statusUpdateContainer.getAttribute('data-report-id');
            const newStatus = document.getElementById('modalStatusSelect').value;
            if (reportId && newStatus) {
                firebaseDB.collection('violationReports').doc(reportId).update({ status: newStatus })
                    .then(() => {
                        addActivity(`Updated report #${reportId} status to ${newStatus}`);
                        // Optionally close modal
                        const modalEl = document.getElementById('reportDetailsModal');
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) modal.hide();
                    })
                    .catch(error => {
                        alert('Error updating report: ' + error.message);
                    });
            }
        });
    }
});

// Delete report (from Firestore)
function deleteReport(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        firebaseDB.collection('violationReports').doc(id).delete()
            .then(() => {
                addActivity(`Deleted report #${id}`);
            })
            .catch(error => {
                alert('Error deleting report: ' + error.message);
            });
    }
}

// Export reports (from Firestore data)
function exportReports() {
    if (!adminReports.length) {
        alert('No reports to export.');
        return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Type,Date & Time,Location,Status,Reporter,Contact\n"
        + adminReports.map(r => 
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

// --- USER MANAGEMENT (Firebase only) ---

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

// View user details (from allUsers array)
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        const details = `\nUser ID: #${user.id}\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${user.address}\nRegistered: ${formatDateTime(user.registeredAt)}\nStatus: ${user.status}`;
        alert(details);
    } else {
        alert('User not found.');
    }
}

// Edit user status (update in Firebase)
function editUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        const newStatus = prompt('Update status (active/inactive):', user.status);
        if (newStatus && ['active', 'inactive'].includes(newStatus.toLowerCase())) {
            firebaseDB.collection('users').doc(userId).update({
                status: newStatus.toLowerCase()
            }).then(() => {
                addActivity(`Updated user #${userId} status to ${newStatus}`);
                loadUsers();
            }).catch((error) => {
                alert('Error updating user status: ' + error.message);
            });
        }
    } else {
        alert('User not found.');
    }
}

// Delete user (from Firebase)
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        firebaseDB.collection('users').doc(userId).delete()
            .then(() => {
                addActivity(`Deleted user #${userId}`);
                loadUsers();
            })
            .catch((error) => {
                alert('Error deleting user: ' + error.message);
            });
    }
}

// Export users (from allUsers array)
function exportUsers() {
    if (!allUsers.length) {
        alert('No users to export.');
        return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Email,Phone,Address,Registered,Status\n"
        + allUsers.map(u => 
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

// Search users (from allUsers array)
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

// Export data
function exportData() {
    const storedReports = JSON.parse(localStorage.getItem('violationReports')) || [];
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    const data = {
        reports: storedReports,
        announcements: announcements,
        users: allUsers, // Use allUsers from Firebase
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

// Remove addUser and addTestReport functions