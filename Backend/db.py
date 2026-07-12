import os
import sqlite3

# Define database path relative to this file
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enables access by column name
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Employees Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        employee_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        joining_date TEXT NOT NULL,
        salary REAL NOT NULL
    )
    """)

    # 2. Departments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        department_id INTEGER PRIMARY KEY,
        department_name TEXT NOT NULL,
        manager_name TEXT NOT NULL,
        total_employees INTEGER DEFAULT 0,
        location TEXT NOT NULL
    )
    """)

    # 3. Attendance Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        attendance_date TEXT NOT NULL,
        check_in TEXT NOT NULL,
        check_out TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Leave'))
    )
    """)

    # 4. Payroll Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payroll (
        payroll_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        basic_salary REAL NOT NULL,
        bonus REAL DEFAULT 0,
        deductions REAL DEFAULT 0,
        net_salary REAL NOT NULL,
        payment_month TEXT NOT NULL
    )
    """)

    # 5. Payslips Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payslips (
        payslip_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT NOT NULL CHECK(payment_method IN ('Bank Transfer', 'UPI', 'Cash')),
        payment_status TEXT NOT NULL CHECK(payment_status IN ('Paid', 'Pending')),
        remarks TEXT
    )
    """)

    conn.commit()

    # Pre-populate sample testing data if tables are empty
    # Employee sample
    cursor.execute("SELECT COUNT(*) FROM employees")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO employees (employee_id, full_name, email, phone, department, designation, joining_date, salary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (101, "Rahul Sharma", "rahul@gmail.com", "9876543210", "Software Development", "Python Developer", "2026-01-15", 60000.0))

    # Department sample
    cursor.execute("SELECT COUNT(*) FROM departments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO departments (department_id, department_name, manager_name, total_employees, location)
        VALUES (?, ?, ?, ?, ?)
        """, (201, "Software Development", "Anjali Verma", 15, "Bangalore"))

    # Attendance sample
    cursor.execute("SELECT COUNT(*) FROM attendance")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO attendance (attendance_id, employee_name, attendance_date, check_in, check_out, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (301, "Rahul Sharma", "2026-07-15", "09:00", "18:00", "Present"))

    # Payroll sample
    cursor.execute("SELECT COUNT(*) FROM payroll")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO payroll (payroll_id, employee_name, basic_salary, bonus, deductions, net_salary, payment_month)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (401, "Rahul Sharma", 60000.0, 5000.0, 2000.0, 63000.0, "July 2026"))

    # Payslip sample
    cursor.execute("SELECT COUNT(*) FROM payslips")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO payslips (payslip_id, employee_name, payment_date, payment_method, payment_status, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (501, "Rahul Sharma", "2026-07-31", "Bank Transfer", "Paid", "Salary credited successfully"))

    conn.commit()
    conn.close()

# Initialize on import
init_db()

# --- HELPER FUNCTIONS ---

def dict_from_row(row):
    return dict(row) if row else None

# --- EMPLOYEE CRUD ---
def db_add_employee(data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO employees (employee_id, full_name, email, phone, department, designation, joining_date, salary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('employee_id'),
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('department'),
        data.get('designation'),
        data.get('joining_date'),
        data.get('salary')
    ))
    conn.commit()
    new_id = data.get('employee_id')
    conn.close()
    return new_id

