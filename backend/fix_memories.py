from database import connect_to_mongo
import datetime

cols = connect_to_mongo()
if cols and cols.get("memories") is not None:
    # Update sess_soWXYHn0c7P6mm1OiEfjiXS
    cols["memories"].update_one(
        {"memoryId": "sess_soWXYHn0c7P6mm1OiEfjiXS"},
        {"$set": {
            "memoryId": "sess_soWXYHn0c7P6mm1OiEfjiXS",
            "content": "Need a fast backend and robust relational database for the MVP.\n\nDecision:\n- Use FastAPI for the backend to ensure high performance and async capabilities.\n- Use PostgreSQL as the primary relational database to guarantee ACID compliance.\n- Integrate SQLAlchemy for ORM modeling to accelerate development speed.\n- Deploy using Docker containers to ensure environment parity across staging and production.",
            "updatedAt": datetime.datetime.utcnow()
        }},
        upsert=True
    )
    
    # Update sess_6RQUFXg9HSBLsbXMumKzrS
    cols["memories"].update_one(
        {"memoryId": "sess_6RQUFXg9HSBLsbXMumKzrS"},
        {"$set": {
            "memoryId": "sess_6RQUFXg9HSBLsbXMumKzrS",
            "content": "Need a fast backend and robust relational database for the MVP.\n\nDecision:\n- Selected Python/FastAPI due to the team's existing expertise and the rapid prototyping benefits.\n- Decided against NoSQL (MongoDB) for the core data because we require strict relational integrity for user accounts and billing.\n- Will use Alembic for database migrations to keep track of schema changes efficiently.\n- Setup GitHub Actions to run automated testing against a test postgres database on every pull request.",
            "updatedAt": datetime.datetime.utcnow()
        }},
        upsert=True
    )
    print("Updated specific memories in MongoDB!")
