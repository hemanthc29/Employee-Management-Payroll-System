const API_BASE = "http://127.0.0.1:8000";

// Global toast alert helper
function showAlert(message, type = 'success') {
    // Check if alert container exists, otherwise create it
    let container = document.getElementById('alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'alert-container';
        container.style.position = 'fixed';
        container.style.top = '24px';
        container.style.right = '24px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }

    const alertBox = document.createElement('div');
    alertBox.style.padding = '12px 24px';
    alertBox.style.borderRadius = '8px';
    alertBox.style.color = '#fff';
    alertBox.style.fontWeight = '600';
    alertBox.style.fontSize = '0.95rem';
    alertBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    alertBox.style.display = 'flex';
    alertBox.style.alignItems = 'center';
    alertBox.style.gap = '8px';
    alertBox.style.transition = 'all 0.3s ease';
    alertBox.style.opacity = '0';
    alertBox.style.transform = 'translateY(-20px)';
    alertBox.style.backdropFilter = 'blur(10px)';

    if (type === 'success') {
        alertBox.style.background = 'rgba(16, 185, 129, 0.9)';
        alertBox.style.border = '1px solid rgba(16, 185, 129, 0.4)';
        alertBox.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else if (type === 'danger') {
        alertBox.style.background = 'rgba(239, 68, 68, 0.9)';
        alertBox.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        alertBox.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    } else {
        alertBox.style.background = 'rgba(245, 158, 11, 0.9)';
        alertBox.style.border = '1px solid rgba(245, 158, 11, 0.4)';
        alertBox.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    }

    container.appendChild(alertBox);

    // Fade in
    setTimeout(() => {
        alertBox.style.opacity = '1';
        alertBox.style.transform = 'translateY(0)';
    }, 10);

    // Auto remove
    setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            alertBox.remove();
        }, 300);
    }, 4000);
}

