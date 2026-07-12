import urllib.request
import urllib.parse
import json

API_BASE = "http://127.0.0.1:8000"

def make_request(url, method, data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.data = json_data
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            body = response.read().decode('utf-8')
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, json.loads(body) if body else {}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("--- STARTING CRUD API VALIDATION TESTS ---")

    # 1. EMPLOYEE CRUD
    print("\n[Employee CRUD]")
    # POST
    payload = {
        "employee_id": 102,
        "full_name": "Amit Patel",
        "email": "amit@company.com",
        "phone": "9876543211",
        "department": "Finance",
        "designation": "Accountant",
        "joining_date": "2026-02-01",
        "salary": 50000.0
    }
    status, res = make_request(f"{API_BASE}/employees/add/", "POST", payload)
    print(f"POST /employees/add/ -> Status: {status}, Response: {res}")
    assert status == 201, "Failed POST Employee"

    # GET List
    status, res = make_request(f"{API_BASE}/employees/", "GET")
    print(f"GET /employees/ -> Status: {status}, Count: {len(res)}")
    assert status == 200, "Failed GET Employees"

    # PUT
    update_payload = {"salary": 55000.0}
    status, res = make_request(f"{API_BASE}/employees/update/102/", "PUT", update_payload)
    print(f"PUT /employees/update/102/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed PUT Employee"

    # DELETE
    status, res = make_request(f"{API_BASE}/employees/delete/102/", "DELETE")
    print(f"DELETE /employees/delete/102/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed DELETE Employee"


    # 2. DEPARTMENT CRUD
    print("\n[Department CRUD]")
    payload = {
        "department_id": 202,
        "department_name": "Finance",
        "manager_name": "Suresh Kumar",
        "total_employees": 5,
        "location": "Mumbai"
    }
    status, res = make_request(f"{API_BASE}/departments/add/", "POST", payload)
    print(f"POST /departments/add/ -> Status: {status}, Response: {res}")
    assert status == 201, "Failed POST Department"

    status, res = make_request(f"{API_BASE}/departments/", "GET")
    print(f"GET /departments/ -> Status: {status}, Count: {len(res)}")
    assert status == 200, "Failed GET Departments"

    update_payload = {"location": "Pune"}
    status, res = make_request(f"{API_BASE}/departments/update/202/", "PUT", update_payload)
    print(f"PUT /departments/update/202/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed PUT Department"

    status, res = make_request(f"{API_BASE}/departments/delete/202/", "DELETE")
    print(f"DELETE /departments/delete/202/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed DELETE Department"


    # 3. ATTENDANCE CRUD
    print("\n[Attendance CRUD]")
    payload = {
        "employee_name": "Rahul Sharma",
        "attendance_date": "2026-07-16",
        "check_in": "09:05",
        "check_out": "18:05",
        "status": "Present"
    }
    status, res = make_request(f"{API_BASE}/attendance/add/", "POST", payload)
    print(f"POST /attendance/add/ -> Status: {status}, Response: {res}")
    assert status == 201, "Failed POST Attendance"
    att_id = res.get("attendance_id")

    status, res = make_request(f"{API_BASE}/attendance/", "GET")
    print(f"GET /attendance/ -> Status: {status}, Count: {len(res)}")
    assert status == 200, "Failed GET Attendance"

    update_payload = {"status": "Leave"}
    status, res = make_request(f"{API_BASE}/attendance/update/{att_id}/", "PUT", update_payload)
    print(f"PUT /attendance/update/{att_id}/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed PUT Attendance"

    status, res = make_request(f"{API_BASE}/attendance/delete/{att_id}/", "DELETE")
    print(f"DELETE /attendance/delete/{att_id}/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed DELETE Attendance"


    # 4. PAYROLL CRUD
    print("\n[Payroll CRUD]")
    payload = {
        "employee_name": "Rahul Sharma",
        "basic_salary": 60000.0,
        "bonus": 10000.0,
        "deductions": 3000.0,
        "payment_month": "August 2026"
    }
    status, res = make_request(f"{API_BASE}/payroll/add/", "POST", payload)
    print(f"POST /payroll/add/ -> Status: {status}, Response: {res}")
    assert status == 201, "Failed POST Payroll"
    pr_id = res.get("payroll_id")

    status, res = make_request(f"{API_BASE}/payroll/", "GET")
    print(f"GET /payroll/ -> Status: {status}, Count: {len(res)}")
    assert status == 200, "Failed GET Payroll"

    update_payload = {"bonus": 12000.0}
    status, res = make_request(f"{API_BASE}/payroll/update/{pr_id}/", "PUT", update_payload)
    print(f"PUT /payroll/update/{pr_id}/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed PUT Payroll"

    status, res = make_request(f"{API_BASE}/payroll/delete/{pr_id}/", "DELETE")
    print(f"DELETE /payroll/delete/{pr_id}/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed DELETE Payroll"


    # 5. PAYSLIP CRUD
    print("\n[Payslip CRUD]")
    payload = {
        "employee_name": "Rahul Sharma",
        "payment_date": "2026-08-31",
        "payment_method": "UPI",
        "payment_status": "Paid",
        "remarks": "Bonus included"
    }
    status, res = make_request(f"{API_BASE}/payslips/add/", "POST", payload)
    print(f"POST /payslips/add/ -> Status: {status}, Response: {res}")
    assert status == 201, "Failed POST Payslip"
    ps_id = res.get("payslip_id")

    status, res = make_request(f"{API_BASE}/payslips/", "GET")
    print(f"GET /payslips/ -> Status: {status}, Count: {len(res)}")
    assert status == 200, "Failed GET Payslips"

    update_payload = {"payment_status": "Paid", "remarks": "Updated successfully"}
    status, res = make_request(f"{API_BASE}/payslips/update/{ps_id}/", "PUT", update_payload)
    print(f"PUT /payslips/update/{ps_id}/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed PUT Payslip"

    status, res = make_request(f"{API_BASE}/payslips/delete/{ps_id}/", "DELETE")
    print(f"DELETE /payslips/delete/{ps_id}/ -> Status: {status}, Response: {res}")
    assert status == 200, "Failed DELETE Payslip"

    print("\n--- ALL CRUD OPERATIONS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_tests()
