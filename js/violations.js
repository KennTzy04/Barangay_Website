document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the violations page
    if (document.getElementById('violationForm')) {
        const violationForm = document.getElementById('violationForm');
        
        // Sample database for reports (in a real app, this would be server-side)
        let reportsDB = JSON.parse(localStorage.getItem('violationReports')) || [];
        let currentReportId = reportsDB.length > 0 ? Math.max(...reportsDB.map(r => r.id)) + 1 : 1;
        
        // Form submission handler
        violationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const report = {
                id: currentReportId++,
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
                dateReported: new Date().toISOString().split('T')[0],
                adminNotes: ''
            };
            
            // Handle file upload (simplified - in real app would upload to server)
            const fileInput = document.getElementById('violationEvidence');
            if (fileInput.files.length > 0) {
                report.evidence = fileInput.files[0].name;
            }
            
            // Add to database
            reportsDB.push(report);
            localStorage.setItem('violationReports', JSON.stringify(reportsDB));
            
            // Show success message
            alert('Your report has been submitted successfully! Reference ID: ' + report.id);
            
            // Reset form
            violationForm.reset();
        });
        
        // Check for admin view (simplified - in real app would have proper authentication)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) {
            document.getElementById('adminSection').style.display = 'block';
            populateReportsTable();
        }
        
        // Populate reports table for admin view
        function populateReportsTable(filterStatus = 'all') {
            const tbody = document.getElementById('reportsTableBody');
            tbody.innerHTML = '';
            
            const filteredReports = filterStatus === 'all' 
                ? reportsDB 
                : reportsDB.filter(r => r.status === filterStatus);
            
            filteredReports.forEach(report => {
                const row = document.createElement('tr');
                
                // Format date for display
                const reportedDate = new Date(report.dateReported);
                const formattedDate = reportedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Status badge
                let statusClass;
                switch(report.status) {
                    case 'Pending': statusClass = 'bg-warning'; break;
                    case 'Under Investigation': statusClass = 'bg-info'; break;
                    case 'Resolved': statusClass = 'bg-success'; break;
                    default: statusClass = 'bg-secondary';
                }
                
                row.innerHTML = `
                    <td>${report.id}</td>
                    <td>${formattedDate}</td>
                    <td>${report.violationType}</td>
                    <td>${report.violationLocation}</td>
                    <td>${report.reporterName}</td>
                    <td><span class="badge ${statusClass}">${report.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-report" data-id="${report.id}">View</button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-report').forEach(btn => {
                btn.addEventListener('click', function() {
                    const reportId = parseInt(this.getAttribute('data-id'));
                    viewReportDetails(reportId);
                });
            });
        }
        
        // View report details in modal
        function viewReportDetails(reportId) {
            const report = reportsDB.find(r => r.id === reportId);
            if (!report) return;
            
            const modalContent = document.getElementById('reportDetailsContent');
            
            // Format date and time
            const incidentDate = new Date(report.violationDate);
            const formattedIncidentDate = incidentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            modalContent.innerHTML = `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Reporter Information</h6>
                        <p><strong>Name:</strong> ${report.reporterName}<br>
                        <strong>Contact:</strong> ${report.reporterContact}<br>
                        <strong>Email:</strong> ${report.reporterEmail || 'N/A'}<br>
                        <strong>Address:</strong> ${report.reporterAddress}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Violation Details</h6>
                        <p><strong>Type:</strong> ${report.violationType}<br>
                        <strong>Date:</strong> ${formattedIncidentDate}<br>
                        <strong>Time:</strong> ${report.violationTime}<br>
                        <strong>Location:</strong> ${report.violationLocation}</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <h6>Description</h6>
                    <p>${report.violationDescription}</p>
                </div>
                
                ${report.evidence ? `
                <div class="mb-3">
                    <h6>Evidence</h6>
                    <p>${report.evidence}</p>
                </div>
                ` : ''}
                
                <div class="mb-3">
                    <h6>Status</h6>
                    <select class="form-select" id="reportStatus">
                        <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Under Investigation" ${report.status === 'Under Investigation' ? 'selected' : ''}>Under Investigation</option>
                        <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <h6>Admin Notes</h6>
                    <textarea class="form-control" id="adminNotes" rows="3">${report.adminNotes || ''}</textarea>
                </div>
            `;
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('reportDetailsModal'));
            modal.show();
            
            // Save button handler
            document.getElementById('saveStatusBtn').onclick = function() {
                report.status = document.getElementById('reportStatus').value;
                report.adminNotes = document.getElementById('adminNotes').value;
                
                // Update in database
                localStorage.setItem('violationReports', JSON.stringify(reportsDB));
                
                // Refresh table
                const currentFilter = document.querySelector('.filter-option.active')?.getAttribute('data-status') || 'all';
                populateReportsTable(currentFilter);
                
                // Close modal
                modal.hide();
            };
        }
        
        // Filter reports
        document.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active state
                document.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update dropdown text
                document.getElementById('filterDropdown').textContent = `Filter by Status: ${this.textContent}`;
                
                // Filter reports
                const status = this.getAttribute('data-status');
                populateReportsTable(status);
            });
        });
    }
});