// Violation Reporting System (Firebase version)

// Initialize global array for reports (for display only)
let violationReports = [];

// Listen for real-time updates from Firestore
function listenForReports() {
    firebaseDB.collection('violationReports').orderBy('dateReported', 'desc').onSnapshot(snapshot => {
        violationReports = [];
        snapshot.forEach(doc => {
            violationReports.push({ id: doc.id, ...doc.data() });
        });
        loadReportsTable();
    }, error => {
        console.error('Error fetching reports:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('violationDate').value = new Date().toISOString().split('T')[0];
    // Listen for real-time updates
    listenForReports();
    // Handle form submission
    const form = document.getElementById('violationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
    // Show admin section if logged in
    if (window.auth && window.auth.isLoggedIn()) {
        showAdminSection();
    }
    // Handle filter dropdown
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const status = this.getAttribute('data-status');
            filterReports(status);
        });
    });
});

// Handle form submission (add to Firestore)
function handleFormSubmission(event) {
    event.preventDefault();
    const formData = {
        reporterName: document.getElementById('reporterName').value,
        reporterContact: document.getElementById('reporterContact').value,
        reporterEmail: document.getElementById('reporterEmail').value,
        reporterAddress: document.getElementById('reporterAddress').value,
        violationType: document.getElementById('violationType').value,
        violationDate: document.getElementById('violationDate').value,
        violationTime: document.getElementById('violationTime').value,
        violationLocation: document.getElementById('violationLocation').value,
        violationDescription: document.getElementById('violationDescription').value,
        status: 'Pending',
        dateReported: new Date().toISOString(),
        evidence: null
    };
    // Handle file upload
    const evidenceFile = document.getElementById('violationEvidence').files[0];
    if (evidenceFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.evidence = e.target.result;
            addReportToFirestore(formData);
        };
        reader.readAsDataURL(evidenceFile);
    } else {
        addReportToFirestore(formData);
    }
}

// Add report to Firestore
function addReportToFirestore(report) {
    firebaseDB.collection('violationReports').add(report)
        .then(() => {
            showSuccessMessage('Report submitted successfully!');
        })
        .catch(error => {
            console.error('Error adding report:', error);
            showSuccessMessage('Failed to submit report. Please try again.');
        });
}

// Show success message
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.classList.add('show');
    document.getElementById('violationForm').reset();
    document.getElementById('violationDate').value = new Date().toISOString().split('T')[0];
    setTimeout(() => {
        successMessage.style.display = 'none';
        successMessage.classList.remove('show');
    }, 5000);
}

// Show admin section
function showAdminSection() {
    const adminSection = document.getElementById('adminSection');
    adminSection.style.display = 'block';
    loadReportsTable();
}

// Load reports table from violationReports array
function loadReportsTable() {
    const tableBody = document.getElementById('reportsTableBody');
    tableBody.innerHTML = '';
    violationReports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${report.id}</td>
            <td>${formatDateTime(report.dateReported)}</td>
            <td>${report.violationType}</td>
            <td>${report.violationLocation}</td>
            <td>${report.reporterName}</td>
            <td><span class="badge bg-${getStatusColor(report.status)}">${report.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetails('${report.id}')">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editReportStatus('${report.id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReport('${report.id}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter reports by status
function filterReports(status) {
    const tableBody = document.getElementById('reportsTableBody');
    tableBody.innerHTML = '';
    const filteredReports = status === 'all' 
        ? violationReports 
        : violationReports.filter(report => report.status === status);
    filteredReports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${report.id}</td>
            <td>${formatDateTime(report.dateReported)}</td>
            <td>${report.violationType}</td>
            <td>${report.violationLocation}</td>
            <td>${report.reporterName}</td>
            <td><span class="badge bg-${getStatusColor(report.status)}">${report.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetails('${report.id}')">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editReportStatus('${report.id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReport('${report.id}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// View report details
function viewReportDetails(id) {
    const report = violationReports.find(r => r.id === id);
    if (report) {
        const modal = new bootstrap.Modal(document.getElementById('reportDetailsModal'));
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
                    <p><strong>Status:</strong> 
                        <select class="form-select form-select-sm d-inline-block w-auto" id="statusSelect">
                            <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Under Investigation" ${report.status === 'Under Investigation' ? 'selected' : ''}>Under Investigation</option>
                            <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </p>
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
        modal.show();
    }
}

// Edit report status (update in Firestore)
function editReportStatus(id) {
    const report = violationReports.find(r => r.id === id);
    if (report) {
        const newStatus = prompt('Update status (Pending/Under Investigation/Resolved):', report.status);
        if (newStatus && ['Pending', 'Under Investigation', 'Resolved'].includes(newStatus)) {
            firebaseDB.collection('violationReports').doc(id).update({ status: newStatus })
                .then(() => {
                    // Success, no need to reload, real-time listener will update
                })
                .catch(error => {
                    alert('Error updating status: ' + error.message);
                });
        }
    }
}

// Delete report (from Firestore)
function deleteReport(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        firebaseDB.collection('violationReports').doc(id).delete()
            .then(() => {
                // Success, real-time listener will update
            })
            .catch(error => {
                alert('Error deleting report: ' + error.message);
            });
    }
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

// Save status changes from modal
document.addEventListener('DOMContentLoaded', function() {
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', function() {
            const statusSelect = document.getElementById('statusSelect');
            if (statusSelect) {
                const newStatus = statusSelect.value;
                // Update the current report status (you'll need to track which report is being edited)
                // This is a simplified version - in a real app you'd track the current report ID
                alert('Status updated! (This would update the actual report in a real implementation)');
                bootstrap.Modal.getInstance(document.getElementById('reportDetailsModal')).hide();
            }
        });
    }
});

// Export functions for reuse
window.violations = {
    listenForReports,
    handleFormSubmission,
    addReportToFirestore,
    editReportStatus,
    deleteReport,
    filterReports,
    loadReportsTable
};