import os
import sys
from django.core.wsgi import get_wsgi_application

# Add parent folder of Backend to python path so Django can import Backend
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
application = get_wsgi_application()
