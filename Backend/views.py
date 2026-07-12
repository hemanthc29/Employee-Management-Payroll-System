import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Backend.db import (
    db_add_employee, db_get_employees, db_get_employee, db_update_employee, db_delete_employee,
    db_add_department, db_get_departments, db_get_department, db_update_department, db_delete_department,
    db_add_attendance, db_get_attendances, db_get_attendance, db_update_attendance, db_delete_attendance,
    db_add_payroll, db_get_payrolls, db_get_payroll_item, db_update_payroll, db_delete_payroll,
    db_add_payslip, db_get_payslips, db_get_payslip_item, db_update_payslip, db_delete_payslip
)

def parse_json(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return None

# --- EMPLOYEE VIEWS ---

@csrf_exempt
@require_http_methods(["POST"])
def add_employee_view(request):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    # Required fields validation
    required = ['employee_id', 'full_name', 'email', 'phone', 'department', 'designation', 'joining_date', 'salary']
    for field in required:
        if field not in data:
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
    # Check if employee_id already exists
    existing = db_get_employee(data['employee_id'])
    if existing:
        return JsonResponse({"error": f"Employee with ID {data['employee_id']} already exists"}, status=400)
        
    try:
        new_id = db_add_employee(data)
        return JsonResponse({"message": "Employee registered successfully", "employee_id": new_id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_employees_view(request):
    try:
        employees = db_get_employees()
        return JsonResponse(employees, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_employee_view(request, id):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    try:
        # Check existence
        existing = db_get_employee(id)
        if not existing:
            return JsonResponse({"error": f"Employee with ID {id} not found"}, status=404)
            
        # Standardize data to retain old values if not provided
        updated_data = {
            "full_name": data.get("full_name", existing["full_name"]),
            "email": data.get("email", existing["email"]),
            "phone": data.get("phone", existing["phone"]),
            "department": data.get("department", existing["department"]),
            "designation": data.get("designation", existing["designation"]),
            "joining_date": data.get("joining_date", existing["joining_date"]),
            "salary": data.get("salary", existing["salary"])
        }
        
        db_update_employee(id, updated_data)
        return JsonResponse({"message": f"Employee {id} updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_employee_view(request, id):
    try:
        # Check existence
        existing = db_get_employee(id)
        if not existing:
            return JsonResponse({"error": f"Employee with ID {id} not found"}, status=404)
            
        db_delete_employee(id)
        return JsonResponse({"message": f"Employee {id} deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- DEPARTMENT VIEWS ---

@csrf_exempt
@require_http_methods(["POST"])
def add_department_view(request):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    required = ['department_id', 'department_name', 'manager_name', 'location']
    for field in required:
        if field not in data:
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
    existing = db_get_department(data['department_id'])
    if existing:
        return JsonResponse({"error": f"Department with ID {data['department_id']} already exists"}, status=400)
        
    try:
        new_id = db_add_department(data)
        return JsonResponse({"message": "Department added successfully", "department_id": new_id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_departments_view(request):
    try:
        departments = db_get_departments()
        return JsonResponse(departments, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_department_view(request, id):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    try:
        existing = db_get_department(id)
        if not existing:
            return JsonResponse({"error": f"Department with ID {id} not found"}, status=404)
            
        updated_data = {
            "department_name": data.get("department_name", existing["department_name"]),
            "manager_name": data.get("manager_name", existing["manager_name"]),
            "total_employees": data.get("total_employees", existing["total_employees"]),
            "location": data.get("location", existing["location"])
        }
        
        db_update_department(id, updated_data)
        return JsonResponse({"message": f"Department {id} updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_department_view(request, id):
    try:
        existing = db_get_department(id)
        if not existing:
            return JsonResponse({"error": f"Department with ID {id} not found"}, status=404)
            
        db_delete_department(id)
        return JsonResponse({"message": f"Department {id} deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- ATTENDANCE VIEWS ---

@csrf_exempt
@require_http_methods(["POST"])
def add_attendance_view(request):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    required = ['employee_name', 'attendance_date', 'check_in', 'check_out', 'status']
    for field in required:
        if field not in data:
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
    try:
        new_id = db_add_attendance(data)
        return JsonResponse({"message": "Attendance marked successfully", "attendance_id": new_id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_attendance_view(request):
    try:
        records = db_get_attendances()
        return JsonResponse(records, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_attendance_view(request, id):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    try:
        existing = db_get_attendance(id)
        if not existing:
            return JsonResponse({"error": f"Attendance record with ID {id} not found"}, status=404)
            
        updated_data = {
            "employee_name": data.get("employee_name", existing["employee_name"]),
            "attendance_date": data.get("attendance_date", existing["attendance_date"]),
            "check_in": data.get("check_in", existing["check_in"]),
            "check_out": data.get("check_out", existing["check_out"]),
            "status": data.get("status", existing["status"])
        }
        
        db_update_attendance(id, updated_data)
        return JsonResponse({"message": f"Attendance {id} updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_attendance_view(request, id):
    try:
        existing = db_get_attendance(id)
        if not existing:
            return JsonResponse({"error": f"Attendance record with ID {id} not found"}, status=404)
            
        db_delete_attendance(id)
        return JsonResponse({"message": f"Attendance {id} deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- PAYROLL VIEWS ---

@csrf_exempt
@require_http_methods(["POST"])
def add_payroll_view(request):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    required = ['employee_name', 'basic_salary', 'payment_month']
    for field in required:
        if field not in data:
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
    try:
        new_id = db_add_payroll(data)
        return JsonResponse({"message": "Payroll record added successfully", "payroll_id": new_id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_payroll_view(request):
    try:
        records = db_get_payrolls()
        return JsonResponse(records, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_payroll_view(request, id):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    try:
        existing = db_get_payroll_item(id)
        if not existing:
            return JsonResponse({"error": f"Payroll record with ID {id} not found"}, status=404)
            
        updated_data = {
            "employee_name": data.get("employee_name", existing["employee_name"]),
            "basic_salary": data.get("basic_salary", existing["basic_salary"]),
            "bonus": data.get("bonus", existing["bonus"]),
            "deductions": data.get("deductions", existing["deductions"]),
            "payment_month": data.get("payment_month", existing["payment_month"])
        }
        
        db_update_payroll(id, updated_data)
        return JsonResponse({"message": f"Payroll record {id} updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_payroll_view(request, id):
    try:
        existing = db_get_payroll_item(id)
        if not existing:
            return JsonResponse({"error": f"Payroll record with ID {id} not found"}, status=404)
            
        db_delete_payroll(id)
        return JsonResponse({"message": f"Payroll record {id} deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- SALARY SLIP (PAYSLIP) VIEWS ---

@csrf_exempt
@require_http_methods(["POST"])
def add_payslip_view(request):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    required = ['employee_name', 'payment_date', 'payment_method', 'payment_status']
    for field in required:
        if field not in data:
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
    try:
        new_id = db_add_payslip(data)
        return JsonResponse({"message": "Salary slip generated successfully", "payslip_id": new_id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_payslips_view(request):
    try:
        records = db_get_payslips()
        return JsonResponse(records, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_payslip_view(request, id):
    data = parse_json(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    try:
        existing = db_get_payslip_item(id)
        if not existing:
            return JsonResponse({"error": f"Payslip with ID {id} not found"}, status=404)
            
        updated_data = {
            "employee_name": data.get("employee_name", existing["employee_name"]),
            "payment_date": data.get("payment_date", existing["payment_date"]),
            "payment_method": data.get("payment_method", existing["payment_method"]),
            "payment_status": data.get("payment_status", existing["payment_status"]),
            "remarks": data.get("remarks", existing["remarks"])
        }
        
        db_update_payslip(id, updated_data)
        return JsonResponse({"message": f"Payslip {id} updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_payslip_view(request, id):
    try:
        existing = db_get_payslip_item(id)
        if not existing:
            return JsonResponse({"error": f"Payslip with ID {id} not found"}, status=404)
            
        db_delete_payslip(id)
        return JsonResponse({"message": f"Payslip {id} deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
