import os
from datetime import datetime, timezone
from fastapi import APIRouter, Request
from database import get_collections
from parcle import save_memory, query_memory

router = APIRouter()

@router.post("/setup")
async def setup_identity(request: Request):
    try:
        body = await request.json()
        name = body.get("name", "")
        role = body.get("role", "")
        tech_stack = body.get("techStack", [])
        coding_style = body.get("codingStyle", "")
        project_description = body.get("projectDescription", "")
        
        project_id = os.getenv("ENTER_PROJECT_ID", "eternal-architect")
        
        # 1. Save to Parcle
        title = f"User Identity — {name}"
        tech_str = ", ".join(tech_stack)
        content = f"Name: {name}. Role: {role}.\nTech stack: {tech_str}.\nCoding style: {coding_style}.\nProject: {project_description}."
        tags = ["identity", "user-context", "permanent", project_id]
        
        await save_memory(title, content, tags)
        
        # 2. Save to MongoDB
        cols = get_collections()
        if cols and cols.get("users") is not None:
            user_doc = {
                "name": name,
                "role": role,
                "techStack": tech_stack,
                "codingStyle": coding_style,
                "projectDescription": project_description,
                "createdAt": datetime.now(timezone.utc)
            }
            cols["users"].insert_one(user_doc)
            
        return {"success": True, "message": "I will remember you forever."}
    except Exception as e:
        print(f"[Identity] Error in setup: {e}")
        return {"success": False, "error": str(e)}

@router.get("")
async def get_identity():
    try:
        # Query MongoDB
        cols = get_collections()
        mongo_user = None
        if cols and cols.get("users") is not None:
            # Get latest user record
            mongo_user = cols["users"].find_one({}, sort=[("createdAt", -1)])
            
        # Combine/return data
        if mongo_user:
            # remove _id as it's not serializable out of the box
            if "_id" in mongo_user:
                del mongo_user["_id"]
            return mongo_user
            
        return {
            "name": "",
            "role": "",
            "techStack": [],
            "codingStyle": "",
            "projectDescription": ""
        }
    except Exception as e:
        print(f"[Identity] Error in get: {e}")
        return {"error": str(e)}

@router.delete("")
async def delete_identity():
    try:
        cols = get_collections()
        if cols and cols.get("users") is not None:
            cols["users"].delete_many({})
        return {"success": True, "message": "Identity reset successful."}
    except Exception as e:
        print(f"[Identity] Error resetting: {e}")
        return {"success": False, "error": str(e)}
