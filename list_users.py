from database import get_collections

cols = get_collections()
if cols and cols["users"] is not None:
    users = list(cols["users"].find())
    print("Users in DB:", users)
    
    # Update to Rayyan
    cols["users"].update_many({}, {"$set": {"name": "Rayyan"}})
    print("Updated users!")
