import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/eCommerce")

def get_db():
    """
    Returns the pymongo Database object for the eCommerce database.
    """
    client = MongoClient(MONGO_URI)
    # Extract the database name from URI or default to "eCommerce"
    db_name = MONGO_URI.split("/")[-1].split("?")[0] or "eCommerce"
    return client[db_name]
