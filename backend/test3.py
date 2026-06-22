from database import connect_to_mongo
cols = connect_to_mongo()
m_col = cols["memories"]
print("Actual count:", m_col.count_documents({}))
for d in m_col.find():
    print(d["memoryId"], len(d.get("content", "")))
