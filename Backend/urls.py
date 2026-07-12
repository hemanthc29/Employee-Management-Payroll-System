from django.urls import path
from Backend.views import (
    add_employee_view, get_employees_view, update_employee_view, delete_employee_view,
    add_department_view, get_departments_view, update_department_view, delete_department_view,
    add_attendance_view, get_attendance_view, update_attendance_view, delete_attendance_view,
    add_payroll_view, get_payroll_view, update_payroll_view, delete_payroll_view,
    add_payslip_view, get_payslips_view, update_payslip_view, delete_payslip_view
)

urlpatterns = [
    # Employee Management
    path('employees/add/', add_employee_view, name='add_employee'),
    path('employees/', get_employees_view, name='get_employees'),
    path('employees/update/<int:id>/', update_employee_view, name='update_employee'),
    path('employees/delete/<int:id>/', delete_employee_view, name='delete_employee'),

    # Department Management
    path('departments/add/', add_department_view, name='add_department'),
    path('departments/', get_departments_view, name='get_departments'),
    path('departments/update/<int:id>/', update_department_view, name='update_department'),
    path('departments/delete/<int:id>/', delete_department_view, name='delete_department'),

    # Attendance Management
    path('attendance/add/', add_attendance_view, name='add_attendance'),
    path('attendance/', get_attendance_view, name='get_attendance'),
    path('attendance/update/<int:id>/', update_attendance_view, name='update_attendance'),
    path('attendance/delete/<int:id>/', delete_attendance_view, name='delete_attendance'),

    # Payroll Management
    path('payroll/add/', add_payroll_view, name='add_payroll'),
    path('payroll/', get_payroll_view, name='get_payroll'),
    path('payroll/update/<int:id>/', update_payroll_view, name='update_payroll'),
    path('payroll/delete/<int:id>/', delete_payroll_view, name='delete_payroll'),

    # Salary Slip Management
    path('payslips/add/', add_payslip_view, name='add_payslip'),
    path('payslips/', get_payslips_view, name='get_payslips'),
    path('payslips/update/<int:id>/', update_payslip_view, name='update_payslip'),
    path('payslips/delete/<int:id>/', delete_payslip_view, name='delete_payslip'),
]
