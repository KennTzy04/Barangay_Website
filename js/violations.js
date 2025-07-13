// Violation Reporting System

// Initialize violation reports from localStorage or use default data
let violationReports = JSON.parse(localStorage.getItem('violationReports')) || [
    {
        id: 1,
        reporterName: "John Doe",
        reporterContact: "0917 123 4567",
        reporterEmail: "john@email.com",
        reporterAddress: "123 Main Street",
        violationType: "Noise Disturbance",
        violationDate: "2024-01-15",
        violationTime: "14:30",
        violationLocation: "123 Main Street",
        violationDescription: "Loud music playing late at night",
        status: "Pending",
        dateReported: "2024-01-15T14:30:00",
        evidence: null
    },
    {
        id: 2,
        reporterName: "Jane Smith",
        reporterContact: "0918 765 4321",
        reporterEmail: "jane@email.com",
        reporterAddress: "456 Oak Avenue",
        violationType: "Illegal Parking",
        violationDate: "2024-01-14",
        violationTime: "09:15",
        violationLocation: "456 Oak Avenue",
        violationDescription: "Vehicle parked in no-parking zone",
        status: "Under Investigation",
        dateReported: "2024-01-14T09:15:00",
        evidence: null
    }
];

// Save reports to localStorage
function saveReports() {
    localStorage.setItem('violationReports', JSON.stringify(violationReports));
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('violationDate').value = new Date().toISOString().split('T')[0];
    
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

// Handle form submission
function handleFormSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        id: Date.now(), // Use timestamp as ID
        reporterName: document.getElementById('reporterName').value,
        reporterContact: document.getElementById('reporterContact').value,
        reporterEmail: document.getElementById('reporterEmail').value,
        reporterAddress: document.getElementById('reporterAddress').value,
        violationType: document.getElementById('violationType').value,
        violationDate: document.getElementById('violationDate').value,
        violationTime: document.getElementById('violationTime').value,
        violationLocation: document.getElementById('violationLocation').value,
        violationDescription: document.getElementById('violationDescription').value,
        status: "Pending",
        dateReported: new Date().toISOString(),
        evidence: null
    };
    
    // Handle file upload
    const evidenceFile = document.getElementById('violationEvidence').files[0];
    if (evidenceFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.evidence = e.target.result;
            saveReport(formData);
        };
        reader.readAsDataURL(evidenceFile);
    } else {
        saveReport(formData);
    }
}

// Save report and show success message
function saveReport(report) {
    violationReports.push(report);
    saveReports();
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    successMessage.classList.add('show');
    
    // Reset form
    document.getElementById('violationForm').reset();
    document.getElementById('violationDate').value = new Date().toISOString().split('T')[0];
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
        successMessage.classList.remove('show');
    }, 5000);
    
    // Update admin section if visible
    if (document.getElementById('adminSection').style.display !== 'none') {
        loadReportsTable();
    }
}

// Show admin section
function showAdminSection() {
    const adminSection = document.getElementById('adminSection');
    adminSection.style.display = 'block';
    loadReportsTable();
}

// Load reports table
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
                <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetails(${report.id})">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editReportStatus(${report.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id})">
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
                <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetails(${report.id})">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editReportStatus(${report.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id})">
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

// Edit report status
function editReportStatus(id) {
    const report = violationReports.find(r => r.id === id);
    if (report) {
        const newStatus = prompt('Update status (Pending/Under Investigation/Resolved):', report.status);
        if (newStatus && ['Pending', 'Under Investigation', 'Resolved'].includes(newStatus)) {
            report.status = newStatus;
            saveReports();
            loadReportsTable();
            alert('Status updated successfully!');
        }
    }
}

// Delete report
function deleteReport(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        violationReports = violationReports.filter(r => r.id !== id);
        saveReports();
        loadReportsTable();
        alert('Report deleted successfully!');
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