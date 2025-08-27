from django.core.files.storage import Storage
from supabase import create_client
import uuid
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "media")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class SupabaseStorage(Storage):
    """Custom Django Storage backend for Supabase."""

    def _save(self, name, content):
        """
        Uploads a file to Supabase and returns the path to store in DB.
        """
        folder = os.path.dirname(name)  # "videos", "banners", etc.
        basename = os.path.basename(name)
        unique_name = f"{uuid.uuid4().hex}_{basename}"
        path_in_bucket = f"{folder}/{unique_name}" if folder else unique_name

        # Upload content
        response = supabase.storage.from_(BUCKET_NAME).upload(path_in_bucket, content.read())
        if hasattr(response, "error") and response.error:
            raise Exception(f"Supabase upload error: {response.error}")

        # Return path to store in DB
        return path_in_bucket

    def delete(self, name):
        if not name:
            return
        try:
            # name = "videos/uuid_filename.mp4"
            supabase.storage.from_(BUCKET_NAME).remove([name])
            print(f"Deleted from Supabase: {name}")
        except Exception as e:
            print(f"Error deleting {name} from Supabase: {e}")


    def url(self, name):
        """Return the public URL of a file."""
        if not name:
            return ""
        return supabase.storage.from_(BUCKET_NAME).get_public_url(name)

    def exists(self, name):
        """Always allow overwriting files with same name."""
        return False
