from supabase import create_client, Client
import os

# ---------------- CONFIG ----------------
SUPABASE_URL = os.getenv("SUPABASE_URL") 
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  
BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "media")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# ----------------------------------------

def upload_file(file_obj, dest_path: str = None, public: bool = True):
    try:
        if not dest_path:
            dest_path = f"uploads/{file_obj.name}"

        response = supabase.storage.from_(BUCKET_NAME).upload(dest_path, file_obj.read())

        if response.error:
            return {"success": False, "error": response.error}
        
        result = {"success": True, "path": dest_path}
        
        if public:
            result["public_url"] = supabase.storage.from_(BUCKET_NAME).get_public_url(dest_path)
        
        return result

    except Exception as e:
        return {"success": False, "error": str(e)}