def db_get_employees():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees")
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def db_get_employee(emp_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees WHERE employee_id = ?", (emp_id,))
    row = cursor.fetchone()
    conn.close()
    return dict_from_row(row)

def db_update_employee(emp_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE employees
    SET full_name = ?, email = ?, phone = ?, department = ?, designation = ?, joining_date = ?, salary = ?
    WHERE employee_id = ?
    """, (
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('department'),
        data.get('designation'),
        data.get('joining_date'),
        data.get('salary'),
        emp_id
    ))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0

def db_delete_employee(emp_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM employees WHERE employee_id = ?", (emp_id,))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0


# --- DEPARTMENT CRUD ---
def db_add_department(data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO departments (department_id, department_name, manager_name, total_employees, location)
    VALUES (?, ?, ?, ?, ?)
    """, (
        data.get('department_id'),
        data.get('department_name'),
        data.get('manager_name'),
        data.get('total_employees', 0),
        data.get('location')
    ))
    conn.commit()
    new_id = data.get('department_id')
    conn.close()
    return new_id

def db_get_departments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM departments")
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def db_get_department(dept_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM departments WHERE department_id = ?", (dept_id,))
    row = cursor.fetchone()
    conn.close()
    return dict_from_row(row)

def db_update_department(dept_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE departments
    SET department_name = ?, manager_name = ?, total_employees = ?, location = ?
    WHERE department_id = ?
    """, (
        data.get('department_name'),
        data.get('manager_name'),
        data.get('total_employees'),
        data.get('location'),
        dept_id
    ))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0

def db_delete_department(dept_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM departments WHERE department_id = ?", (dept_id,))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0


# --- ATTENDANCE CRUD ---
def db_add_attendance(data):
    conn = get_connection()
    cursor = conn.cursor()
    if 'attendance_id' in data and data['attendance_id'] is not None:
        cursor.execute("""
        INSERT INTO attendance (attendance_id, employee_name, attendance_date, check_in, check_out, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get('attendance_id'),
            data.get('employee_name'),
            data.get('attendance_date'),
            data.get('check_in'),
            data.get('check_out'),
            data.get('status')
        ))
        new_id = data.get('attendance_id')
    else:
        cursor.execute("""
        INSERT INTO attendance (employee_name, attendance_date, check_in, check_out, status)
        VALUES (?, ?, ?, ?, ?)
        """, (
            data.get('employee_name'),
            data.get('attendance_date'),
            data.get('check_in'),
            data.get('check_out'),
            data.get('status')
        ))
        new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def db_get_attendances():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendance")
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def db_get_attendance(att_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendance WHERE attendance_id = ?", (att_id,))
    row = cursor.fetchone()
    conn.close()
    return dict_from_row(row)

def db_update_attendance(att_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE attendance
    SET employee_name = ?, attendance_date = ?, check_in = ?, check_out = ?, status = ?
    WHERE attendance_id = ?
    """, (
        data.get('employee_name'),
        data.get('attendance_date'),
        data.get('check_in'),
        data.get('check_out'),
        data.get('status'),
        att_id
    ))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0

def db_delete_attendance(att_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM attendance WHERE attendance_id = ?", (att_id,))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0


# --- PAYROLL CRUD ---
def db_add_payroll(data):
    conn = get_connection()
    cursor = conn.cursor()
    basic = float(data.get('basic_salary', 0))
    bonus = float(data.get('bonus', 0))
    deductions = float(data.get('deductions', 0))
    net = basic + bonus - deductions
    
    if 'payroll_id' in data and data['payroll_id'] is not None:
        cursor.execute("""
        INSERT INTO payroll (payroll_id, employee_name, basic_salary, bonus, deductions, net_salary, payment_month)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('payroll_id'),
            data.get('employee_name'),
            basic,
            bonus,
            deductions,
            net,
            data.get('payment_month')
        ))
        new_id = data.get('payroll_id')
    else:
        cursor.execute("""
        INSERT INTO payroll (employee_name, basic_salary, bonus, deductions, net_salary, payment_month)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get('employee_name'),
            basic,
            bonus,
            deductions,
            net,
            data.get('payment_month')
        ))
        new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def db_get_payrolls():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payroll")
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def db_get_payroll_item(pr_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payroll WHERE payroll_id = ?", (pr_id,))
    row = cursor.fetchone()
    conn.close()
    return dict_from_row(row)

def db_update_payroll(pr_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    basic = float(data.get('basic_salary', 0))
    bonus = float(data.get('bonus', 0))
    deductions = float(data.get('deductions', 0))
    net = basic + bonus - deductions
    
    cursor.execute("""
    UPDATE payroll
    SET employee_name = ?, basic_salary = ?, bonus = ?, deductions = ?, net_salary = ?, payment_month = ?
    WHERE payroll_id = ?
    """, (
        data.get('employee_name'),
        basic,
        bonus,
        deductions,
        net,
        data.get('payment_month'),
        pr_id
    ))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0

def db_delete_payroll(pr_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM payroll WHERE payroll_id = ?", (pr_id,))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0


# --- SALARY SLIP CRUD ---
def db_add_payslip(data):
    conn = get_connection()
    cursor = conn.cursor()
    if 'payslip_id' in data and data['payslip_id'] is not None:
        cursor.execute("""
        INSERT INTO payslips (payslip_id, employee_name, payment_date, payment_method, payment_status, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get('payslip_id'),
            data.get('employee_name'),
            data.get('payment_date'),
            data.get('payment_method'),
            data.get('payment_status'),
            data.get('remarks')
        ))
        new_id = data.get('payslip_id')
    else:
        cursor.execute("""
        INSERT INTO payslips (employee_name, payment_date, payment_method, payment_status, remarks)
        VALUES (?, ?, ?, ?, ?)
        """, (
            data.get('employee_name'),
            data.get('payment_date'),
            data.get('payment_method'),
            data.get('payment_status'),
            data.get('remarks')
        ))
        new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def db_get_payslips():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payslips")
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def db_get_payslip_item(ps_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payslips WHERE payslip_id = ?", (ps_id,))
    row = cursor.fetchone()
    conn.close()
    return dict_from_row(row)

def db_update_payslip(ps_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE payslips
    SET employee_name = ?, payment_date = ?, payment_method = ?, payment_status = ?, remarks = ?
    WHERE payslip_id = ?
    """, (
        data.get('employee_name'),
        data.get('payment_date'),
        data.get('payment_method'),
        data.get('payment_status'),
        data.get('remarks'),
        ps_id
    ))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0

def db_delete_payslip(ps_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM payslips WHERE payslip_id = ?", (ps_id,))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0
