from database import connect_to_mongo

cols = connect_to_mongo()
if cols and cols["users"] is not None:
    users = list(cols["users"].find())
    print("Users in DB BEFORE:", users)
    
    # Update to Rayyan
    cols["users"].update_many({}, {"$set": {"name": "Rayyan"}})
    
    users = list(cols["users"].find())
    print("Users in DB AFTER:", users)
    print("Updated users!")
