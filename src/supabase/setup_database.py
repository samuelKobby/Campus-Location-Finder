from pathlib import Path
from client import supabase_admin
import os

def setup_database():
    """Setup the database tables and initial data"""
    try:
        # Read the SQL file
        sql_file = Path(__file__).parent / 'create_pharmacy.sql'
        with open(sql_file, 'r') as file:
            sql = file.read()
        
        # Split the SQL into individual statements
        statements = sql.split(';')
        
        # Execute each statement separately
        for statement in statements:
            if statement.strip():
                result = supabase_admin.rpc('exec_sql', {'query': statement.strip()})
                print(f"Executed statement successfully")
        
        print("Database setup completed successfully!")
        return True
    except Exception as e:
        print(f"Error setting up database: {str(e)}")
        return False

if __name__ == "__main__":
    setup_database()
