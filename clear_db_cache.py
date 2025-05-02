from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

# Create a minimal Flask app with the same database configuration
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

def clear_database_cache():
    """Clear all database tables and recreate them (effectively clearing the cache)"""
    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("All database tables dropped successfully.")
        
        # Recreate all tables
        db.create_all()
        print("Database tables recreated successfully.")
        
        print("Database cache has been cleared.")

if __name__ == "__main__":
    # Check if the database file exists in the instance folder
    instance_db_path = os.path.join('instance', 'quiz.db')
    root_db_path = 'quiz.db'
    
    if os.path.exists(instance_db_path):
        print(f"Found database at {instance_db_path}")
    elif os.path.exists(root_db_path):
        print(f"Found database at {root_db_path}")
    else:
        print("No existing database found. Will create a new one.")
    
    # Clear the database cache
    clear_database_cache()
    
    print("\nNote: You will need to recreate any sample data or user accounts.")
    print("To do this, run your sample data creation script if you have one.")
