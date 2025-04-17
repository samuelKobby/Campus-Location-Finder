from pathlib import Path
from client import supabase_admin

def setup_exec_function():
    """Setup the exec_sql function in Supabase"""
    try:
        # Read the SQL file
        sql_file = Path(__file__).parent / 'create_exec_function.sql'
        with open(sql_file, 'r') as file:
            sql = file.read()
        
        # Execute the SQL directly using REST API
        response = supabase_admin.rest.from_('').execute(sql)
        print("Exec function created successfully!")
        return True
    except Exception as e:
        print(f"Error creating exec function: {str(e)}")
        return False

if __name__ == "__main__":
    setup_exec_function()
