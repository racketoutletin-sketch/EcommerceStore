# backend/common/supabase_storage.py
import uuid
from supabase import create_client
from django.conf import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def upload_file(bucket_name: str, file_path: str, file_obj):
    """Upload a file to Supabase Storage."""
    try:
        # Ensure bytes
        file_bytes = file_obj.read()
        file_obj.seek(0)

        resp = supabase.storage.from_(bucket_name).upload(file_path, file_bytes)

        return resp
    except Exception as e:
        print(f"Upload failed: {e}")
        raise

def get_public_url(bucket_name: str, file_path: str) -> str:
    return supabase.storage.from_(bucket_name).get_public_url(file_path)
