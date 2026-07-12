# Employee Management & Payroll System

A premium, modern enterprise resource management solution featuring a robust **Django REST API** backend and a custom **Glassmorphism-styled** frontend.

---

## 🚀 Features

- **Employee Profiles**: Register, update, and manage employee records. Includes an interactive portal allowing individual workers to log in and review only their specific metrics.
- **Department Structures**: Audit company subdivisions, location telemetry, and personnel quota configurations.
- **Schedule Tracker**: Record daily check-ins, check-outs, and presence statuses (Present, Absent, Leave).
- **Payroll Pipeline**: Real-time salary processor adjusting for bonuses and tax/leave deductions automatically.
- **Printable Payslips**: Generate business-grade payslips and launch direct browser PDF print/download channels.
- **Telemetry Dashboard**: High-level visual statistics representing employee totals, department counts, attendance rates, and monthly budget costs.

---

## 🛠️ Technology Stack

- **Backend**: Django (Function-Based Views, Custom CORS Middleware)
- **Database**: SQLite (SQL query pipeline implemented in `db.py`)
- **Frontend**: HTML5, CSS3 (Vanilla Custom Properties & Glassmorphic variables), JavaScript (ES6 Fetch API)

---

## 📁 Repository Directory Structure

```
EmployeePayrollSystem/
│
├── Backend/
│   ├── db.py            # SQL queries & SQLite connection setup
│   ├── views.py         # 20 REST API views
│   ├── urls.py          # API route bindings
│   ├── settings.py      # Core Django settings & custom CORS middleware
│   ├── manage.py        # Django CLI entry point
│   ├── wsgi.py          # WSGI configuration
│   └── test_crud.py     # Automated backend validation script
│
├── Frontend/
│   ├── index.html       # Landing page / Mock login
│   ├── dashboard.html   # Main metrics center
│   ├── employees.html   # Employee directory
│   ├── departments.html # Department manager
│   ├── attendance.html  # Daily scheduling logs
│   ├── payroll.html     # Salary pipeline
│   ├── payslips.html    # Invoice generation & slip layouts
│   ├── style.css        # Glassmorphic style sheet and print directives
│   └── script.js        # API bindings & front-end UI controllers
│
└── .gitignore           # Exclusions for Python caches & logs
```

---

## 🛢️ Database Schema & API Routes

### 1. Employees
- `employee_id` (Integer, Primary Key)
- `full_name`, `email` (Unique), `phone`, `department`, `designation`, `joining_date`, `salary`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/employees/add/` | Register employee |
| **GET** | `/employees/` | Retrieve all |
| **PUT** | `/employees/update/<id>/` | Edit employee profile |
| **DELETE**| `/employees/delete/<id>/` | Delete record |

### 2. Departments
- `department_id` (Integer, Primary Key)
- `department_name`, `manager_name`, `total_employees`, `location`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/departments/add/` | Create department |
| **GET** | `/departments/` | Retrieve all |
| **PUT** | `/departments/update/<id>/` | Edit department details |
| **DELETE**| `/departments/delete/<id>/` | Delete record |

### 3. Attendance
- `attendance_id` (Integer, Primary Key, Auto-increment)
- `employee_name`, `attendance_date`, `check_in`, `check_out`, `status`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/attendance/add/` | Log daily check-in |
| **GET** | `/attendance/` | Retrieve logs |
| **PUT** | `/attendance/update/<id>/` | Edit schedule record |
| **DELETE**| `/attendance/delete/<id>/` | Delete log |

### 4. Payroll
- `payroll_id` (Integer, Primary Key, Auto-increment)
- `employee_name`, `basic_salary`, `bonus`, `deductions`, `net_salary`, `payment_month`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/payroll/add/` | Process monthly payout |
| **GET** | `/payroll/` | Retrieve calculations |
| **PUT** | `/payroll/update/<id>/` | Edit payout values |
| **DELETE**| `/payroll/delete/<id>/` | Delete log |

### 5. Salary Slips (Payslips)
- `payslip_id` (Integer, Primary Key, Auto-increment)
- `employee_name`, `payment_date`, `payment_method`, `payment_status`, `remarks`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/payslips/add/` | Generate salary receipt |
| **GET** | `/payslips/` | Retrieve receipts |
| **PUT** | `/payslips/update/<id>/` | Edit receipt meta |
| **DELETE**| `/payslips/delete/<id>/` | Delete log |

---

## 🏃 Setup & Local Execution

### 1. Launch the Backend
Make sure Django is installed. In your terminal, navigate to the `Backend` directory and start the development server:
```bash
cd Backend
python manage.py runserver 127.0.0.1:8000
```
This automatically initializes the database `db.sqlite3` with preloaded test data (Rahul Sharma).

### 2. Launch the Frontend
Navigate to the `Frontend` directory and start a web server:
```bash
cd Frontend
python -m http.server 5000
```
Then, open your browser and navigate to **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)**.

---

## 🧪 Validation & Testing

To test all 20 API endpoints automatically, execute the test script:
```bash
python Backend/test_crud.py
```
This will perform full CRUD verification against the SQLite database and log response diagnostics.