// Modal Toggle Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// User Session Helpers (Mock Login)
function checkAuth() {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    
    const sessionInfo = document.getElementById('session-info');
    if (sessionInfo) {
        if (role) {
            sessionInfo.innerHTML = `
                <span style="font-size: 0.85rem; color: var(--text-muted);">
                    Logged in: <strong>${name || role}</strong> (${role.toUpperCase()})
                </span>
                <button onclick="logout()" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                    Logout
                </button>
            `;
        } else {
            sessionInfo.innerHTML = `
                <a href="index.html" class="btn btn-primary btn-sm">Login</a>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_emp_id');
    showAlert("Logged out successfully");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

// Initialize Active Nav state
function highlightNav() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Global Load Listener
document.addEventListener("DOMContentLoaded", () => {
    highlightNav();
    checkAuth();
    
    // Page-specific initializations
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    if (page === 'dashboard.html') {
        loadDashboardStats();
    } else if (page === 'employees.html') {
        loadEmployees();
    } else if (page === 'departments.html') {
        loadDepartments();
    } else if (page === 'attendance.html') {
        loadAttendance();
        populateEmployeeDropdown('attendance-emp-select');
    } else if (page === 'payroll.html') {
        loadPayroll();
        populateEmployeeDropdown('payroll-emp-select');
        setupPayrollCalculations();
    } else if (page === 'payslips.html') {
        loadPayslips();
        populateEmployeeDropdown('payslip-emp-select');
    }
});


// Helper: Populate employee list dropdowns
async function populateEmployeeDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        const res = await fetch(`${API_BASE}/employees/`);
        if (res.ok) {
            const employees = await res.json();
            // Clear existing except first
            select.innerHTML = '<option value="">Select Employee</option>';
            employees.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.full_name;
                opt.textContent = `${emp.full_name} (${emp.department})`;
                // Store salary as custom data attribute for payroll usage
                opt.dataset.salary = emp.salary;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Error populating employees dropdown", err);
    }
}


// --- MODULE 1: EMPLOYEE MANAGEMENT ---

async function loadEmployees() {
    const tableBody = document.getElementById('employee-table-body');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/employees/`);
        if (!res.ok) throw new Error("Failed to fetch employees");
        const employees = await res.json();

        // Check if employee logged in (filter view if employee role)
        const role = localStorage.getItem('user_role');
        const empName = localStorage.getItem('user_name');
        let displayList = employees;
        if (role === 'employee' && empName) {
            displayList = employees.filter(e => e.full_name.toLowerCase() === empName.toLowerCase());
        }

        tableBody.innerHTML = '';
        if (displayList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">No employee records found.</td></tr>`;
            return;
        }

        displayList.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${emp.employee_id}</strong></td>
                <td>${emp.full_name}</td>
                <td>${emp.email}</td>
                <td>${emp.phone}</td>
                <td>${emp.department}</td>
                <td>${emp.designation}</td>
                <td>${emp.joining_date}</td>
                <td>₹${parseFloat(emp.salary).toLocaleString()}</td>
                <td class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openUpdateEmployeeModal(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${role !== 'employee' ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.employee_id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

// Add Employee Submission
const addEmployeeForm = document.getElementById('add-employee-form');
if (addEmployeeForm) {
    addEmployeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addEmployeeForm);
        const data = Object.fromEntries(formData.entries());
        
        // Convert types
        data.employee_id = parseInt(data.employee_id);
        data.salary = parseFloat(data.salary);

        try {
            const res = await fetch(`${API_BASE}/employees/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                showAlert("Employee registered successfully!");
                addEmployeeForm.reset();
                loadEmployees();
            } else {
                showAlert(result.error || "Failed to add employee", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Open Update Modal and fill values
function openUpdateEmployeeModal(emp) {
    document.getElementById('edit-emp-id').value = emp.employee_id;
    document.getElementById('edit-full-name').value = emp.full_name;
    document.getElementById('edit-email').value = emp.email;
    document.getElementById('edit-phone').value = emp.phone;
    document.getElementById('edit-department').value = emp.department;
    document.getElementById('edit-designation').value = emp.designation;
    document.getElementById('edit-joining-date').value = emp.joining_date;
    document.getElementById('edit-salary').value = emp.salary;
    openModal('edit-employee-modal');
}

// Submit Update Employee
const updateEmployeeForm = document.getElementById('edit-employee-form');
if (updateEmployeeForm) {
    updateEmployeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const empId = document.getElementById('edit-emp-id').value;
        const formData = new FormData(updateEmployeeForm);
        const data = Object.fromEntries(formData.entries());
        data.salary = parseFloat(data.salary);

        try {
            const res = await fetch(`${API_BASE}/employees/update/${empId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                showAlert("Employee details updated successfully!");
                closeModal('edit-employee-modal');
                loadEmployees();
            } else {
                showAlert(result.error || "Update failed", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Delete Employee
async function deleteEmployee(id) {
    if (!confirm(`Are you sure you want to delete employee ID ${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/employees/delete/${id}/`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showAlert("Employee deleted successfully");
            loadEmployees();
        } else {
            showAlert(result.error || "Delete failed", 'danger');
        }
    } catch (err) {
        showAlert("Connection error to Backend API", 'danger');
    }
}


// --- MODULE 2: DEPARTMENT MANAGEMENT ---

async function loadDepartments() {
    const tableBody = document.getElementById('department-table-body');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/departments/`);
        if (!res.ok) throw new Error("Failed to fetch departments");
        const depts = await res.json();

        tableBody.innerHTML = '';
        if (depts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No department records found.</td></tr>`;
            return;
        }

        const role = localStorage.getItem('user_role');

        depts.forEach(dept => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${dept.department_id}</strong></td>
                <td>${dept.department_name}</td>
                <td>${dept.manager_name}</td>
                <td><span class="badge" style="background:rgba(99,102,241,0.15); color:var(--primary); font-weight:700;">${dept.total_employees}</span></td>
                <td>${dept.location}</td>
                <td class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openUpdateDeptModal(${JSON.stringify(dept).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${role !== 'employee' ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteDepartment(${dept.department_id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

// Add Department Form
const addDeptForm = document.getElementById('add-dept-form');
if (addDeptForm) {
    addDeptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addDeptForm);
        const data = Object.fromEntries(formData.entries());
        data.department_id = parseInt(data.department_id);
        data.total_employees = parseInt(data.total_employees || 0);

        try {
            const res = await fetch(`${API_BASE}/departments/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Department added successfully!");
                addDeptForm.reset();
                loadDepartments();
            } else {
                showAlert(result.error || "Failed to add department", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Open Update Modal and fill values
function openUpdateDeptModal(dept) {
    document.getElementById('edit-dept-id').value = dept.department_id;
    document.getElementById('edit-dept-name').value = dept.department_name;
    document.getElementById('edit-manager-name').value = dept.manager_name;
    document.getElementById('edit-total-employees').value = dept.total_employees;
    document.getElementById('edit-location').value = dept.location;
    openModal('edit-dept-modal');
}

// Submit Update Department
const updateDeptForm = document.getElementById('edit-dept-form');
if (updateDeptForm) {
    updateDeptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const deptId = document.getElementById('edit-dept-id').value;
        const formData = new FormData(updateDeptForm);
        const data = Object.fromEntries(formData.entries());
        data.total_employees = parseInt(data.total_employees || 0);

        try {
            const res = await fetch(`${API_BASE}/departments/update/${deptId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Department details updated successfully!");
                closeModal('edit-dept-modal');
                loadDepartments();
            } else {
                showAlert(result.error || "Update failed", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Delete Department
async function deleteDepartment(id) {
    if (!confirm(`Are you sure you want to delete department ID ${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/departments/delete/${id}/`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showAlert("Department deleted successfully");
            loadDepartments();
        } else {
            showAlert(result.error || "Delete failed", 'danger');
        }
    } catch (err) {
        showAlert("Connection error to Backend API", 'danger');
    }
}


// --- MODULE 3: ATTENDANCE MANAGEMENT ---

async function loadAttendance() {
    const tableBody = document.getElementById('attendance-table-body');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/attendance/`);
        if (!res.ok) throw new Error("Failed to fetch attendance history");
        const history = await res.json();

        // Check user session
        const role = localStorage.getItem('user_role');
        const empName = localStorage.getItem('user_name');
        let displayList = history;
        if (role === 'employee' && empName) {
            displayList = history.filter(h => h.employee_name.toLowerCase() === empName.toLowerCase());
        }

        tableBody.innerHTML = '';
        if (displayList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No attendance records found.</td></tr>`;
            return;
        }

        displayList.forEach(rec => {
            const badgeClass = `badge-${rec.status.toLowerCase()}`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${rec.attendance_id}</strong></td>
                <td>${rec.employee_name}</td>
                <td>${rec.attendance_date}</td>
                <td>${rec.check_in}</td>
                <td>${rec.check_out}</td>
                <td><span class="badge ${badgeClass}">${rec.status}</span></td>
                <td class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openUpdateAttendanceModal(${JSON.stringify(rec).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${role !== 'employee' ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteAttendance(${rec.attendance_id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

// Add Attendance Form
const addAttendanceForm = document.getElementById('add-attendance-form');
if (addAttendanceForm) {
    addAttendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addAttendanceForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`${API_BASE}/attendance/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Attendance recorded successfully!");
                addAttendanceForm.reset();
                loadAttendance();
            } else {
                showAlert(result.error || "Failed to mark attendance", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Open Update Modal and fill values
function openUpdateAttendanceModal(rec) {
    document.getElementById('edit-att-id').value = rec.attendance_id;
    document.getElementById('edit-att-name').value = rec.employee_name;
    document.getElementById('edit-att-date').value = rec.attendance_date;
    document.getElementById('edit-check-in').value = rec.check_in;
    document.getElementById('edit-check-out').value = rec.check_out;
    document.getElementById('edit-att-status').value = rec.status;
    openModal('edit-attendance-modal');
}

// Submit Update Attendance
const updateAttendanceForm = document.getElementById('edit-attendance-form');
if (updateAttendanceForm) {
    updateAttendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const attId = document.getElementById('edit-att-id').value;
        const formData = new FormData(updateAttendanceForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`${API_BASE}/attendance/update/${attId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Attendance details updated successfully!");
                closeModal('edit-attendance-modal');
                loadAttendance();
            } else {
                showAlert(result.error || "Update failed", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Delete Attendance
async function deleteAttendance(id) {
    if (!confirm(`Are you sure you want to delete attendance record #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/attendance/delete/${id}/`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showAlert("Attendance record deleted");
            loadAttendance();
        } else {
            showAlert(result.error || "Delete failed", 'danger');
        }
    } catch (err) {
        showAlert("Connection error to Backend API", 'danger');
    }
}


// --- MODULE 4: PAYROLL MANAGEMENT ---

async function loadPayroll() {
    const tableBody = document.getElementById('payroll-table-body');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/payroll/`);
        if (!res.ok) throw new Error("Failed to fetch payroll history");
        const payrolls = await res.json();

        // Check user session
        const role = localStorage.getItem('user_role');
        const empName = localStorage.getItem('user_name');
        let displayList = payrolls;
        if (role === 'employee' && empName) {
            displayList = payrolls.filter(p => p.employee_name.toLowerCase() === empName.toLowerCase());
        }

        tableBody.innerHTML = '';
        if (displayList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No payroll records found.</td></tr>`;
            return;
        }

        displayList.forEach(pr => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${pr.payroll_id}</strong></td>
                <td>${pr.employee_name}</td>
                <td>${pr.payment_month}</td>
                <td>₹${parseFloat(pr.basic_salary).toLocaleString()}</td>
                <td>₹${parseFloat(pr.bonus).toLocaleString()}</td>
                <td style="color:var(--danger)">-₹${parseFloat(pr.deductions).toLocaleString()}</td>
                <td style="color:var(--success); font-weight:700;">₹${parseFloat(pr.net_salary).toLocaleString()}</td>
                <td class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openUpdatePayrollModal(${JSON.stringify(pr).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${role !== 'employee' ? `
                    <button class="btn btn-danger btn-sm" onclick="deletePayroll(${pr.payroll_id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

// Automatic Net Salary Calculations on form inputs
function setupPayrollCalculations() {
    const calculateNet = (basicId, bonusId, deductionsId, netId) => {
        const basic = parseFloat(document.getElementById(basicId).value) || 0;
        const bonus = parseFloat(document.getElementById(bonusId).value) || 0;
        const deductions = parseFloat(document.getElementById(deductionsId).value) || 0;
        document.getElementById(netId).value = (basic + bonus - deductions).toFixed(2);
    };

    // Auto-fill basic salary when employee is selected in dropdown
    const select = document.getElementById('payroll-emp-select');
    if (select) {
        select.addEventListener('change', () => {
            const selectedOpt = select.options[select.selectedIndex];
            if (selectedOpt && selectedOpt.dataset.salary) {
                document.getElementById('payroll-basic').value = selectedOpt.dataset.salary;
                calculateNet('payroll-basic', 'payroll-bonus', 'payroll-deductions', 'payroll-net');
            }
        });
    }

    // Input listeners for Add form
    ['payroll-basic', 'payroll-bonus', 'payroll-deductions'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                calculateNet('payroll-basic', 'payroll-bonus', 'payroll-deductions', 'payroll-net');
            });
        }
    });

    // Input listeners for Edit form
    ['edit-pr-basic', 'edit-pr-bonus', 'edit-pr-deductions'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                calculateNet('edit-pr-basic', 'edit-pr-bonus', 'edit-pr-deductions', 'edit-pr-net');
            });
        }
    });
}

// Add Payroll Form
const addPayrollForm = document.getElementById('add-payroll-form');
if (addPayrollForm) {
    addPayrollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addPayrollForm);
        const data = Object.fromEntries(formData.entries());
        
        data.basic_salary = parseFloat(data.basic_salary);
        data.bonus = parseFloat(data.bonus || 0);
        data.deductions = parseFloat(data.deductions || 0);

        try {
            const res = await fetch(`${API_BASE}/payroll/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Payroll record recorded successfully!");
                addPayrollForm.reset();
                loadPayroll();
            } else {
                showAlert(result.error || "Failed to record payroll", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Open Update Modal and fill values
function openUpdatePayrollModal(pr) {
    document.getElementById('edit-pr-id').value = pr.payroll_id;
    document.getElementById('edit-pr-name').value = pr.employee_name;
    document.getElementById('edit-pr-basic').value = pr.basic_salary;
    document.getElementById('edit-pr-bonus').value = pr.bonus;
    document.getElementById('edit-pr-deductions').value = pr.deductions;
    document.getElementById('edit-pr-net').value = pr.net_salary;
    document.getElementById('edit-pr-month').value = pr.payment_month;
    openModal('edit-payroll-modal');
}

// Submit Update Payroll
const updatePayrollForm = document.getElementById('edit-payroll-form');
if (updatePayrollForm) {
    updatePayrollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prId = document.getElementById('edit-pr-id').value;
        const formData = new FormData(updatePayrollForm);
        const data = Object.fromEntries(formData.entries());

        data.basic_salary = parseFloat(data.basic_salary);
        data.bonus = parseFloat(data.bonus || 0);
        data.deductions = parseFloat(data.deductions || 0);

        try {
            const res = await fetch(`${API_BASE}/payroll/update/${prId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Payroll details updated successfully!");
                closeModal('edit-payroll-modal');
                loadPayroll();
            } else {
                showAlert(result.error || "Update failed", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Delete Payroll
async function deletePayroll(id) {
    if (!confirm(`Are you sure you want to delete payroll record #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/payroll/delete/${id}/`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showAlert("Payroll record deleted");
            loadPayroll();
        } else {
            showAlert(result.error || "Delete failed", 'danger');
        }
    } catch (err) {
        showAlert("Connection error to Backend API", 'danger');
    }
}


// --- MODULE 5: SALARY SLIP (PAYSLIP) MANAGEMENT ---

async function loadPayslips() {
    const tableBody = document.getElementById('payslips-table-body');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/payslips/`);
        if (!res.ok) throw new Error("Failed to fetch salary slips");
        const slips = await res.json();

        // Check user session
        const role = localStorage.getItem('user_role');
        const empName = localStorage.getItem('user_name');
        let displayList = slips;
        if (role === 'employee' && empName) {
            displayList = slips.filter(s => s.employee_name.toLowerCase() === empName.toLowerCase());
        }

        tableBody.innerHTML = '';
        if (displayList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No salary slip records found.</td></tr>`;
            return;
        }

        displayList.forEach(slip => {
            const badgeClass = `badge-${slip.payment_status.toLowerCase()}`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${slip.payslip_id}</strong></td>
                <td>${slip.employee_name}</td>
                <td>${slip.payment_date}</td>
                <td>${slip.payment_method}</td>
                <td><span class="badge ${badgeClass}">${slip.payment_status}</span></td>
                <td>${slip.remarks || '-'}</td>
                <td class="actions-cell">
                    <button class="btn btn-primary btn-sm" onclick="generatePayslipSlip(${JSON.stringify(slip).replace(/"/g, '&quot;')})">
                        <i class="fas fa-file-invoice"></i> View Slip
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openUpdatePayslipModal(${JSON.stringify(slip).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${role !== 'employee' ? `
                    <button class="btn btn-danger btn-sm" onclick="deletePayslip(${slip.payslip_id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

// Add Payslip Form
const addPayslipForm = document.getElementById('add-payslip-form');
if (addPayslipForm) {
    addPayslipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addPayslipForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`${API_BASE}/payslips/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Salary slip generated!");
                addPayslipForm.reset();
                loadPayslips();
            } else {
                showAlert(result.error || "Failed to generate slip", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Open Update Modal and fill values
function openUpdatePayslipModal(slip) {
    document.getElementById('edit-ps-id').value = slip.payslip_id;
    document.getElementById('edit-ps-name').value = slip.employee_name;
    document.getElementById('edit-ps-date').value = slip.payment_date;
    document.getElementById('edit-ps-method').value = slip.payment_method;
    document.getElementById('edit-ps-status').value = slip.payment_status;
    document.getElementById('edit-ps-remarks').value = slip.remarks;
    openModal('edit-payslip-modal');
}

// Submit Update Payslip
const updatePayslipForm = document.getElementById('edit-payslip-form');
if (updatePayslipForm) {
    updatePayrollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const psId = document.getElementById('edit-ps-id').value;
        const formData = new FormData(updatePayslipForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`${API_BASE}/payslips/update/${psId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showAlert("Salary slip details updated successfully!");
                closeModal('edit-payslip-modal');
                loadPayslips();
            } else {
                showAlert(result.error || "Update failed", 'danger');
            }
        } catch (err) {
            showAlert("Connection error to Backend API", 'danger');
        }
    });
}

// Delete Payslip
async function deletePayslip(id) {
    if (!confirm(`Are you sure you want to delete payslip record #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/payslips/delete/${id}/`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showAlert("Payslip record deleted");
            loadPayslips();
        } else {
            showAlert(result.error || "Delete failed", 'danger');
        }
    } catch (err) {
        showAlert("Connection error to Backend API", 'danger');
    }
}

// Generate printable/downloadable Salary Slip Layout
async function generatePayslipSlip(slip) {
    const slipDiv = document.getElementById('printable-payslip');
    if (!slipDiv) return;

    // Fetch payroll record to match amounts and months
    let payrollRecord = null;
    let employeeRecord = null;
    try {
        // Fetch payroll
        const payrollRes = await fetch(`${API_BASE}/payroll/`);
        if (payrollRes.ok) {
            const payrolls = await payrollRes.json();
            payrollRecord = payrolls.find(p => p.employee_name.toLowerCase() === slip.employee_name.toLowerCase());
        }
        // Fetch employee details
        const empRes = await fetch(`${API_BASE}/employees/`);
        if (empRes.ok) {
            const employees = await empRes.json();
            employeeRecord = employees.find(e => e.full_name.toLowerCase() === slip.employee_name.toLowerCase());
        }
    } catch (e) {
        console.error("Error matching payslip parameters", e);
    }

    const basic = payrollRecord ? parseFloat(payrollRecord.basic_salary) : (employeeRecord ? parseFloat(employeeRecord.salary) : 0);
    const bonus = payrollRecord ? parseFloat(payrollRecord.bonus) : 0;
    const deductions = payrollRecord ? parseFloat(payrollRecord.deductions) : 0;
    const net = payrollRecord ? parseFloat(payrollRecord.net_salary) : basic;
    const month = payrollRecord ? payrollRecord.payment_month : "Current Month";
    const designation = employeeRecord ? employeeRecord.designation : "Associate";
    const department = employeeRecord ? employeeRecord.department : "General";
    const empId = employeeRecord ? employeeRecord.employee_id : "N/A";

    slipDiv.innerHTML = `
        <div class="payslip-header">
            <div class="payslip-logo">
                <i class="fas fa-space-shuttle" style="color: #6366f1; margin-right: 8px;"></i>
                Nova<span>Payroll</span>
            </div>
            <div class="payslip-title">
                <h2>SALARY SLIP</h2>
                <p style="color: #64748b; font-size: 0.9rem;">Month: ${month}</p>
            </div>
        </div>
        
        <div class="payslip-details-grid">
            <div>
                <table class="payslip-info-table">
                    <tr><td>Employee ID:</td><td>${empId}</td></tr>
                    <tr><td>Name:</td><td>${slip.employee_name}</td></tr>
                    <tr><td>Designation:</td><td>${designation}</td></tr>
                    <tr><td>Department:</td><td>${department}</td></tr>
                </table>
            </div>
            <div>
                <table class="payslip-info-table">
                    <tr><td>Slip ID:</td><td>#SLIP-${slip.payslip_id}</td></tr>
                    <tr><td>Payment Date:</td><td>${slip.payment_date}</td></tr>
                    <tr><td>Payment Method:</td><td>${slip.payment_method}</td></tr>
                    <tr><td>Payment Status:</td><td><strong style="color: ${slip.payment_status === 'Paid' ? '#10b981' : '#f59e0b'}">${slip.payment_status.toUpperCase()}</strong></td></tr>
                </table>
            </div>
        </div>
        
        <div class="payslip-breakdown">
            <div class="payslip-breakdown-row header">
                <span>Earning / Deduction Description</span>
                <span>Amount</span>
            </div>
            <div class="payslip-breakdown-row">
                <span>Basic Salary</span>
                <span>₹${basic.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="payslip-breakdown-row">
                <span>Performance Bonus</span>
                <span>₹${bonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="payslip-breakdown-row" style="color: #ef4444">
                <span>Taxes & Deductions</span>
                <span>-₹${deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="payslip-breakdown-row total">
                <span>NET TAKE-HOME SALARY</span>
                <span>₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem; font-size: 0.9rem; color: #475569;">
            <p><strong>Remarks:</strong> ${slip.remarks || 'None'}</p>
        </div>
        
        <div class="payslip-footer">
            <p>This is a computer-generated salary slip and does not require a physical signature.</p>
            <p style="margin-top: 0.5rem; font-weight: 500;">Thank you for your hard work and dedication!</p>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;" class="no-print">
            <button onclick="window.print()" class="btn btn-primary">
                <i class="fas fa-print"></i> Print Salary Slip
            </button>
            <button onclick="document.getElementById('printable-payslip').classList.remove('active')" class="btn btn-secondary">
                Close
            </button>
        </div>
    `;

    // Make slip visible and scroll to it
    slipDiv.classList.add('active');
    slipDiv.scrollIntoView({ behavior: 'smooth' });
}


// --- ADMIN DASHBOARD ANALYTICS ---

async function loadDashboardStats() {
    const totalEmpEl = document.getElementById('total-employees-count');
    const totalDeptEl = document.getElementById('total-departments-count');
    const attRateEl = document.getElementById('attendance-rate');
    const payrollCostEl = document.getElementById('total-payroll-cost');
    const paidSlipsEl = document.getElementById('paid-slips-stat');

    if (!totalEmpEl) return;

    try {
        // Fetch All Datasets concurrently
        const [empRes, deptRes, attRes, payrollRes, payslipsRes] = await Promise.all([
            fetch(`${API_BASE}/employees/`),
            fetch(`${API_BASE}/departments/`),
            fetch(`${API_BASE}/attendance/`),
            fetch(`${API_BASE}/payroll/`),
            fetch(`${API_BASE}/payslips/`)
        ]);

        const employees = empRes.ok ? await empRes.json() : [];
        const departments = deptRes.ok ? await deptRes.json() : [];
        const attendance = attRes.ok ? await attRes.json() : [];
        const payroll = payrollRes.ok ? await payrollRes.json() : [];
        const payslips = payslipsRes.ok ? await payslipsRes.json() : [];

        // 1. Total Employees
        totalEmpEl.textContent = employees.length;

        // 2. Total Departments
        totalDeptEl.textContent = departments.length;

        // 3. Attendance Rate
        if (attendance.length > 0) {
            const presents = attendance.filter(a => a.status === 'Present').length;
            const rate = (presents / attendance.length) * 100;
            attRateEl.textContent = `${rate.toFixed(1)}%`;
        } else {
            attRateEl.textContent = '0.0%';
        }

        // 4. Total Monthly Payroll Cost
        const totalCost = payroll.reduce((sum, item) => sum + parseFloat(item.net_salary || 0), 0);
        payrollCostEl.textContent = `₹${totalCost.toLocaleString('en-IN')}`;

        // 5. Salary Payments (Paid vs Pending)
        const paidCount = payslips.filter(s => s.payment_status === 'Paid').length;
        const totalSlips = payslips.length;
        paidSlipsEl.textContent = `${paidCount} / ${totalSlips} Paid`;

        // Render Recent Activity Logs
        renderDashboardDetails(employees, attendance, payroll);

    } catch (err) {
        console.error("Error loading dashboard metrics", err);
        showAlert("Failed to query dashboard statistics", "danger");
    }
}

function renderDashboardDetails(employees, attendance, payroll) {
    const listEl = document.getElementById('recent-activities-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    
    // Aggregate activities
    const activities = [];

    employees.slice(-3).forEach(e => {
        activities.push({
            type: 'employee',
            title: `New Employee Joined`,
            desc: `${e.full_name} joined as ${e.designation} (${e.department})`,
            icon: 'fa-user-plus',
            color: 'primary'
        });
    });

    attendance.slice(-3).forEach(a => {
        activities.push({
            type: 'attendance',
            title: `Attendance Logged`,
            desc: `${a.employee_name} marked ${a.status} on ${a.attendance_date}`,
            icon: 'fa-calendar-check',
            color: a.status === 'Present' ? 'success' : 'danger'
        });
    });

    payroll.slice(-3).forEach(p => {
        activities.push({
            type: 'payroll',
            title: `Salary Processed`,
            desc: `Processed Net Salary of ₹${parseFloat(p.net_salary).toLocaleString()} for ${p.employee_name}`,
            icon: 'fa-file-invoice-dollar',
            color: 'secondary'
        });
    });

    if (activities.length === 0) {
        listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No recent activities found.</p>`;
        return;
    }

    // Limit to latest 5 items
    activities.slice(-5).reverse().forEach(act => {
        const item = document.createElement('div');
        item.className = 'glass-panel';
        item.style.padding = '1rem 1.5rem';
        item.style.marginBottom = '0.75rem';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '1.25rem';
        
        item.innerHTML = `
            <div class="stat-icon ${act.color}" style="width:40px; height:40px; font-size:1rem; border-radius:8px;">
                <i class="fas ${act.icon}"></i>
            </div>
            <div>
                <h4 style="font-size:0.95rem; font-weight:600; color:var(--text-main); margin-bottom:0.15rem;">${act.title}</h4>
                <p style="font-size:0.85rem; color:var(--text-muted);">${act.desc}</p>
            </div>
        `;
        listEl.appendChild(item);
    });
}
