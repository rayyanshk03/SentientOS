from database import connect_to_mongo

cols = connect_to_mongo()
if cols and cols["conversations"] is not None:
    convs = list(cols["conversations"].find())
    print("Conversations in DB:", len(convs))
    for c in convs:
        print(c.get("sessionId"), len(c.get("messages", [])))
