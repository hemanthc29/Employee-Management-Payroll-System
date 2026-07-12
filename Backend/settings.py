import os
from django.http import HttpResponse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SECRET_KEY = 'django-insecure-employee-payroll-system-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
]

# Custom CORS Middleware to allow requests from frontend
class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse()
        else:
            response = self.get_response(request)
        
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken, Authorization"
        return response

MIDDLEWARE = [
    'Backend.settings.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'Backend.urls'

TEMPLATES = []

WSGI_APPLICATION = 'Backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db_dummy.sqlite3'),  # Django needs a dummy db configuration, but we use db.py
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
