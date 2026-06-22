from database import connect_to_mongo
cols = connect_to_mongo()
m_col = cols["memories"]
print("Count:", m_col.count_documents({}))
