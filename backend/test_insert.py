from database import connect_to_mongo
cols = connect_to_mongo()
m_col = cols["memories"]

m_col.insert_one({"memoryId": "test_insert", "content": "Hello World!"})
print("Inserted.")
print("Count:", m_col.count_documents({}))
doc = m_col.find_one({"memoryId": "test_insert"})
print("Found doc:", doc)
m_col.delete_many({"memoryId": "test_insert"})
